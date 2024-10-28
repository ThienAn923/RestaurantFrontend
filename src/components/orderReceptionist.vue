<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { ClockIcon, Check } from 'lucide-vue-next';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useOrderStore } from './pinia/order.store';
import { useInvoiceStore } from './pinia/invoice.store';
import socket from '../socket';

const orderStore = useOrderStore();
const invoiceStore = useInvoiceStore();
const isDialogOpen = ref(false);
const selectedOrder = ref(null);

onMounted(() => {
    socket.connect();
    socket.on("orderUpdated", (order) => {
        orderStore.orders.push(order);
    });
    // socket.on("orderUpdated", (orderUpdated) => {
    //     console.log("Hello, im from socket order2");
    //     const orderIndex = orderStore.orders.findIndex(order => order.id === orderUpdated.id);

    //     if (orderIndex !== -1) {
    //         // Cập nhật thông tin của đơn hàng với thông tin từ orderUpdated

    //         Object.assign(orderStore.orders[orderIndex], orderUpdated);
    //         orderStore.fetchOrders(1);
    //         console.log('Order updated:', orderUpdated); // log để kiểm tra
    //     } else {
    //         console.log('Order not found for update:', orderUpdated.id);
    //     }
    // });

    socket.on("orderDeleted", (id) => {
        const orderIndex = orderStore.orders.findIndex(order => order.id === id);

        if (orderIndex !== -1) {
            orderStore.orders.splice(orderIndex, 1); // Xóa đơn hàng khỏi mảng orderStore.orders
            console.log('Order deleted:', id); // log để kiểm tra
        } else {
            console.log('Order not found for deletion:', id);
        }
    });
    orderStore.fetchOrders(1);
    orderStore.fetchOrderDetails();
});

const finishedOrders = computed(() => {
    return orderStore.orders.filter(order => order.orderStatus === 'finished');
});

const formatTime = (date: string) => {
    const dateTime = new Date(date);
    return dateTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const openDialog = (order) => {
    selectedOrder.value = order;
    orderStore.selectedOrderDetails = orderStore.orderDetails.filter(detail => detail.orderID === order.id);
    isDialogOpen.value = true;
};

const closeDialog = () => {
    isDialogOpen.value = false;
};

const handlePayment = () => {
    // Logic for payment will be implemented later

    invoiceStore.createInvoice(selectedOrder.value?.id);
    // console.log('Order:', JSON.stringify(selectedOrder.value));
    // console.log('Payment for order:', selectedOrder.value?.id);
    closeDialog();
};
</script>

<template>
    <div class="min-h-screen bg-gray-100 p-4">
        <div class="w-full mx-auto">
            <h1 class="text-3xl md:text-4xl font-bold mb-6 text-gray-900">Finished Orders</h1>

            <div class="grid grid-cols-1 lg:grid-cols-4 xl:grid-cols-4 gap-6">
                <Card v-for="(order, index) in finishedOrders" :key="order.id"
                    class="bg-white rounded-lg shadow-md overflow-hidden transition-shadow hover:shadow-lg">
                    <CardHeader>
                        <div class="flex justify-between items-center gap-x-6">
                            <CardTitle>Order #{{ index + 1 }}</CardTitle>
                            <Badge class="bg-green-400 text-white">
                                Finished
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div class="flex justify-between items-center text-sm text-gray-600">
                            <span class="flex items-center">
                                <ClockIcon class="w-4 h-4 mr-1" />
                                {{ formatTime(order.createAt) }}
                            </span>
                            <span class="flex items-center">
                                Bàn số {{ order.tableID }}
                            </span>
                        </div>
                    </CardContent>
                    <CardFooter class="bg-gray-50 border-t border-gray-200 flex align-middle py-4">
                        <div class="flex align-middle justify-center items-center gap-2 w-full">
                            <Button @click="openDialog(order)" class="flex-1 bg-blue-500 hover:bg-blue-600 text-white">
                                <Check class="w-4 h-4 mr-2 text-white" />
                                Chờ thanh toán
                            </Button>
                        </div>
                    </CardFooter>
                </Card>
            </div>
        </div>

        <Dialog v-model:open="isDialogOpen">
            <DialogContent class="sm:max-w-[525px]">
                <DialogHeader>
                    <DialogTitle>Order Details</DialogTitle>
                    <DialogDescription>
                        Order ID: {{ selectedOrder?.id }}
                    </DialogDescription>
                </DialogHeader>
                <div class="grid gap-4 py-4">
                    <div class="grid grid-cols-2 items-center gap-4">
                        <span class="font-medium">Trạng thái:</span>
                        <Badge class="bg-green-500 text-white">
                            {{ selectedOrder?.orderStatus }}
                        </Badge>
                    </div>
                    <div class="grid grid-cols-2 items-center gap-4">
                        <span class="font-medium">Bàn số:</span>
                        <span>{{ selectedOrder?.tableID }}</span>
                    </div>
                    <div class="grid grid-cols-2 items-center gap-4">
                        <span class="font-medium">Nhân viên tạo:</span>
                        <span>{{ selectedOrder?.employeeID }}</span>
                    </div>
                    <div class="grid grid-cols-2 items-center gap-4">
                        <span class="font-medium">Thời gian đặt đơn:</span>
                        <span>{{ formatTime(selectedOrder?.createAt) }}</span>
                    </div>
                </div>
                <ScrollArea class="h-[200px] w-full rounded-md border overflow-auto">
                    <div class="p-4">
                        <div class="flex font-medium">
                            <div class="w-[50px]">STT</div>
                            <div class="flex-1">Món ăn</div>
                            <div class="w-[100px] text-right">Số lượng</div>
                        </div>
                        <div class="mt-2">
                            <div v-for="(item, index) in orderStore.selectedOrderDetails" :key="item.id"
                                class="flex py-2 border-t first:border-t-0">
                                <div class="w-[50px]">{{ index + 1 }}</div>
                                <div class="flex-1">{{ item.dishId }}</div>
                                <div class="w-[100px] text-right">{{ item.quantity }}</div>
                            </div>
                        </div>
                    </div>
                </ScrollArea>

                <DialogFooter>
                    <Button @click="handlePayment" class="bg-blue-500 hover:bg-blue-600 text-white">Thanh toán</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    </div>
</template>
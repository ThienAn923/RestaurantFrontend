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
import { toVietnamese } from '@/lib/toVietnamese';


const orderStore = useOrderStore();
const invoiceStore = useInvoiceStore();
const isDialogOpen = ref(false);
const selectedOrder = ref<string | undefined>(new Date().toISOString()); //aint no way this is null, don't let it be null/undefined lol

interface Order {
    id: string;
    orderStatus: string;
    employeeID: string;
    orderNote: string;
    tableID: string;
    updateAt: string;
    createAt: string;
    forDate: Date
    Table: {
        tableNumber: number;
    };
    OrderDetail: Array<{
        id: string;
        dishId: string;
        quantity: number;
        orderID: string;
        updateAt: string;
        createAt: string;
        orderDetailStatus: string;
        Dish: {
            name: string;
            timeToCook: number;
            costs: Array<{
                id: string;
                dishId: string;
                cost: number;
                createAt: string;
            }>;
        };
    }>;
    Employee: {
        person: {
            name: string;
        };
    };
}

onMounted(() => {
    socket.connect();
    socket.on("orderUpdated", (order) => {
        orderStore.orders.push(order);
    });

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
    console.log('Finished orders:', finishedOrders.value);
    return orderStore.orders.filter(order => order.orderStatus === 'finished');

});

const formatTime = (date: string) => {
    const dateTime = new Date(date);
    return dateTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const openDialog = async (order) => {
    try {
        // console.log("Fetching order data...");
        const fetchedOrder = await orderStore.fetchOrderByID(order.id);
        // console.log("YOOOOOOOOOOOO", JSON.stringify(fetchedOrder));
        selectedOrder.value = fetchedOrder; // Lấy thông tin đơn hàng theo id
        // console.log(JSON.stringify(selectedOrder.value));
        orderStore.selectedOrderDetails = orderStore.orderDetails.filter(detail => detail.orderID === order.id);
        isDialogOpen.value = true;
    }
    catch (err) {
        console.log(err);
    }
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
            <h1 class="text-3xl md:text-4xl font-bold mb-6 text-gray-900">Đơn Đã Hoàn Thành</h1>

            <div class="grid grid-cols-1 lg:grid-cols-4 xl:grid-cols-4 gap-6">
                <Card v-for="(order, index) in finishedOrders" :key="order.id"
                    class="bg-white rounded-lg shadow-md overflow-hidden transition-shadow hover:shadow-lg">
                    <CardHeader>
                        <div class="flex justify-between items-center gap-x-6">
                            <CardTitle>Đơn Món #{{ index + 1 }}</CardTitle>
                            <Badge class="bg-green-400 text-white">
                                {{ toVietnamese(order.orderStatus) }}
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
            <DialogContent class="sm:max-w-[850px]">
                <DialogHeader>
                    <DialogTitle>Chi Tiết Đơn Món</DialogTitle>
                    <DialogDescription>
                        Order ID: {{ selectedOrder?.id }}
                    </DialogDescription>
                </DialogHeader>
                <div class="grid grid-cols-2 gap-4 py-4">
                    <div class="flex items-center gap-2">
                        <span class="font-medium">Trạng thái:</span>
                        <Badge :class="{
                            'bg-pink-500 text-white': selectedOrder?.orderStatus === 'new',
                            'bg-red-500 text-white': selectedOrder?.orderStatus === 'cooking',
                            'bg-green-500 text-white': selectedOrder?.orderStatus === 'finished',
                            'bg-gray-500 text-white': selectedOrder?.orderStatus !== 'new' && selectedOrder?.orderStatus !== 'cooking' && selectedOrder?.orderStatus !== 'finished'
                        }">
                            {{ toVietnamese(selectedOrder?.orderStatus) }}
                        </Badge>
                    </div>
                    <div class="flex items-center gap-2">
                        <span class="font-medium">Bàn số:</span>
                        <span>{{ selectedOrder?.Table.tableNumber }}</span>
                    </div>
                    <div class="flex items-center gap-2">
                        <span class="font-medium">Nhân viên tạo:</span>
                        <span>{{ selectedOrder?.Employee.person.name }}</span>
                    </div>
                    <div class="flex items-center gap-2">
                        <span class="font-medium">Thời gian đặt đơn:</span>
                        <span>{{ formatTime(selectedOrder?.createAt) }}</span>
                    </div>
                </div>
                <ScrollArea class="h-[300px] w-full rounded-md border overflow-auto">
                    <div class="p-4">
                        <div class="grid grid-cols-12 gap-4 font-medium mb-2">
                            <div class="col-span-1">STT</div>
                            <div class="col-span-4">Món ăn</div>
                            <div class="col-span-1 text-center">SL</div>
                            <div class="col-span-2 text-center">Thời gian</div>
                            <div class="col-span-2 text-center">Trạng thái</div>
                        </div>
                        <div class="space-y-2">
                            <div v-for="(item, index) in selectedOrder?.OrderDetail" :key="item.id"
                                class="grid grid-cols-12 gap-4 py-2 border-t first:border-t-0 items-center">
                                <div class="col-span-1">{{ index + 1 }}</div>
                                <div class="col-span-4 truncate">{{ item.Dish.name }}</div>
                                <div class="col-span-1 text-center">{{ item.quantity }}</div>
                                <div class="col-span-2 text-center">{{ item.Dish.timeToCook }} phút</div>
                                <div class="col-span-2 text-center">
                                    <Badge :class="{
                                        'bg-pink-500 text-white': item.orderDetailStatus === 'new',
                                        'bg-red-500 text-white': item.orderDetailStatus === 'cooking',
                                        'bg-green-500 text-white': item.orderDetailStatus === 'finished'
                                    }">
                                        {{ toVietnamese(item.orderDetailStatus) }}
                                    </Badge>
                                </div>
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
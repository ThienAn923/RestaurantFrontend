<template>
  <div class="min-h-screen bg-gray-100 p-4 md:p-8">
    <div class="w-full mx-auto">
      <h1 class="text-3xl md:text-4xl font-bold mb-8 text-gray-900">Kitchen Display System</h1>
      <div class="mb-6 flex flex-wrap gap-2">
        <Button
          v-for="status in ['Tất cả', 'Đơn mới', 'Đang nấu', 'Hoàn thành']"
          :key="status"
          @click="currentFilter = status"
          :class="{
            'bg-pink-500 text-white hover:bg-pink-600': status === 'Đơn mới' && currentFilter === 'Đơn mới',
            'bg-red-500 text-white hover:bg-red-600': status === 'Đang nấu' && currentFilter === 'Đang nấu',
            'bg-green-500 text-white hover:bg-green-600': status === 'Hoàn thành' && currentFilter === 'Hoàn thành',
            'bg-white text-gray-800 hover:bg-gray-100': currentFilter !== status
          }"
        >
          {{ status }}
        </Button>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        <Card
          v-for="(order, index) in filteredOrders"
          :key="order.id"
          class="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow duration-300"
          @click="openDialog(order)"
        >
          <CardHeader>
            <div class="flex justify-between items-center gap-x-6">
              <CardTitle>Order #{{ index + 1 }}</CardTitle>
              <Badge :class="{
                  'bg-pink-500 text-white': order.orderStatus === 'new',
                  'bg-red-500 text-white': order.orderStatus === 'cooking',
                  'bg-green-500 text-white': order.orderStatus === 'finished',
                  'bg-gray-500 text-white': order.orderStatus !== 'new' && order.orderStatus !== 'cooking' && order.orderStatus !== 'finished'
                }"
              >
                {{ order.orderStatus }}
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
          <CardFooter class="bg-gray-50 border-t border-gray-200">
            <div class="flex gap-2 w-full">
              <Button
                v-if="order.orderStatus === 'new'"
                @click.stop="updateOrderStatus(order.id, 'cooking')"
                class="flex-1 bg-red-600 hover:bg-red-700 text-white"
              >
                <UtensilsIcon class="w-4 h-4 mr-2" />
                Bắt đầu nấu
              </Button>
              <Button
  v-if="order.orderStatus === 'cooking'"
  @click.stop="updateOrderStatus(order.id, 'finished')"
  class="flex-1 bg-green-500 hover:bg-green-600 text-white"
>
  <Check class="w-4 h-4 mr-2 text-white" />
  Hoàn thành
</Button>

            </div>
          </CardFooter>
        </Card>
      </div>
    </div>

    <!-- Dialog hiển thị chi tiết đơn hàng -->
    <Dialog v-model:open="isDialogOpen">
      <DialogTrigger as-child>
      </DialogTrigger>
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
            <Badge 
            :class="{
                  'bg-pink-500 text-white': selectedOrder?.orderStatus === 'new',
                  'bg-red-500 text-white': selectedOrder?.orderStatus === 'cooking',
                  'bg-green-500 text-white':selectedOrder?.orderStatus === 'finished',
                  'bg-gray-500 text-white': selectedOrder?.orderStatus !== 'new' && selectedOrder?.orderStatus !== 'cooking' && selectedOrder?.orderStatus !== 'finished'
                }">
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
      <div
        v-for="(item, index) in orderStore.selectedOrderDetails"
        :key="item.id"
        class="flex py-2 border-t first:border-t-0"
      >
        <div class="w-[50px]">{{ index + 1 }}</div>
        <div class="flex-1">{{ item.dishId }}</div>
        <div class="w-[100px] text-right">{{ item.quantity }}</div>
      </div>
    </div>
  </div>
</ScrollArea>

        <DialogFooter>
          <Button @click="closeDialog">Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { ClockIcon, UtensilsIcon, RefreshCwIcon, CheckCheckIcon, Check } from 'lucide-vue-next';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { useOrderStore } from '../components/pinia/order.store';
import socket from '../socket';

const orderStore = useOrderStore();
const currentFilter = ref('Tất cả');
const isDialogOpen = ref(false);
const selectedOrder = ref(null); // Thêm biến để lưu đơn hàng đã chọn

onMounted(() => {
  socket.connect();
  socket.on("orderAdded", (order) => {
    orderStore.orders.push(order);
  });
  orderStore.fetchOrders(1);
  orderStore.fetchOrderDetails();
});

const filteredOrders = computed(() => {
  if (currentFilter.value === 'Tất cả') return orderStore.orders;

  return orderStore.orders.filter(order => {
    switch (currentFilter.value) {
      case 'Đơn mới':
        return order.orderStatus === 'new';
      case 'Đang nấu':
        return order.orderStatus === 'cooking';
      case 'Hoàn thành':
        return order.orderStatus === 'finished';
      default:
        return true;
    }
  });
});

const updateOrderStatus = async (id: string, newStatus: string) => {
  const order = orderStore.orders.find(order => order.id === id);
  if (order) {
    await orderStore.updateOrder({ ...order, orderStatus: newStatus });
  }
};

// Định dạng lại thời gian
const formatTime = (date: string) => {
  const dateTime = new Date(date);
  return dateTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

// Mở dialog và cập nhật thông tin đơn hàng đã chọn
const openDialog = (order) => {
  selectedOrder.value = order;
  orderStore.selectedOrderDetails = orderStore.orderDetails.filter(detail => detail.orderID === order.id);
  isDialogOpen.value = true;
};

const closeDialog = () => {
  isDialogOpen.value = false;
};
</script>

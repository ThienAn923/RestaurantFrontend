<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { ClockIcon, UtensilsIcon, RefreshCwIcon, CheckCheckIcon, Check, CalendarIcon } from 'lucide-vue-next';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useOrderStore } from '../components/pinia/order.store';
import socket from '../socket';
import { toVietnamese } from '@/lib/toVietnamese';
import Datepicker from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css';

const orderStore = useOrderStore();
const currentFilter = ref('Tất cả');
const isDialogOpen = ref(false);
const selectedOrder = ref<Order | null>(null);
const selectedDate = ref(new Date());

interface Order {
  id: string;
  orderStatus: string;
  employeeID: string;
  orderNote: string;
  tableID: string;
  updateAt: string;
  createAt: string;
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
    orderDetailStatus: string; // New field
    Dish: {
      name: string;
      timeToCook: number; // New field
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
  socket.on("orderAdded", (order) => {
    orderStore.orders.push(order);
  });

  socket.on("orderUpdated", (orderUpdated) => {
    const orderIndex = orderStore.orders.findIndex(order => order.id === orderUpdated.id);
    if (orderIndex !== -1) {
      Object.assign(orderStore.orders[orderIndex], orderUpdated);
      orderStore.fetchOrders(1);
      console.log('Order updated:', orderUpdated);
    } else {
      console.log('Order not found for update:', orderUpdated.id);
    }
  });

  socket.on("orderDeleted", (id) => {
    const orderIndex = orderStore.orders.findIndex(order => order.id === id);
    if (orderIndex !== -1) {
      orderStore.orders.splice(orderIndex, 1);
      console.log('Order deleted:', id);
    } else {
      console.log('Order not found for deletion:', id);
    }
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

const updateOrderDetailStatus = async (orderDetail: any) => {
  if (orderDetail.orderDetailStatus === 'new') {
    orderDetail.orderDetailStatus = 'cooking';
  } else if (orderDetail.orderDetailStatus === 'cooking') {
    orderDetail.orderDetailStatus = 'finished';
  }
  await orderStore.updateOrderDetail(orderDetail);
};

const formatTime = (date: string) => {
  const dateTime = new Date(date);
  return dateTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const openDialog = async (order) => {
  try {
    console.log("Fetching order data...");
    const fetchedOrder = await orderStore.fetchOrderByID(order.id);
    selectedOrder.value = fetchedOrder;
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


const formatDate = (date: Date) => {
  return date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};
</script>

<template>
  <div class="min-h-screen bg-gray-100 p-4 ">
    <div class="w-full mx-auto">
      <h1 class="text-3xl md:text-4xl font-bold mb-6 text-gray-900">Xem Đơn Hàng Hiện Có</h1>
      <div class="mb-6 flex flex-wrap gap-2 ">
        <div class="flex gap-2">
          <Button v-for="status in ['Tất cả', 'Đơn mới', 'Đang nấu', 'Hoàn thành']" :key="status"
            @click="currentFilter = status" :class="{
              'bg-pink-500 text-white hover:bg-pink-600': status === 'Đơn mới' && currentFilter === 'Đơn mới',
              'bg-red-500 text-white hover:bg-red-600': status === 'Đang nấu' && currentFilter === 'Đang nấu',
              'bg-green-500 text-white hover:bg-green-600': status === 'Hoàn thành' && currentFilter === 'Hoàn thành',
              'bg-white text-gray-800 hover:bg-gray-100': currentFilter !== status
            }">
            {{ status }}
          </Button>
        </div>
        <div class="relative">
          <Popover>
            <PopoverTrigger>
              <Button variant="outline" class="ml-2">
                <CalendarIcon class="mr-2 h-4 w-4" />
                {{ formatDate(selectedDate) }}
              </Button>
            </PopoverTrigger>
            <PopoverContent class="p-0">
              <Datepicker v-model="selectedDate" locale="vi" :enable-time-picker="false" auto-apply :format="formatDate"
                menu-class-name="dp-menu" input-class-name="dp-input" />
            </PopoverContent>
          </Popover>
        </div>

      </div>

      <div class="grid grid-cols-1 lg:grid-cols-4 xl:grid-cols-4 gap-6">
        <Card v-for="(order, index) in filteredOrders" :key="order.id"
          class="bg-white rounded-lg shadow-md overflow-hidden transition-shadow hover:shadow-lg"
          @click="openDialog(order)">
          <CardHeader>
            <div class="flex justify-between items-center gap-x-6">
              <CardTitle>Đơn Món #{{ index + 1 }}</CardTitle>
              <Badge :class="{
                'bg-pink-400 text-white': order.orderStatus === 'new',
                'bg-red-400 text-white': order.orderStatus === 'cooking',
                'bg-green-400 text-white': order.orderStatus === 'finished',
                'bg-gray-400 text-white': order.orderStatus !== 'new' && order.orderStatus !== 'cooking' && order.orderStatus !== 'finished'
              }">
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
            <div class="flex align-middle justify-center items-center gap-2 w-full ">
              <Button v-if="order.orderStatus === 'new'" @click.stop="updateOrderStatus(order.id, 'cooking')"
                class="flex-1 bg-red-600 hover:bg-red-700 text-white">
                <UtensilsIcon class="w-4 h-4 mr-2" />
                Bắt đầu nấu
              </Button>
              <Button v-if="order.orderStatus === 'cooking'" @click.stop="updateOrderStatus(order.id, 'finished')"
                class="flex-1 bg-green-500 hover:bg-green-600 text-white">
                <Check class="w-4 h-4 mr-2 text-white" />
                Hoàn thành
              </Button>
              <Button v-if="order.orderStatus === 'finished'" class="flex-1 bg-blue-500 hover:bg-blue-600 text-white">
                <Check class="w-4 h-4 mr-2 text-white" />
                Chờ thanh toán
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>

    <!-- Dialog hiển thị chi tiết đơn hàng -->
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
              <div class="col-span-2"></div>
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
                <div class="col-span-2 text-right">
                  <Button @click="updateOrderDetailStatus(item)" :disabled="item.orderDetailStatus === 'finished'"
                    class="px-2 py-1 text-xs" :class="{
                      'bg-red-500 hover:bg-red-600': item.orderDetailStatus === 'new',
                      'bg-green-500 hover:bg-green-600': item.orderDetailStatus === 'cooking',
                      'bg-gray-400': item.orderDetailStatus === 'finished'
                    }">
                    {{ item.orderDetailStatus === 'new' ? 'Start cooking' :
                      item.orderDetailStatus === 'cooking' ? 'Done cooking' : 'Finished' }}
                  </Button>
                </div>
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


<style>
.dp-menu {
  @apply bg-white rounded-md shadow-lg border border-gray-200;
}

.dp-input {
  @apply hidden;
}

:root {
  --dp-background-color: theme('colors.white');
  --dp-text-color: theme('colors.gray.900');
  --dp-hover-color: theme('colors.gray.100');
  --dp-hover-text-color: theme('colors.gray.900');
  --dp-hover-icon-color: theme('colors.gray.900');
  --dp-primary-color: theme('colors.gray.900');
  --dp-primary-text-color: theme('colors.white');
  --dp-secondary-color: theme('colors.gray.100');
  --dp-border-color: theme('colors.gray.300');
  --dp-menu-border-color: theme('colors.gray.300');
}
</style>
<script setup lang="ts">
import { ref, watch, computed, onMounted } from 'vue'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { SearchIcon, Plus, AlertCircle, Minus, } from 'lucide-vue-next'
import { ScrollArea } from '@/components/ui/scroll-area'

import axiosInstance, { ApiResponse } from './services/axiosInstance'
import { useAuthStore } from './pinia/auth.js'
import { useDishStore } from './pinia/dish.store'
//Lmao old page, no store yet XD, gotta make a type manually then fetch it
// import { userTableStore } from './pinia/table.store'
import { useOrderStore } from './pinia/order.store'
import { formatCurrency } from '@/lib/formatMoney.js'
import { useToast } from "@/components/ui/toast";
import TestComponent from './testComponent.vue';
import { hasPermission, ROLES } from './utils/permission'



// const tableStore = userTableStore();
const dishStore = useDishStore();
// const orderStore = useOrderStore();
const authStore = useAuthStore();
const { toast } = useToast()
const selectedDate = ref<string>(new Date().toISOString()) //Nope, this aint nullable, my order gonna break if it's null


const dishes = ref<Dish[]>([]);
const dishTypes = ref<DishType[]>([]);
const tables = ref<Table[]>([]);

onMounted(async () => {
  dishStore.fetchDish(1);
  // tableStore.fetchTables();
  try {
    // Fetch tables
    const tablesResponse = await fetch('http://localhost:3000/api/table/usableTable')
    const tablesData = await tablesResponse.json()
    tables.value = tablesData.map((table) => ({
      id: table.id,
      tableNumber: table.tableNumber,
      numberOfSeats: table.seatNumber,
      status: table.tableStatus,
    }))
  } catch (error) {
    console.error(error)
  }

  // dishStore.fetchDishTypes();

  const dishesResponse = await fetch('http://localhost:3000/api/dish');
  const dishesData = await dishesResponse.json();
  dishes.value = dishesData.data.map((dish: any) => {
    // If the dish has images, use the link of the first image as the imageUrl
    // If the dish doesn't have images, use a default image link
    const imageUrl = dish.images.length > 0 ? dish.images[0].Link : 'vite.svg';
    dish.images[0] = imageUrl;
    // Return a new object that has all the original dish properties plus imageUrl
    return { ...dish };
  });

  const dishTypesResponse = await fetch('http://localhost:3000/api/dishType');
  const dishTypesData = await dishTypesResponse.json();
  // dishTypes.value = dishTypesData;
  dishTypes.value = dishTypesData.map((type: any) => ({
    id: type.id,
    name: type.DishTypeName,
  }));
  // console.log(JSON.stringify(dishTypes.value));
});



// interface Dish {
//   id: string;
//   name: string;
//   description: string;
//   cost: number[];
//   imageUrl: string;
//   available: boolean;
// }
interface Table {
  id: string;
  tableNumber: number;
  numberOfSeats: number;
  tableStatus: boolean;
}

interface DishType {
  id: string;
  name: string;
}

interface Cost {
  id: string;
  dishId: string;
  cost: number;
  createAt: string;
}


interface Dish {
  id: string;
  name: string;
  description: string;
  available: boolean;
  DishType: {
    id: string;
    DishTypeName: string;
  };
  isDeleted: boolean;
  updateAt: string;
  createAt: string;
  promotionID: string | null;
  costs: Cost[];
  images: string[];
}

//unused, place it here for later
function checkPermission() {
  const requiredRoles = [ROLES.ADMIN]; // Define the roles required to add a dish type
  console.log(authStore.userRole, requiredRoles);
  if (!hasPermission(authStore.userRole, requiredRoles)) {
    toast({
      title: 'Forbidden',
      description: 'You do not have permission to add, edit, or delete an',
    });
    return false;
  }
  return true;
}

const selectedDish = ref<Dish | undefined>(undefined);
const searchQuery = ref('');
const filterStatus = ref('AllStatus');
const statusOptions = [
  { label: 'Còn Phục Vụ', value: 'Available' },
  { label: 'Hết Phục Vụ', value: 'Unavailable' },
];
const filterType = ref('AllType');

const isInfoModalOpen = ref(false);

const openInfoDialog = async (dishID: string) => {
  try {
    const fetchedDish = await dishStore.fetchDishByID(dishID);
    // console.log(dishID);
    // console.log(JSON.stringify(dishStore.fetchDishByID(dishID)));
    selectedDish.value = fetchedDish; // Lấy thông tin đơn hàng theo id
    // console.log("Yooooooooo", selectedDish.value);
    isInfoModalOpen.value = true;
  }
  catch (err) {
    console.log(err);
  }
};

watch(() => selectedDish.value?.available, (newVal) => {
  console.log("selectedDish.value.available changed to:", newVal);
});

//Because i cannot bind the value of the switch to the selectedDish.available using v-model
// i have to create a function to update the state of the selectedDish
const updateState = () => {
  selectedDish.value!.available = !selectedDish.value!.available;
};

const resetFilters = () => {
  searchQuery.value = ''
  filterStatus.value = 'AllStatus'
  filterType.value = 'AllType'
  searchDish();
}

async function searchDish() {
  dishStore.setFilter(filterStatus.value);
  dishStore.setSearch(searchQuery.value);
  dishStore.setFilterType(filterType.value);

  await dishStore.fetchDish(1);
  // console.log("Data is here: ", JSON.stringify(dishStore.dish));
  dishes.value = dishStore.dish.map((dish: any) => {
    //If no img, use default img
    const imageUrl = dish.images.length > 0 ? dish.images[0].Link : 'vite.svg';
    dish.images[0] = imageUrl;
    return { ...dish };
  });
}

watch([filterStatus, filterType], async () => {
  searchDish();
});


//it's both get and format
const getSelectedDate = (date: any) => {
  const { year, month, day } = date;
  const formattedDate = new Date(year, month - 1, day).toISOString(); // i have no idea why i have to +1 to get the correct value lmao
  selectedDate.value = formattedDate;
  console.log("Selected date from DishesManagementOrder: ", formattedDate);
  // console.log("Selected date from DishesManagementOrder: ", formattedDate);
}













interface Order {
  employeeID: string;
  orderNote: string;
  tableID: string;
  OrderDetail: OrderDetail[];
}

interface OrderDetail {
  dishId: string;
  quantity: number;
}

interface OrderItem {
  id: string
  name: string
  price: number
  quantity: number
  image: string
}

const selectedTable = ref('')
const orderNote = ref('')
const orderItems = ref<OrderItem[]>([

])

const addDishToOrder = (dish: Dish) => {
  const orderItem: OrderItem = {
    id: dish.id,
    name: dish.name,
    price: dish.costs[0]?.cost || 0,
    quantity: 1,
    image: dish.images[0] || 'vite.svg',
  };
  if (dish.available === false) {
    toast({
      title: 'Món ăn không còn phục vụ',
      description: 'Vui lòng chọn món khác',
    });
    return;
  }
  const existingItem = orderItems.value.find(item => item.id === dish.id);
  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    orderItems.value.push(orderItem);
    console.log(JSON.stringify(orderItems.value));
  }
};

const subtotal = computed(() =>
  orderItems.value.reduce((sum, item) => sum + item.price * item.quantity, 0)
)

const discount = computed(() =>
  orderItems.value.reduce((sum, item) => sum + item.price * item.quantity, 0)
)

const updateQuantity = (id: string, newQuantity: number) => {
  if (newQuantity < 1) return
  orderItems.value = orderItems.value.map(item =>
    item.id === id ? { ...item, quantity: newQuantity } : item
  )
}



const makeOrder = async () => {
  const employeeId = authStore.employeeId; // Get EmployeeID from the store
  console.log(authStore.user, authStore.employeeId, authStore.name);

  if (!employeeId) {
    console.error('EmployeeID is not available');
    return;
  }

  watch(() => selectedDate.value, (newVal) => {
    console.log("selectedDate.value changed to:", newVal);
  });

  try {
    const response = await axiosInstance.post<ApiResponse<Order>>("/order", {
      tableID: selectedTable.value,
      employeeID: employeeId, // Include EmployeeID in the order
      orderNote: orderNote.value,
      forDate: selectedDate.value,
      OrderDetail: orderItems.value.map(item => ({
        dishId: item.id,
        quantity: item.quantity,
      })),
    });
    console.log('Order successful:', JSON.stringify(response.data));

    // Clear all information from the make order form
    selectedTable.value = ''; // Reset selected table
    orderNote.value = ''; // Clear order note
    orderItems.value = []; // Clear all order items
    discount.value = 0; // Reset discount if you have one

    toast({
      title: 'Đặt Đơn Thành Công',
      description: 'Đơn món đã được chuyển đến bộ phận nấu ăn',
    });

  } catch (error) {
    // console.error('Order failed:', error.response ? error.response.data : error.message);
    // You might want to show an error message to the user
    alert('Failed to submit order. Please try again.');
  }
};
const removeItem = (id: String) => {
  orderItems.value = orderItems.value.filter(item => item.id !== id)
}



</script>

<template>
  <div class="h-full w-full bg-gray-50">
    <div class="p-6">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-3xl font-bold">Quản lý món ăn</h1>
      </div>

      <div class="mb-4 flex space-x-4">
        <div class="relative flex-grow w-full">
          <Input v-model="searchQuery" placeholder="Tìm kiếm theo tên, nhấn enter để tìm" class="pl-10"
            @keyup.enter="searchDish" />
          <SearchIcon class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
        </div>
        <Select v-model="filterStatus">
          <SelectTrigger class="w-[200px] ">
            <SelectValue placeholder="Trạng Thái" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="AllStatus">Tất Cả Trạng Thái</SelectItem>
            <SelectItem v-for="option in statusOptions" :key="option.value" :value="option.value">
              {{ option.label }}
            </SelectItem>
          </SelectContent>
        </Select>
        <Select v-model="filterType">
          <SelectTrigger class="w-[200px]">
            <SelectValue placeholder="Loại Món" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="AllType">Tất Cả Loại</SelectItem>
            <SelectItem v-for="option in dishTypes" :key="option.id" :value="option.id">
              {{ option.name }}
            </SelectItem>
          </SelectContent>
        </Select>
        <Button @click="resetFilters" variant="outline">Reset Bộ Lọc</Button>
      </div>



      <div class="flex h-screen bg-gray-100">
        <!-- Dish Management Panel -->

        <ScrollArea class="flex-1 p-6 overflow-auto">
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card v-for="dish in dishes" :key="dish.id"
              class="bg-white rounded-lg shadow-md overflow-hidden transition-shadow hover:shadow-lg">
              <img :src="dish.images[0]" :alt="dish.name" class="w-full h-48 object-cover"
                @click="addDishToOrder(dish)" />
              <CardContent class="p-4" @click="openInfoDialog(dish.id)">
                <h2 class="text-xl font-semibold mb-2">{{ dish.name }}</h2>
                <p class="text-gray-600 mb-2">{{ dish.description }}</p>
                <div class="flex justify-between items-center mb-4">
                  <span class="text-lg font-bold">{{ dish.costs?.length > 0 ? formatCurrency(dish.costs[0].cost) :
                    'N/A'
                    }}</span>
                  <span :class="[
                    'px-2 py-1 rounded-full text-sm',
                    dish.available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  ]">
                    {{ dish.available ? 'Còn Phục Vụ' : 'Hết Phục Vụ' }}
                  </span>
                </div>

              </CardContent class="p-4">
            </Card>
          </div>

        </ScrollArea>

        <!-- Order Panel -->
        <scrollArea>
          <div class="w-[400px] bg-white border-l border-gray-200 overflow-auto">
            <div class="p-6">
              <h2 class="text-xl font-semibold mb-6">Lập Đơn</h2>

              <div class="flex items-center space-x-4 mb-6">
                <Select v-model="selectedTable" class="w-full">
                  <SelectTrigger>
                    <SelectValue placeholder="Select a table" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem v-for="table in tables" :key="table.id" :value="table.id">
                      {{ table.tableNumber }}
                    </SelectItem>
                  </SelectContent>
                </Select>

                <TestComponent @date-selected="getSelectedDate" ref="testConponentRef" />
              </div>

              <div class="grid grid-cols-[2fr_60px_60px] gap-4 mb-4">
                <div class="text-sm font-medium">Item</div>
                <div class="text-sm font-medium text-center">Qty</div>
                <div class="text-sm font-medium text-right">Price</div>
              </div>

              <ScrollArea class="h-[400px] -mr-6 pr-6">
                <div class="space-y-4">
                  <div v-for="item in orderItems" :key="item.id"
                    class="grid grid-cols-[2fr_60px_60px] gap-4 items-center">
                    <div class="flex gap-3 cursor-pointer" @click="removeItem(item.id)">
                      <img :src="item.image" :alt="item.name" class="w-10 h-10 rounded-lg object-cover" />
                      <div>
                        <div class="text-sm font-medium">{{ item.name }}</div>
                        <div class="text-sm text-gray-500">{{ formatCurrency(item.price) }}</div>
                      </div>
                    </div>
                    <div class="flex items-center justify-center">
                      <div class="flex items-center border rounded">
                        <button @click="updateQuantity(item.id, item.quantity - 1)"
                          class="w-6 h-6 flex items-center justify-center hover:bg-gray-100">
                          <Minus class="w-3 h-3" />
                        </button>
                        <Input type="number" :value="item.quantity"
                          @input="e => updateQuantity(item.id, parseInt(e.target.value))"
                          class="w-8 h-6 text-center p-0 border-none" />
                        <button @click="updateQuantity(item.id, item.quantity + 1)"
                          class="w-6 h-6 flex items-center justify-center hover:bg-gray-100">
                          <Plus class="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                    <div class="text-sm text-right">
                      {{ formatCurrency(item.price * item.quantity) }}
                    </div>
                  </div>
                </div>
              </ScrollArea>

              <div class="mt-6">
                <Textarea v-model="orderNote" placeholder="Order note..." class="min-h-[100px] border-gray-200" />
              </div>

              <div class="mt-6 space-y-2">
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-2">
                    <!-- <span class="text-gray-500">Tổng Khuyến Mãi Cho Món Ăn</span> -->
                    <!-- <AlertCircle class="w-4 h-4 text-gray-400" /> -->
                  </div>
                  <!-- <span>{{ discount.toFixed(2) }}</span> -->
                </div>
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-2">
                    <span class="text-gray-500">Tổng Cộng </span>
                    <AlertCircle class="w-4 h-4 text-gray-400" />
                  </div>
                  <span>{{ formatCurrency(subtotal) }}</span>
                </div>
              </div>

              <Button class="w-full mt-6 bg-blue-500 hover:bg-blue-600 text-white"
                :disabled="!selectedTable || orderItems.length === 0" @click="makeOrder">
                Hoàn Thành Đơn
              </Button>
            </div>
          </div>
        </scrollArea>
      </div>





    </div>

    <!-- Info Dish Modal -->
    <Dialog v-model:open="isInfoModalOpen">
      <DialogContent class="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Thông tin món ăn</DialogTitle>
        </DialogHeader>
        <form class="space-y-4">
          <div v-if="selectedDish">
            <Label for="name">Dish Name</Label>
            <Input id="name" v-model="selectedDish.name" readonly />
          </div>

          <div v-if="selectedDish">
            <Label for="description">Description</Label>
            <Textarea id="description" v-model="selectedDish.description" readonly />
          </div>

          <div v-if="selectedDish">
            <Label for="price">Price</Label>
            <Input id="price" v-model="selectedDish.costs[0].cost" type="number" step="0.01" readonly />
          </div>

          <div v-if="selectedDish">
            <Label for="dishType">Dish Type</Label>
            <Select v-model="selectedDish.DishType.id" disabled>
              <SelectTrigger>
                <SelectValue :value="selectedDish.DishType.DishTypeName || 'Select a dish type'" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem v-for="type in dishTypes" :key="type.id" :value="type.id">
                  {{ type.name }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div class="flex items-center space-x-2" v-if="selectedDish">
            <Switch id="available" @update:checked="updateState" :checked="selectedDish.available" disabled />
            <Label for="available">Available</Label>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  </div>
</template>

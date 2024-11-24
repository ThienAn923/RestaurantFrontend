<script setup lang="ts">
import { ref, watch, watchEffect } from 'vue'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { onMounted } from 'vue'
import { useDishStore } from './pinia/dish.store'
import { SearchIcon, Edit, Trash2, Plus } from 'lucide-vue-next'
import CardFooter from './ui/card/CardFooter.vue'
import { formatCurrency } from '../lib/formatMoney'
import { uploadImage } from './utils/cloudinary'
import { Progress } from '@/components/ui/progress'
import { useToast } from './ui/toast'


const dishStore = useDishStore();
const dishes = ref<Dish[]>([]);
const dishTypes = ref<DishType[]>([]);
const { toast } = useToast()

onMounted(async () => {
  dishStore.fetchDish(1);
  // dishStore.fetchDishTypes();

  const dishesResponse = await fetch('http://localhost:3000/api/dish');
  const dishesData = await dishesResponse.json();
  dishes.value = dishesData.data.map((dish: any) => {
    // If the dish has images, use the link of the first image as the imageUrl
    // If the dish doesn't have images, use a default image link
    const imageUrl = dish.images.length > 0 ? dish.images[0].Link : 'vite.svg';
    // console.log("AHHHHHHHHHHHHHH", dish.images[0]?.Link);
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
  images: Image[];
}

interface Image {
  id: string;
  Link: string;
  createAt: string;
  updateAt: string;
  dishId: string;
}

const isAddDishModalOpen = ref(false)
const isAddDishTypeModalOpen = ref(false)
const isEditDishModalOpen = ref(false)
const selectedDish = ref<Dish | undefined>(undefined);
const searchQuery = ref('');
const filterStatus = ref('AllStatus');
const statusOptions = [
  { label: 'Còn Phục Vụ', value: 'Available' },
  { label: 'Hết Phục Vụ', value: 'Unavailable' },
];
const filterType = ref('AllType');

const openDialog = async (dishID: string) => {
  try {
    const fetchedDish = await dishStore.fetchDishByID(dishID);
    // console.log(dishID);
    // console.log(JSON.stringify(dishStore.fetchDishByID(dishID)));
    selectedDish.value = fetchedDish; // Lấy thông tin đơn hàng theo id
    // console.log("Yooooooooo", selectedDish.value);
    isEditDishModalOpen.value = true;
  }
  catch (err) {
    console.log(err);
  }
};

const closeDialog = () => {
  isEditDishModalOpen.value = false;
};

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

const closeInfoDialog = () => {
  isInfoModalOpen.value = false;
};




const newDish = ref({
  name: '',
  description: '',
  price: '',
  available: true,
  dishType: '',
  images: [] as File[]
})

const openAddDishModal = () => {
  isAddDishModalOpen.value = true
}

const closeAddDishModal = () => {
  isAddDishModalOpen.value = false
  resetNewDishForm()
}

const openAddDishTypeModal = () => {
  isAddDishTypeModalOpen.value = true
}


const uploadedImageUrls = ref<string[]>([]);
const uploadProgress = ref(0);

// const handleImageUpload = async (event: Event) => {
//   const target = event.target as HTMLInputElement;
//   if (target.files) {
//     const files = Array.from(target.files);
//     newDish.value.images = files;

//     try {
//       const urls = await Promise.all(files.map(file => uploadImage(file)));
//       uploadedImageUrls.value = urls;
//       console.log('Images uploaded successfully:', urls);
//     } catch (error) {
//       console.error('Error uploading images:', error);
//     }
//   }
// };
const handleImageUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files) {
    const files = Array.from(target.files);
    newDish.value.images = files;

    try {
      // Simulate progress
      const simulateProgress = () => {
        uploadProgress.value = 0;
        const interval = setInterval(() => {
          if (uploadProgress.value < 90) {
            uploadProgress.value += Math.floor(Math.random() * 10) + 1;
          } else {
            clearInterval(interval);
          }
        }, 500);
        return interval;
      };

      const interval = simulateProgress();

      const urls = await Promise.all(files.map(file => uploadImage(file)));

      clearInterval(interval);
      uploadProgress.value = 100;

      setTimeout(() => {
        uploadProgress.value = 0;
      }, 500);

      uploadedImageUrls.value = urls;
      console.log('Images uploaded successfully:', urls);
    } catch (error) {
      console.error('Error uploading images:', error);
    }
  }
};

const submitDish = async () => {
  // Prepare the data to send to the backend
  console.log("AHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHH");
  console.log("Uploaded image urls: ", uploadedImageUrls.value[0]);
  const data = {
    DishName: newDish.value.name,
    DishDescription: newDish.value.description,
    Cost: newDish.value.price,
    DishType: newDish.value.dishType,
    imageLinks: uploadedImageUrls.value,
  };

  // Send a POST request to your backend API
  const response = await fetch('http://localhost:3000/api/dish', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  // If the request was successful, refresh the dishes list
  if (response.ok) {
    const dish = await response.json();
    dishes.value.push(dish);
    closeAddDishModal();
  } else {
    // Handle error
    console.error('Failed to add dish');
  }
  closeAddDishModal();
};

// const editDish = async () => {
//   // Prepare the data to send to the backend
//   const data = {
//     id: selectedDish.value?.id,
//     name: selectedDish.value?.name,
//     description: selectedDish.value?.description,
//     cost: selectedDish.value?.costs[0].cost,
//     DishType: selectedDish.value?.DishType.id,
//     available: selectedDish.value?.available,
//     imageLinks: selectedDish.value?.images,
//   };
//   console.log(JSON.stringify(data));
//   dishStore.updateDish(data);
//   console.log("Yooooo", selectedDish.value?.DishType?.DishTypeName);
//   closeDialog();
// }

const editDish = async () => {
  // Prepare the data to send to the backend
  const data = {
    id: selectedDish.value?.id,
    name: selectedDish.value?.name,
    description: selectedDish.value?.description,
    cost: selectedDish.value?.costs[0].cost,
    DishType: selectedDish.value?.DishType.id,
    available: selectedDish.value?.available,
    imageLinks: selectedDish.value?.images ? [...selectedDish.value.images, ...uploadedImageUrls.value] : uploadedImageUrls.value,
  };
  console.log(JSON.stringify(data));
  dishStore.updateDish(data);
  console.log("Yooooo", selectedDish.value?.DishType?.DishTypeName);
  closeDialog();
};

watch(() => selectedDish.value?.available, (newVal) => {
  console.log("selectedDish.value.available changed to:", newVal);
});

//Because i cannot bind the value of the switch to the selectedDish.available using v-model
// i have to create a function to update the state of the selectedDish
const updateState = () => {
  selectedDish.value!.available = !selectedDish.value!.available;
};

const resetNewDishForm = () => {
  newDish.value = {
    name: '',
    description: '',
    price: '',
    available: true,
    dishType: '',
    image: null
  }
}

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

async function handleDelete(dishID: string) {
  try {
    const response = await dishStore.deleteDish(dishID);
    console.log(response);
  } catch {
    console.log("Error deleting dish");
  }
}


</script>

<template>
  <div class="h-full w-full bg-gray-50">
    <div class="p-6">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-3xl font-bold">Quản lý món ăn</h1>
        <div class="space-x-2">
          <Button @click="openAddDishModal" class="bg-blue-500 hover:bg-blue-600 text-white">
            <Plus class="w-4 h-4 mr-2" />
            Thêm Món Ăn
          </Button>
          <Button variant="outline" @click="openAddDishTypeModal">
            <Plus class="w-4 h-4 mr-2" />
            Thêm Loại Món Ăn
          </Button>
        </div>
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
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card v-for="dish in dishes" :key="dish.id"
          class="bg-white rounded-lg shadow-md overflow-hidden transition-shadow hover:shadow-lg">
          <img :src="dish.images[0]" :alt="dish.name" class="w-full h-48 object-cover"
            @click="openInfoDialog(dish.id)" />
          <CardContent class="p-4" @click="openInfoDialog(dish.id)">
            <h2 class="text-xl font-semibold mb-2">{{ dish.name }}</h2>
            <p class="text-gray-600 mb-2">{{ dish.description }}</p>
            <div class="flex justify-between items-center mb-4">
              <span class="text-lg font-bold">{{ dish.costs?.length > 0 ? formatCurrency(dish.costs[0].cost) : 'N/A'
                }}</span>
              <span :class="[
                'px-2 py-1 rounded-full text-sm',
                dish.available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              ]">
                {{ dish.available ? 'Còn Phục Vụ' : 'Hết Phục Vụ' }}
              </span>
            </div>

          </CardContent class="p-4">
          <CardFooter class="bg-gray-50 border-t border-gray-200 flex align-middle py-4">
            <div class="flex justify-end gap-2 w-full ">
              <Button variant="outline" size="sm" @click="openDialog(dish.id)">
                <Edit class="w-4 h-4 mr-2" />
                Chỉnh Sửa
              </Button>
              <Button variant="destructive" size="sm" @click="handleDelete(dish.id)">
                <Trash2 class="w-4 h-4 mr-2" />
                Xóa
              </Button>
            </div>
          </CardFooter>
        </Card>

      </div>
    </div>

    <!-- Add Dish Modal -->
    <Dialog v-model:open="isAddDishModalOpen">
      <DialogContent class="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Dish</DialogTitle>
          <DialogDescription>
            Enter the details of the new dish below. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <form @submit.prevent="submitDish" class="space-y-4">
          <div>
            <Label for="name">Dish Name</Label>
            <Input id="name" v-model="newDish.name" required />
          </div>

          <div>
            <Label for="description">Description</Label>
            <Textarea id="description" v-model="newDish.description" required />
          </div>

          <div>
            <Label for="price">Price</Label>
            <Input id="price" v-model="newDish.price" type="number" step="0.01" required />
          </div>

          <div>
            <Label for="dishType">Dish Type</Label>
            <Select v-model="newDish.dishType">
              <SelectTrigger>
                <SelectValue placeholder="Select a dish type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem v-for="type in dishTypes" :key="type.id" :value="type.id">
                  {{ type.name }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div class="flex items-center space-x-2">
            <Switch id="available" v-model="newDish.available" />
            <Label for="available">Available</Label>
          </div>

          <div>
            <Label for="image">Dish Image</Label>
            <Input id="image" type="file" accept="image/*" @change="handleImageUpload" />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" @click="closeAddDishModal">Cancel</Button>
            <Button type="submit" class="bg-blue-500 hover:bg-blue-600 text-white">Save Dish</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>

    <!-- Add Dish Type Modal (placeholder) -->
    <Dialog v-model:open="isAddDishTypeModalOpen">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Dish Type</DialogTitle>
        </DialogHeader>
        <!-- Add form for new dish type here -->
        <p>Dish Type form goes here</p>
        <DialogFooter>
          <Button @click="isAddDishTypeModalOpen = false">Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <!-- Edit Dish Modal -->
    <Dialog v-model:open="isEditDishModalOpen">
      <DialogContent class="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Sửa thông tin món ăn</DialogTitle>
          <DialogDescription>
            Nhập thông tin cho món ăn dưới đây.
          </DialogDescription>
        </DialogHeader>
        <form @submit.prevent="editDish" class="space-y-4">
          <div v-if="selectedDish">
            <Label for="name">Dish Name</Label>
            <Input id="name" v-model="selectedDish.name" required />
          </div>

          <div v-if="selectedDish">
            <Label for="description">Description</Label>
            <Textarea id="description" v-model="selectedDish.description" required />
          </div>

          <div v-if="selectedDish">
            <Label for="price">Price</Label>
            <Input id="price" v-model="selectedDish.costs[0].cost" type="number" step="0.01" required />
          </div>

          <div v-if="selectedDish">
            <Label for="dishType">Dish Type</Label>
            <Select v-model="selectedDish.DishType.id">
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
            <Switch id="available" @update:checked="updateState" :checked="selectedDish.available" />
            <Label for="available">Available</Label>
          </div>

          <div v-if="selectedDish">
            <Label for="image">Dish Image</Label>
            <!-- Add image link -->
            <div class="mb-4">
              <img :src="selectedDish.images[0].Link" alt="Dish Image" class="w-full h-48 object-cover"
                v-if="selectedDish.images.length > 0" />
            </div>
            <Input id="image" type="file" accept="image/*" @change="handleImageUpload" />
            <Progress v-if="uploadProgress > 0" v-model="uploadProgress" class="w-full mt-2" />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" @click="closeDialog">Cancel</Button>
            <Button type="submit" class="bg-blue-500 hover:bg-blue-600 text-white">Save Dish</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>

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

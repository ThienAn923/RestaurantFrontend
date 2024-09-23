<script setup lang="ts">
import { ref } from 'vue'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Plus } from 'lucide-vue-next'
import { onMounted } from 'vue'


const dishes = ref<Dish[]>([]);
const dishTypes = ref<DishType[]>([]);

onMounted(async () => {
  const dishesResponse = await fetch('http://localhost:3000/api/dish');
  const dishesData = await dishesResponse.json();
  dishes.value = dishesData.map((dish: any) => {
    // If the dish has images, use the link of the first image as the imageUrl
    // If the dish doesn't have images, use a default image link
    const imageUrl = dish.images.length > 0 ? dish.images[0].Link : 'vite.svg';
    
    // Return a new object that has all the original dish properties plus imageUrl
    return { ...dish, imageUrl };
  });

  const dishTypesResponse = await fetch('http://localhost:3000/api/dishType');
  const dishTypesData = await dishTypesResponse.json();
  // dishTypes.value = dishTypesData;
  dishTypes.value = dishTypesData.map((type: any) => ({
    id: type.id,
    name: type.DishTypeName,
  }));
});

interface Dish {
  id: string;
  name: string;
  description: string;
  cost: number[];
  imageUrl: string;
  available: boolean;
}

interface DishType {
  id: string;
  name: string;
}

// const dishes = ref<Dish[]>([
//   {
//     id: '1',
//     name: 'Spaghetti Carbonara',
//     description: 'Classic Italian pasta dish with eggs, cheese, and pancetta',
//     price: 12.99,
//     imageUrl: '/placeholder.svg?height=200&width=200',
//     available: true,
//   },
//   {
//     id: '2',
//     name: 'Margherita Pizza',
//     description: 'Traditional Neapolitan pizza with tomatoes, mozzarella, and basil',
//     price: 10.99,
//     imageUrl: '/placeholder.svg?height=200&width=200',
//     available: true,
//   },
//   // Add more dishes as needed
// ])

// const dishTypes = ref<DishType[]>([
//   { id: '1', name: 'Appetizer' },
//   { id: '2', name: 'Main Course' },
//   { id: '3', name: 'Dessert' },
//   // Add more dish types as needed
// ])

const isAddDishModalOpen = ref(false)
const isAddDishTypeModalOpen = ref(false)

const newDish = ref({
  name: '',
  description: '',
  price: '',
  available: true,
  dishType: '',
  image: null as File | null
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

const handleImageUpload = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files) {
    newDish.value.image = target.files[0]
  }
}

const submitDish = async () => {
  // Prepare the data to send to the backend
  const data = {
    DishName: newDish.value.name,
    DishDescription: newDish.value.description,
    Cost: newDish.value.price,
    DishType: newDish.value.dishType,
    imageLinks: newDish.value.image ? [newDish.value.image] : [],
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
</script>

<template>
  <div class="h-full w-full bg-gray-50">
    <div class="p-6">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-3xl font-bold">Dishes</h1>
        <div class="space-x-2">
          <Button @click="openAddDishModal">
            <Plus class="w-4 h-4 mr-2" />
            Add Dish
          </Button>
          <Button variant="outline" @click="openAddDishTypeModal">
            <Plus class="w-4 h-4 mr-2" />
            Add Dish Type
          </Button>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card v-for="dish in dishes" :key="dish.id" class="overflow-hidden">
          <img :src="dish.imageUrl" :alt="dish.name" class="w-full h-48 object-cover" />
          <CardContent class="p-4">
            <h2 class="text-xl font-semibold mb-2">{{ dish.name }}</h2>
            <p class="text-gray-600 mb-2">{{ dish.description }}</p>
            <div class="flex justify-between items-center">
              <span class="text-lg font-bold">${{ dish.costs?.length > 0 ? dish.costs[0].cost.toFixed(2) : 'N/A' }}</span>
              <span :class="[
                'px-2 py-1 rounded-full text-sm',
                dish.available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              ]">
                {{ dish.available ? 'Available' : 'Unavailable' }}
              </span>
            </div>
          </CardContent>
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
            <Button type="submit">Save Dish</Button>
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
  </div>
</template>
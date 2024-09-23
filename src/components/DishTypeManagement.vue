<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { PlusIcon, PencilIcon, Trash2Icon, ChevronLeftIcon, ChevronRightIcon } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useDishTypeStore } from './pinia/dishType.store'

const dishTypeStore = useDishTypeStore()

const isAddModalOpen = ref(false)
const isEditModalOpen = ref(false)
const currentDishType = ref({ id: '', DishTypeName: '', DishTypeDescription: '' })
const newDishType = ref({ DishTypeName: '', DishTypeDescription: '' })

onMounted(() => {
  dishTypeStore.fetchDishTypes(1)
})

const addDishType = async () => {
  await dishTypeStore.addDishType(newDishType.value)
  isAddModalOpen.value = false
  newDishType.value = { DishTypeName: '', DishTypeDescription: '' }
}

const openEditModal = (dishType: { id: string; DishTypeName: string; DishTypeDescription: string }) => {
  currentDishType.value = { ...dishType }
  isEditModalOpen.value = true
}

const editDishType = async () => {
  await dishTypeStore.updateDishType(currentDishType.value)
  isEditModalOpen.value = false
}

const deleteDishType = async (id: string) => {
  await dishTypeStore.deleteDishType(id)
}

const pageNumbers = computed(() => {
  const totalPages = dishTypeStore.totalPages
  const currentPage = dishTypeStore.currentPage
  const pages = []

  if (totalPages <= 4) {
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i)
    }
  } else {
    if (currentPage <= 3) {
      pages.push(1, 2, 3, 4, '...', totalPages)
    } else if (currentPage >= totalPages - 2) {
      pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages)
    } else {
      pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages)
    }
  }

  return pages
})

const goToPage = (page: number) => {
  dishTypeStore.fetchDishTypes(page)
}
</script>

<template>
  <div class="h-full w-full bg-gray-50 overflow-auto p-6">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold">Dish Types</h1>
      <Button @click="isAddModalOpen = true" size="sm">
        <PlusIcon class="mr-2 h-4 w-4" /> Add Dish Type
      </Button>
    </div>

    <div class="bg-white shadow-md rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Description</TableHead>
            <TableHead class="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-for="dishType in dishTypeStore.dishTypes" :key="dishType.id">
            <TableCell class="font-medium">{{ dishType.DishTypeName }}</TableCell>
            <TableCell>{{ dishType.DishTypeDescription }}</TableCell>
            <TableCell class="text-right">
              <Button
                variant="ghost"
                size="icon"
                @click="openEditModal(dishType)"
              >
                <PencilIcon class="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                @click="deleteDishType(dishType.id)"
              >
                <Trash2Icon class="h-4 w-4" />
              </Button>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>

    <!-- Pagination -->
    <div class="mt-4 flex items-center justify-between">
      <div class="text-sm text-gray-700">
        Showing {{ (dishTypeStore.currentPage - 1) * 5 + 1 }} to {{ Math.min(dishTypeStore.currentPage * 5, dishTypeStore.totalItems) }} of {{ dishTypeStore.totalItems }} entries
      </div>
      <div class="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          @click="goToPage(dishTypeStore.currentPage - 1)"
          :disabled="dishTypeStore.currentPage === 1"
        >
          <ChevronLeftIcon class="h-4 w-4" />
        </Button>
        <Button
          v-for="page in pageNumbers"
          :key="page"
          variant="outline"
          size="sm"
          :class="{ 'bg-primary text-primary-foreground': page === dishTypeStore.currentPage }"
          @click="typeof page === 'number' ? goToPage(page) : null"
          :disabled="typeof page !== 'number'"
        >
          {{ page }}
        </Button>
        <Button
          variant="outline"
          size="sm"
          @click="goToPage(dishTypeStore.currentPage + 1)"
          :disabled="dishTypeStore.currentPage === dishTypeStore.totalPages"
        >
          <ChevronRightIcon class="h-4 w-4" />
        </Button>
      </div>
    </div>

    <Dialog v-model:open="isAddModalOpen">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Dish Type</DialogTitle>
          <DialogDescription>
            Enter the details for the new dish type.
          </DialogDescription>
        </DialogHeader>
        <form @submit.prevent="addDishType" class="space-y-4">
          <div class="space-y-2">
            <Label for="name">Name</Label>
            <Input
              id="name"
              v-model="newDishType.DishTypeName"
              required
            />
          </div>
          <div class="space-y-2">
            <Label for="description">Description</Label>
            <Textarea
              id="description"
              v-model="newDishType.DishTypeDescription"
              required
            />
          </div>
          <DialogFooter>
            <Button type="submit">Add Dish Type</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>

    <Dialog v-model:open="isEditModalOpen">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Dish Type</DialogTitle>
          <DialogDescription>
            Make changes to the dish type.
          </DialogDescription>
        </DialogHeader>
        <form @submit.prevent="editDishType" class="space-y-4">
          <div class="space-y-2">
            <Label for="edit-name">Name</Label>
            <Input
              id="edit-name"
              v-model="currentDishType.DishTypeName"
              required
            />
          </div>
          <div class="space-y-2">
            <Label for="edit-description">Description</Label>
            <Textarea
              id="edit-description"
              v-model="currentDishType.DishTypeDescription"
              required
            />
          </div>
          <DialogFooter>
            <Button type="submit">Save Changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  </div>
</template>










<!-- <script setup lang="ts">
import { ref, onMounted } from 'vue'
import { PlusIcon, PencilIcon, Trash2Icon } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

interface DishType {
  id: string
  DishTypeName: string
  DishTypeDescription: string
}

const dishTypes = ref<DishType[]>([])

const isAddModalOpen = ref(false)
const isEditModalOpen = ref(false)
const currentDishType = ref<DishType>({ id: '', DishTypeName: '', DishTypeDescription: '' })
const newDishType = ref<Omit<DishType, 'id'>>({ DishTypeName: '', DishTypeDescription: '' })

onMounted(async () => {
  const dishTypesResponse = await fetch('http://localhost:3000/api/dishType')
  const dishTypesData = await dishTypesResponse.json()
  dishTypes.value = dishTypesData
})

const addDishType = async () => {
  try {
    const response = await fetch('http://localhost:3000/api/dishType', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newDishType.value),
    })
    if (response.ok) {
      const addedDishType = await response.json()
      dishTypes.value.push(addedDishType)
      isAddModalOpen.value = false
      newDishType.value = { DishTypeName: '', DishTypeDescription: '' }
    } else {
      console.error('Failed to add dish type')
    }
  } catch (error) {
    console.error('Error adding dish type:', error)
  }
}

const openEditModal = (dishType: DishType) => {
  currentDishType.value = { ...dishType }
  isEditModalOpen.value = true
}

const editDishType = async () => {
  const { id, ...dishTypeData } = currentDishType.value;
  try {
    const response = await fetch(`http://localhost:3000/api/dishType/${currentDishType.value.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dishTypeData),
    })

    if (response.ok) {
      const updatedDishType = await response.json()
      const index = dishTypes.value.findIndex(dt => dt.id === updatedDishType.id)
      if (index !== -1) {
        dishTypes.value[index] = updatedDishType
      }
      isEditModalOpen.value = false
    } else {
      console.error('Failed to update dish type')
    }
  } catch (error) {
    console.error('Error updating dish type:', error)
  }
}

const deleteDishType = async (id: string) => {
  try {
    const response = await fetch(`http://localhost:3000/api/dishType/${id}`, {
      method: 'DELETE',
    })
    if (response.ok) {
      dishTypes.value = dishTypes.value.filter(dt => dt.id !== id)
    } else {
      console.error('Failed to delete dish type')
    }
  } catch (error) {
    console.error('Error deleting dish type:', error)
  }
}
</script>

<template>
  <div class="h-full w-full bg-gray-50 overflow-auto p-6">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold">Dish Types</h1>
      <Button @click="isAddModalOpen = true" size="sm">
        <PlusIcon class="mr-2 h-4 w-4" /> Add Dish Type
      </Button>
    </div>

    <div class="bg-white shadow-md rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Description</TableHead>
            <TableHead class="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-for="dishType in dishTypes" :key="dishType.id">
            <TableCell class="font-medium">{{ dishType.DishTypeName }}</TableCell>
            <TableCell>{{ dishType.DishTypeDescription }}</TableCell>
            <TableCell class="text-right">
              <Button
                variant="ghost"
                size="icon"
                @click="openEditModal(dishType)"
              >
                <PencilIcon class="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                @click="deleteDishType(dishType.id)"
              >
                <Trash2Icon class="h-4 w-4" />
              </Button>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>

    <Dialog v-model:open="isAddModalOpen">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Dish Type</DialogTitle>
          <DialogDescription>
            Enter the details for the new dish type.
          </DialogDescription>
        </DialogHeader>
        <form @submit.prevent="addDishType" class="space-y-4">
          <div class="space-y-2">
            <Label for="name">Name</Label>
            <Input
              id="name"
              v-model="newDishType.DishTypeName"
              required
            />
          </div>
          <div class="space-y-2">
            <Label for="description">Description</Label>
            <Textarea
              id="description"
              v-model="newDishType.DishTypeDescription"
              required
            />
          </div>
          <DialogFooter>
            <Button type="submit">Add Dish Type</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>

    <Dialog v-model:open="isEditModalOpen">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Dish Type</DialogTitle>
          <DialogDescription>
            Make changes to the dish type.
          </DialogDescription>
        </DialogHeader>
        <form @submit.prevent="editDishType" class="space-y-4">
          <div class="space-y-2">
            <Label for="edit-name">Name</Label>
            <Input
              id="edit-name"
              v-model="currentDishType.DishTypeName"
              required
            />
          </div>
          <div class="space-y-2">
            <Label for="edit-description">Description</Label>
            <Textarea
              id="edit-description"
              v-model="currentDishType.DishTypeDescription"
              required
            />
          </div>
          <DialogFooter>
            <Button type="submit">Save Changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  </div>
</template> -->
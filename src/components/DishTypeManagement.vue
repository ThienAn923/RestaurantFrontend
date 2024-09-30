<!-- Message for future me: Please fix the toggle lmao (I mean, it work, but the method is kinda weird, scroll down to the switch section in add model and u'll see it) -->


<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { PlusIcon, PencilIcon, Trash2Icon, ChevronLeftIcon, ChevronRightIcon, ChevronUpIcon, ChevronDownIcon, CheckCircleIcon, XCircleIcon } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { useDishTypeStore } from './pinia/dishType.store'

const dishTypeStore = useDishTypeStore()

const isAddModalOpen = ref(false)
const isEditModalOpen = ref(false)
const currentDishType = ref({ id: '', DishTypeName: '', DishTypeDescription: '', DishTypeAvailable: true, createAt: '' })
const newDishType = ref({ DishTypeName: '', DishTypeDescription: '', DishTypeAvailable: true })

onMounted(() => {
  dishTypeStore.fetchDishTypes(1)
})

const addDishType = async () => {
  console.log('Adding dish type:', newDishType.value) // debug stuff, dont mind this line
  await dishTypeStore.addDishType(newDishType.value)
  isAddModalOpen.value = false
  newDishType.value = { DishTypeName: '', DishTypeDescription: '', DishTypeAvailable: true }
}

const openEditModal = (dishType: { id: string; DishTypeName: string; DishTypeDescription: string; DishTypeAvailable: boolean; createAt: string }) => {
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

const sortTable = (column: string) => {
  if (dishTypeStore.sortColumn === column) {
    dishTypeStore.setSorting(column, dishTypeStore.sortOrder === 'asc' ? 'desc' : 'asc')
  } else {
    dishTypeStore.setSorting(column, 'asc')
  }
  dishTypeStore.fetchDishTypes(1)
}

const getSortIcon = (column: string) => {
  if (dishTypeStore.sortColumn !== column) return null
  return dishTypeStore.sortOrder === 'asc' ? ChevronUpIcon : ChevronDownIcon
}

//Lol, this function exist to fix the bug where the switch got LOCK for some freaking reason
//Now, important message: isNewDishType is a boolean that determine whether the switch is in add modal or edit modal
//If the value pass in is true, it "unlock" the switch in add modal, if false, it "unlock" the switch in edit modal
//I know, it's weird, but it work, so i'll leave it like that
//lol
const toggleAvailability = (isNewDishType: boolean) => {
  if (isNewDishType) {
    newDishType.value.DishTypeAvailable = !newDishType.value.DishTypeAvailable
  } else {
    currentDishType.value.DishTypeAvailable = !currentDishType.value.DishTypeAvailable
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
            <TableHead @click="sortTable('DishTypeName')" class="cursor-pointer w-3/7">
              <div class="flex items-center justify-between">
                <span>Name</span>
                <component 
                  :is="getSortIcon('DishTypeName') || 'div'" 
                  class="w-4 h-4 ml-2"
                  :class="{'text-transparent': !getSortIcon('DishTypeName')}"
                />
              </div>
            </TableHead>
            <TableHead @click="sortTable('DishTypeDescription')" class="cursor-pointer w-2/5">
              <div class="flex items-center justify-between">
                <span>Description</span>
                <component 
                  :is="getSortIcon('DishTypeDescription') || 'div'" 
                  class="w-4 h-4 ml-2"
                  :class="{'text-transparent': !getSortIcon('DishTypeDescription')}"
                />
              </div>
            </TableHead>
            <TableHead @click="sortTable('DishTypeAvailable')" class="cursor-pointer">
              <div class="flex items-center justify-between">
                <span>Available</span>
                <component 
                  :is="getSortIcon('DishTypeAvailable') || 'div'" 
                  class="w-4 h-4 ml-2"
                  :class="{'text-transparent': !getSortIcon('DishTypeAvailable')}"
                />
              </div>
            </TableHead>
            <TableHead @click="sortTable('createAt')" class="cursor-pointer">
              <div class="flex items-center justify-between">
                <span>Create</span>
                <component 
                  :is="getSortIcon('createAt') || 'div'" 
                  class="w-4 h-4 ml-2"
                  :class="{'text-transparent': !getSortIcon('createAt')}"
                />
              </div>
            </TableHead>
            <TableHead class="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-for="dishType in dishTypeStore.dishTypes" :key="dishType.id" :class="{ 'bg-red-50': !dishType.DishTypeAvailable }">
            <TableCell class="font-medium">{{ dishType.DishTypeName }}</TableCell>
            <TableCell>{{ dishType.DishTypeDescription }}</TableCell>
            <TableCell>
              <div class="flex items-center">
                <component :is="dishType.DishTypeAvailable ? CheckCircleIcon : XCircleIcon" 
                           :class="dishType.DishTypeAvailable ? 'text-green-500' : 'text-red-500'"
                           class="w-5 h-5 mr-2" />
                {{ dishType.DishTypeAvailable ? 'Available' : 'Unavailable' }}
              </div>
            </TableCell>
            <TableCell>{{ new Date(dishType.createAt).toLocaleString() }}</TableCell>
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
          <div class="flex items-center space-x-2">
            <!-- Instead of binding using v-model (Which, some fucking how, don't work!!), i bind it through checked -->
            <Switch 
              id="available" 
              :checked="newDishType.DishTypeAvailable"
              @update:checked="toggleAvailability(true)"
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
          <div class="flex items-center space-x-2">
            <Switch 
              id="edit-available" 
              :checked="currentDishType.DishTypeAvailable"
              @update:checked="toggleAvailability(false)"
            />
            <Label for="edit-available">Available</Label>
          </div>
          <DialogFooter>
            <Button type="submit">Save Changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  </div>
</template>
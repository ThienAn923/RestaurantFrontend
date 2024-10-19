<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { PlusIcon, PencilIcon, Trash2Icon, ChevronLeftIcon, ChevronRightIcon, ChevronUpIcon, ChevronDownIcon, SearchIcon } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useIngredientStore } from './pinia/ingredient.store'

const ingredientStore = useIngredientStore()

const isAddIngredientModalOpen = ref(false)
const isEditIngredientModalOpen = ref(false)
const isAddIngredientTypeModalOpen = ref(false)
const currentIngredient = ref({ id: '', ingredientName: '', ingredientTypeID: '' })
const newIngredient = ref({ ingredientName: '', ingredientTypeID: '', createAt: new Date() })
const newIngredientType = ref({ ingredientTypeName: '', ingredientTypeDescription: '' })

const searchQuery = ref('')
const filterStatus = ref('')
const sortColumn = ref('ingredientName')
const sortOrder = ref<'asc' | 'desc'>('asc')

onMounted(async () => {
  await ingredientStore.fetchIngredients(1)
  await ingredientStore.fetchIngredientTypes()
})


const addIngredient = async () => {
  await ingredientStore.addIngredient(newIngredient.value)
  isAddIngredientModalOpen.value = false
  newIngredient.value = { ingredientName: '', ingredientTypeID: '' }
}

const openEditModal = (ingredient: { id: string; ingredientName: string; ingredientTypeID: string }) => {
  currentIngredient.value = { ...ingredient }
  isEditIngredientModalOpen.value = true
}

const editIngredient = async () => {
  await ingredientStore.updateIngredient(currentIngredient.value)
  isEditIngredientModalOpen.value = false
}

const deleteIngredient = async (id: string) => {
  await ingredientStore.deleteIngredient(id)
}

const addIngredientType = async () => {
  await ingredientStore.addIngredientType(newIngredientType.value)
  isAddIngredientTypeModalOpen.value = false
  newIngredientType.value = { ingredientTypeName: '', ingredientTypeDescription: '' }
}

const pageNumbers = computed(() => {
  const totalPages = ingredientStore.totalPages
  const currentPage = ingredientStore.currentPage
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

const sortTable = (column: string) => {
  if (sortColumn.value === column) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortColumn.value = column
    sortOrder.value = 'asc'
  }
  ingredientStore.setSorting(sortColumn.value, sortOrder.value)
  ingredientStore.fetchIngredients(1)
}

const getSortIcon = (column: string) => {
  if (sortColumn.value !== column) return null
  return sortOrder.value === 'asc' ? ChevronUpIcon : ChevronDownIcon
}

const goToPage = (page: number) => {
  ingredientStore.fetchIngredients(page)
}

const resetFilters = () => {
  searchQuery.value = ''
  filterStatus.value = 'AllTypes'
}

watch([filterStatus], () => {
  // alert(filterStatus.value)
  ingredientStore.setFilter(filterStatus.value);
  ingredientStore.fetchIngredients(1)
})
watch([searchQuery], () => {
  // alert(searchQuery.value)
  ingredientStore.setSearch(searchQuery.value);
  ingredientStore.fetchIngredients(1)
})
</script>

<template>
  <div class="h-full w-full bg-gray-50 overflow-auto p-6">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold">Ingredients</h1>
      <div class="space-x-2">
        <Button @click="isAddIngredientModalOpen = true" size="sm" class="bg-blue-500 hover:bg-blue-600 text-white">
          <PlusIcon class="mr-2 h-4 w-4" /> Add Ingredient
        </Button>
        <Button @click="isAddIngredientTypeModalOpen = true" size="sm" variant="outline">
          <PlusIcon class="mr-2 h-4 w-4" /> Add Ingredient Type
        </Button>
      </div>
    </div>

    <div class="mb-4 flex space-x-4">
      <div class="relative flex-grow">
        <Input
          v-model="searchQuery"
          placeholder="Tìm kiếm theo tên"
          class="pl-10"
        />
        <SearchIcon class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
      </div>
      <Select v-model="filterStatus">
        <SelectTrigger class="w-[200px]">
          <SelectValue placeholder="Filter by status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value = "AllTypes">All Types</SelectItem>
          <SelectItem v-for="type in ingredientStore.ingredientTypes" :key="type.id" :value="type.id">
            {{ type.ingredientTypeName }}
          </SelectItem>
        </SelectContent>
      </Select>
      <Button @click="resetFilters" variant="outline">Reset Filters</Button>
    </div>


    <div class="bg-white shadow-md rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead class="w-3/6 cursor-pointer" @click="sortTable('ingredientName')" >
              <div class="flex items-center justify-between">
                <span>Name</span>
                <component 
                  :is="getSortIcon('ingredientName') || 'div'" 
                  class="w-4 h-4 ml-2"
                  :class="{'text-transparent': !getSortIcon('ingredientName')}"
                />
              </div>
            </TableHead>
            <TableHead @click="sortTable('ingredientType')" class="cursor-pointer w-1/6">
              <div class="flex items-center justify-between">
                <span>Type</span>
                <component 
                  :is="getSortIcon('ingredientType') || 'div'" 
                  class="w-4 h-4 ml-2"
                  :class="{'text-transparent': !getSortIcon('ingredientType')}"
                />
              </div>
            </TableHead>
            <TableHead @click="sortTable('createAt')" class="cursor-pointer">
              <div class="flex items-center justify-between">
                <span>Created At</span>
                <component 
                  :is="getSortIcon('createAt') || 'div'" 
                  class="w-4 h-4 ml-2"
                  :class="{'text-transparent': !getSortIcon('createAt')}"
                />
              </div>
            </TableHead>
            <TableHead class="text-right"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-for="ingredient in ingredientStore.ingredients" :key="ingredient.id">
            <TableCell class="font-medium">{{ ingredient.ingredientName }}</TableCell>
            <TableCell>{{ ingredient.ingredientType.ingredientTypeName }}</TableCell>
            <TableCell>{{ new Date(ingredient.createAt).toLocaleString() }}</TableCell>
            <TableCell class="text-right">

              <Button
                variant="ghost"
                size="icon"
                @click="openEditModal(ingredient)"
                class="text-blue-600 hover:text-blue-600 hover:bg-blue-100"
              >
                <PencilIcon class="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                @click="deleteIngredient(ingredient.id)"
                class="text-red-500 hover:text-white hover:bg-red-500"
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
        Showing {{ (ingredientStore.currentPage - 1) * 5 + 1 }} to {{ Math.min(ingredientStore.currentPage * 5, ingredientStore.totalItems) }} of {{ ingredientStore.totalItems }} entries
      </div>
      <div class="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          @click="goToPage(ingredientStore.currentPage - 1)"
          :disabled="ingredientStore.currentPage === 1"
          class="text-gray-700 hover:bg-gray-100 disabled:opacity-50"
        >
          <ChevronLeftIcon class="h-4 w-4" />
        </Button>
        <Button
          v-for="page in pageNumbers"
          :key="page"
          variant="outline"
          size="sm"
          :class="{ 'bg-blue-500 text-white': page === ingredientStore.currentPage, 'text-gray-700 hover:bg-gray-100': page !== ingredientStore.currentPage }"
          @click="typeof page === 'number' ? goToPage(page) : null"
          :disabled="typeof page !== 'number'"
        >
          {{ page }}
        </Button>
        <Button
          variant="outline"
          size="sm"
          @click="goToPage(ingredientStore.currentPage + 1)"
          :disabled="ingredientStore.currentPage === ingredientStore.totalPages"
           class="text-gray-700 hover:bg-gray-100 disabled:opacity-50"
        >
          <ChevronRightIcon class="h-4 w-4" />
        </Button>
      </div>
    </div>

    <!-- Add Ingredient Modal -->
    <Dialog v-model:open="isAddIngredientModalOpen">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Ingredient</DialogTitle>
          <DialogDescription>
            Enter the details for the new ingredient.
          </DialogDescription>
        </DialogHeader>
        <form @submit.prevent="addIngredient" class="space-y-4">
          <div class="space-y-2">
            <Label for="name">Name</Label>
            <Input
              id="name"
              v-model="newIngredient.ingredientName"
              required
            />
          </div>
          <div class="space-y-2">
            <Label for="type">Type</Label>
            <Select v-model="newIngredient.ingredientTypeID" required>
              <SelectTrigger>
                <SelectValue placeholder="Select an ingredient type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem v-for="type in ingredientStore.ingredientTypes" :key="type.id" :value="type.id">
                  {{ type.ingredientTypeName }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button type="submit" class="bg-blue-500 hover:bg-blue-600 text-white">Add Ingredient</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>

    <!-- Edit Ingredient Modal -->
    <Dialog v-model:open="isEditIngredientModalOpen">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Ingredient</DialogTitle>
          <DialogDescription>
            Make changes to the ingredient.
          </DialogDescription>
        </DialogHeader>
        <form @submit.prevent="editIngredient" class="space-y-4">
          <div class="space-y-2">
            <Label for="edit-name">Name</Label>
            <Input
              id="edit-name"
              v-model="currentIngredient.ingredientName"
              required
            />
          </div>
          <div class="space-y-2">
            <Label for="edit-type">Type</Label>
            <Select v-model="currentIngredient.ingredientTypeID" required>
              <SelectTrigger>
                <SelectValue placeholder="Select an ingredient type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem v-for="type in ingredientStore.ingredientTypes" :key="type.id" :value="type.id">
                  {{ type.ingredientTypeName }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button type="submit">Save Changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>

    <!-- Add Ingredient Type Modal -->
    <Dialog v-model:open="isAddIngredientTypeModalOpen">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Ingredient Type</DialogTitle>
          <DialogDescription>
            Enter the details for the new ingredient type.
          </DialogDescription>
        </DialogHeader>
        <form @submit.prevent="addIngredientType" class="space-y-4">
          <div class="space-y-2">
            <Label for="type-name">Name</Label>
            <Input
              id="type-name"
              v-model="newIngredientType.ingredientTypeName"
              required
            />
          </div>
          <div class="space-y-2">
            <Label for="type-description">Description</Label>
            <Input
              id="type-description"
              v-model="newIngredientType.ingredientTypeDescription"
              required
            />
          </div>
          <DialogFooter>
            <Button type="submit" class="bg-blue-500 hover:bg-blue-600 text-white">Add Ingredient Type</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  </div>
</template>
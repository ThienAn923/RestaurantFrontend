<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { PlusIcon, PencilIcon, Trash2Icon, ChevronLeftIcon, ChevronRightIcon } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useIngredientTypeStore } from './pinia/ingredientType.store'

const IngredientTypeStore = useIngredientTypeStore()

const isAddModalOpen = ref(false)
const isEditModalOpen = ref(false)
const currentIngredientType = ref({ id: '', ingredientTypeName: '', ingredientTypeDescription: '' })
const newIngredientType = ref({ ingredientTypeName: '', ingredientTypeDescription: '' })

onMounted(() => {
  IngredientTypeStore.fetchIngredientTypes(1)
})

const addIngredientType = async () => {
  await IngredientTypeStore.addIngredientType(newIngredientType.value)
  isAddModalOpen.value = false
  newIngredientType.value = { ingredientTypeName: '', ingredientTypeDescription: '' }
}

const openEditModal = (ingredientType: { id: string; ingredientTypeName: string; ingredientTypeDescription: string }) => {
  currentIngredientType.value = { ...ingredientType }
  isEditModalOpen.value = true
}

const editIngredientType = async () => {
  await IngredientTypeStore.updateIngredientType(currentIngredientType.value)
  isEditModalOpen.value = false
}

const deleteIngredientType = async (id: string) => {
  await IngredientTypeStore.deleteIngredientType(id)
}

const pageNumbers = computed(() => {
  const totalPages = IngredientTypeStore.totalPages
  const currentPage = IngredientTypeStore.currentPage
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
  IngredientTypeStore.fetchIngredientTypes(page)
}
</script>

<template>
  <div class="h-full w-full bg-gray-50 overflow-auto p-6">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold">IngredientType</h1>
      <Button @click="isAddModalOpen = true" size="sm">
        <PlusIcon class="mr-2 h-4 w-4" /> Add IngredientType
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
          <TableRow v-for="ingredientType in IngredientTypeStore.ingredientTypes" :key="ingredientType.id">
            <TableCell class="font-medium">{{ ingredientType.ingredientTypeName }}</TableCell>
            <TableCell>{{ ingredientType.ingredientTypeDescription }}</TableCell>
            <TableCell class="text-right">
              <Button
                variant="ghost"
                size="icon"
                @click="openEditModal(ingredientType)"
              >
                <PencilIcon class="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                @click="deleteIngredientType(ingredientType.id)"
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
        Showing {{ (IngredientTypeStore.currentPage - 1) * 5 + 1 }} to {{ Math.min(IngredientTypeStore.currentPage * 5, IngredientTypeStore.totalItems) }} of {{ IngredientTypeStore.totalItems }} entries
      </div>
      <div class="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          @click="goToPage(IngredientTypeStore.currentPage - 1)"
          :disabled="IngredientTypeStore.currentPage === 1"
        >
          <ChevronLeftIcon class="h-4 w-4" />
        </Button>
        <Button
          v-for="page in pageNumbers"
          :key="page"
          variant="outline"
          size="sm"
          :class="{ 'bg-primary text-primary-foreground': page === IngredientTypeStore.currentPage }"
          @click="typeof page === 'number' ? goToPage(page) : null"
          :disabled="typeof page !== 'number'"
        >
          {{ page }}
        </Button>
        <Button
          variant="outline"
          size="sm"
          @click="goToPage(IngredientTypeStore.currentPage + 1)"
          :disabled="IngredientTypeStore.currentPage === IngredientTypeStore.totalPages"
        >
          <ChevronRightIcon class="h-4 w-4" />
        </Button>
      </div>
    </div>

    <Dialog v-model:open="isAddModalOpen">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New IngredientType</DialogTitle>
          <DialogDescription>
            Enter the details for the new ingredientType.
          </DialogDescription>
        </DialogHeader>
        <form @submit.prevent="addIngredientType" class="space-y-4">
          <div class="space-y-2">
            <Label for="name">Name</Label>
            <Input
              id="name"
              v-model="newIngredientType.ingredientTypeName"
              required
            />
          </div>
          <div class="space-y-2">
            <Label for="description">Description</Label>
            <Textarea
              id="description"
              v-model="newIngredientType.ingredientTypeDescription"
              required
            />
          </div>
          <DialogFooter>
            <Button type="submit">Add IngredientType</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>

    <Dialog v-model:open="isEditModalOpen">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit IngredientType</DialogTitle>
          <DialogDescription>
            Make changes to the ingredientType.
          </DialogDescription>
        </DialogHeader>
        <form @submit.prevent="editIngredientType" class="space-y-4">
          <div class="space-y-2">
            <Label for="edit-name">Name</Label>
            <Input
              id="edit-name"
              v-model="currentIngredientType.ingredientTypeName"
              required
            />
          </div>
          <div class="space-y-2">
            <Label for="edit-description">Description</Label>
            <Textarea
              id="edit-description"
              v-model="currentIngredientType.ingredientTypeDescription"
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
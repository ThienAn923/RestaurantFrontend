<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { PlusIcon, PencilIcon, Trash2Icon, ChevronLeftIcon, ChevronRightIcon } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useDepartmentStore } from './pinia/department.store'

const DepartmentStore = useDepartmentStore()

const isAddModalOpen = ref(false)
const isEditModalOpen = ref(false)
const currentDepartment = ref({ id: '', departmentName: '', departmentDescription: '' })
const newDepartment = ref({ departmentName: '', departmentDescription: '' })

onMounted(() => {
  DepartmentStore.fetchDepartments(1)
})

const addDepartment = async () => {
  await DepartmentStore.addDepartment(newDepartment.value)
  isAddModalOpen.value = false
  newDepartment.value = { departmentName: '', departmentDescription: '' }
}

const openEditModal = (department: { id: string; departmentName: string; departmentDescription: string }) => {
  currentDepartment.value = { ...department }
  isEditModalOpen.value = true
}

const editDepartment = async () => {
  await DepartmentStore.updateDepartment(currentDepartment.value)
  isEditModalOpen.value = false
}

const deleteDepartment = async (id: string) => {
  await DepartmentStore.deleteDepartment(id)
}

const pageNumbers = computed(() => {
  const totalPages = DepartmentStore.totalPages
  const currentPage = DepartmentStore.currentPage
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
  DepartmentStore.fetchDepartments(page)
}
</script>

<template>
  <div class="h-full w-full bg-gray-50 overflow-auto p-6">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold">Department</h1>
      <Button @click="isAddModalOpen = true" size="sm">
        <PlusIcon class="mr-2 h-4 w-4" /> Add Department
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
          <TableRow v-for="department in DepartmentStore.departments" :key="department.id">
            <TableCell class="font-medium">{{ department.departmentName }}</TableCell>
            <TableCell>{{ department.departmentDescription }}</TableCell>
            <TableCell class="text-right">
              <Button
                variant="ghost"
                size="icon"
                @click="openEditModal(department)"
              >
                <PencilIcon class="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                @click="deleteDepartment(department.id)"
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
        Showing {{ (DepartmentStore.currentPage - 1) * 5 + 1 }} to {{ Math.min(DepartmentStore.currentPage * 5, DepartmentStore.totalItems) }} of {{ DepartmentStore.totalItems }} entries
      </div>
      <div class="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          @click="goToPage(DepartmentStore.currentPage - 1)"
          :disabled="DepartmentStore.currentPage === 1"
        >
          <ChevronLeftIcon class="h-4 w-4" />
        </Button>
        <Button
          v-for="page in pageNumbers"
          :key="page"
          variant="outline"
          size="sm"
          :class="{ 'bg-primary text-primary-foreground': page === DepartmentStore.currentPage }"
          @click="typeof page === 'number' ? goToPage(page) : null"
          :disabled="typeof page !== 'number'"
        >
          {{ page }}
        </Button>
        <Button
          variant="outline"
          size="sm"
          @click="goToPage(DepartmentStore.currentPage + 1)"
          :disabled="DepartmentStore.currentPage === DepartmentStore.totalPages"
        >
          <ChevronRightIcon class="h-4 w-4" />
        </Button>
      </div>
    </div>

    <Dialog v-model:open="isAddModalOpen">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Department</DialogTitle>
          <DialogDescription>
            Enter the details for the new department.
          </DialogDescription>
        </DialogHeader>
        <form @submit.prevent="addDepartment" class="space-y-4">
          <div class="space-y-2">
            <Label for="name">Name</Label>
            <Input
              id="name"
              v-model="newDepartment.departmentName"
              required
            />
          </div>
          <div class="space-y-2">
            <Label for="description">Description</Label>
            <Textarea
              id="description"
              v-model="newDepartment.departmentDescription"
              required
            />
          </div>
          <DialogFooter>
            <Button type="submit">Add Department</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>

    <Dialog v-model:open="isEditModalOpen">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Department</DialogTitle>
          <DialogDescription>
            Make changes to the department.
          </DialogDescription>
        </DialogHeader>
        <form @submit.prevent="editDepartment" class="space-y-4">
          <div class="space-y-2">
            <Label for="edit-name">Name</Label>
            <Input
              id="edit-name"
              v-model="currentDepartment.departmentName"
              required
            />
          </div>
          <div class="space-y-2">
            <Label for="edit-description">Description</Label>
            <Textarea
              id="edit-description"
              v-model="currentDepartment.departmentDescription"
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
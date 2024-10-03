<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { PlusIcon, PencilIcon, Trash2Icon, ChevronLeftIcon, ChevronRightIcon, InfoIcon, ChevronUpIcon, ChevronDownIcon } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useDepartmentStore } from './pinia/department.store'

const departmentStore = useDepartmentStore()

const isAddModalOpen = ref(false)
const isEditModalOpen = ref(false)
const isInfoModalOpen = ref(false)
const currentDepartment = ref({
  id: '',
  departmentName: '',
  departmentDescription: null as string | null,
  totalEmployee: 0,
  headOfDepartment: null as string | null,
  createAt: new Date(),
  updateAt: new Date(),
})
const newDepartment = ref({
  departmentName: '',
  departmentDescription: null as string | null,
  totalEmployee: 0,
  headOfDepartment: null as string | null,
})

const sortColumn = ref('departmentName')
const sortOrder = ref<'asc' | 'desc'>('asc')

onMounted(() => {
  departmentStore.fetchDepartments(1)
})

const addDepartment = async () => {
  await departmentStore.addDepartment(newDepartment.value)
  isAddModalOpen.value = false
  newDepartment.value = {
    departmentName: '',
    departmentDescription: null as string | null,
    totalEmployee: 0,
    headOfDepartment: null as string | null,
  }
}

const findHeadOfDepartment = async () =>{
  
}

const openEditModal = (department: typeof currentDepartment.value) => {
  currentDepartment.value = { ...department }
  isEditModalOpen.value = true
}

const openInfoModal = (department: typeof currentDepartment.value) => {
  currentDepartment.value = { ...department }
  isInfoModalOpen.value = true
}

const editDepartment = async () => {
  await departmentStore.updateDepartment(currentDepartment.value)
  isEditModalOpen.value = false
}

const deleteDepartment = async (id: string) => {
  await departmentStore.deleteDepartment(id)
}

const pageNumbers = computed(() => {
  const totalPages = departmentStore.totalPages
  const currentPage = departmentStore.currentPage
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
  departmentStore.fetchDepartments(page)
}

const sortTable = (column: string) => {
  if (sortColumn.value === column) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortColumn.value = column
    sortOrder.value = 'asc'
  }
  departmentStore.setSorting(sortColumn.value, sortOrder.value)
  departmentStore.fetchDepartments(1)
}

const getSortIcon = (column: string) => {
  if (sortColumn.value !== column) return null
  return sortOrder.value === 'asc' ? ChevronUpIcon : ChevronDownIcon
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
            <TableHead @click="sortTable('departmentName')" class="cursor-pointer">
              <div class="flex items-center justify-between">
                <span>Name</span>
                <component 
                  :is="getSortIcon('departmentName') || 'div'" 
                  class="w-4 h-4 ml-2"
                  :class="{'text-transparent': !getSortIcon('departmentName')}"
                />
              </div>
            </TableHead>
            <TableHead @click="sortTable('totalEmployee')" class="cursor-pointer">
              <div class="flex items-center justify-between">
                <span>Total Employees</span>
                <component 
                  :is="getSortIcon('totalEmployee') || 'div'" 
                  class="w-4 h-4 ml-2"
                  :class="{'text-transparent': !getSortIcon('totalEmployee')}"
                />
              </div>
            </TableHead>
            <TableHead @click="sortTable('headOfDepartment')" class="cursor-pointer">
              <div class="flex items-center justify-between">
                <span>Head of Department</span>
                <component 
                  :is="getSortIcon('headOfDepartment') || 'div'" 
                  class="w-4 h-4 ml-2"
                  :class="{'text-transparent': !getSortIcon('headOfDepartment')}"
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
            <TableHead class="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-for="department in departmentStore.departments" :key="department.id">
            <TableCell class="font-medium">{{ department.departmentName }}</TableCell>
            <TableCell>{{ department.totalEmployee }}</TableCell>
            <TableCell>{{ department.headOfDepartment }}</TableCell>
            <TableCell>{{ new Date(department.createAt).toLocaleString() }}</TableCell>
            <TableCell class="text-right">
              <Button
                variant="ghost"
                size="icon"
                @click="openInfoModal(department)"
              >
                <InfoIcon class="h-4 w-4" />
              </Button>
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
        Showing {{ (departmentStore.currentPage - 1) * 5 + 1 }} to {{ Math.min(departmentStore.currentPage * 5, departmentStore.totalItems) }} of {{ departmentStore.totalItems }} entries
      </div>
      <div class="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          @click="goToPage(departmentStore.currentPage - 1)"
          :disabled="departmentStore.currentPage === 1"
        >
          <ChevronLeftIcon class="h-4 w-4" />
        </Button>
        <Button
          v-for="page in pageNumbers"
          :key="page"
          variant="outline"
          size="sm"
          :class="{ 'bg-primary text-primary-foreground': page === departmentStore.currentPage }"
          @click="typeof page === 'number' ? goToPage(page) : null"
          :disabled="typeof page !== 'number'"
        >
          {{ page }}
        </Button>
        <Button
          variant="outline"
          size="sm"
          @click="goToPage(departmentStore.currentPage + 1)"
          :disabled="departmentStore.currentPage === departmentStore.totalPages"
        >
          <ChevronRightIcon class="h-4 w-4" />
        </Button>
      </div>
    </div>

    <!-- Add Department Modal -->
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
            />
          </div>
          <div class="space-y-2">
            <Label for="totalEmployee">Total Employees</Label>
            <Input
              id="totalEmployee"
              type="number"
              v-model="newDepartment.totalEmployee"
              required
            />
          </div>
          <div class="space-y-2">
            <Label for="headOfDepartment">Head of Department</Label>
            <Input
              id="headOfDepartment"
              v-model="newDepartment.headOfDepartment"
            />
          </div>
          <DialogFooter>
            <Button type="submit">Add Department</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>

    <!-- Lmao so the thing is we dont have employee yet soooo, let just put it here and make it work later -->
    <Dialog v-model:open="isAddModalOpen222222222222222">
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
            />
          </div>
          <div class="space-y-2">
            <Label for="headOfDepartment">Head of Department</Label>
            <Select v-model="newDepartment.headOfDepartment">
              <SelectTrigger>
                <SelectValue placeholder="Select head of department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem v-for="employee in employeeStore.employees" :key="employee.id" :value="employee.id">
                  {{ employee.Person.firstName }} {{ employee.Person.lastName }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button type="submit">Add Department</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>

    <!-- Edit Department Modal -->
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
            />
          </div>
          <div class="space-y-2">
            <Label for="edit-totalEmployee">Total Employees</Label>
            <Input
              id="edit-totalEmployee"
              type="number"
              v-model="currentDepartment.totalEmployee"
              required
            />
          </div>
          <div class="space-y-2">
            <Label for="edit-headOfDepartment">Head of Department</Label>
            <Input
              id="edit-headOfDepartment"
              v-model="currentDepartment.headOfDepartment"
            />
          </div>
          <DialogFooter>
            <Button type="submit">Save Changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>

    <!-- Department Info Modal -->
    <Dialog v-model:open="isInfoModalOpen">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Department Information</DialogTitle>
        </DialogHeader>
        <div class="space-y-4">
          <div>
            <Label class="font-bold">Name:</Label>
            <p>{{ currentDepartment.departmentName }}</p>
          </div>
          <div>
            <Label class="font-bold">Description:</Label>
            <p>{{ currentDepartment.departmentDescription || 'N/A' }}</p>
          </div>
          <div>
            <Label class="font-bold">Total Employees:</Label>
            <p>{{ currentDepartment.totalEmployee }}</p>
          </div>
          <div>
            <Label class="font-bold">Head of Department:</Label>
            <p>{{ currentDepartment.headOfDepartment || 'N/A' }}</p>
          </div>
          <div>
            <Label class="font-bold">Created At:</Label>
            <p>{{ new Date(currentDepartment.createAt).toLocaleString() }}</p>
          </div>
          <div>
            <Label class="font-bold">Updated At:</Label>
            <p>{{ new Date(currentDepartment.updateAt).toLocaleString() }}</p>
          </div>
        </div>
        <DialogFooter>
          <Button @click="isInfoModalOpen = false">Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>

<style scoped>
.table-header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}
</style>
<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { PlusIcon, PencilIcon, Trash2Icon, ChevronLeftIcon, ChevronRightIcon, InfoIcon, ChevronUpIcon, ChevronDownIcon } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { usePositionStore } from './pinia/position.store'
import { useEmployeeStore } from './pinia/employee.store'

const positionStore = usePositionStore()
const employeeStore = useEmployeeStore()

const isAddModalOpen = ref(false)
const isEditModalOpen = ref(false)
const isInfoModalOpen = ref(false)
const currentPosition = ref({
  id: '',
  positionName: '',
  positionDescription: '',
  totalEmployee: 0,
  createAt: '',
  updateAt: '',
})
const newPosition = ref({
  positionName: '',
  positionDescription: '',
})

const sortColumn = ref('positionName')
const sortOrder = ref<'asc' | 'desc'>('asc')

onMounted(async () => {
  await positionStore.fetchPositions(1)
  // await employeeStore.fetchAllEmployees() //will fetch this later when we count the total employee
  //Or not, maybe i'll find a way to count the total employee, no need to fetch then count
})

const addPosition = async () => {
  await positionStore.addPosition(newPosition.value)
  isAddModalOpen.value = false
  newPosition.value = {
    positionName: '',
    positionDescription: '',
  }
}

const openEditModal = (position: typeof currentPosition.value) => {
  currentPosition.value = { ...position }
  isEditModalOpen.value = true
}

const openInfoModal = (position: typeof currentPosition.value) => {
  currentPosition.value = { ...position }
  isInfoModalOpen.value = true
}

const editPosition = async () => {
  await positionStore.updatePosition(currentPosition.value)
  isEditModalOpen.value = false
}

const deletePosition = async (id: string) => {
  await positionStore.deletePosition(id)
}

const pageNumbers = computed(() => {
  const totalPages = positionStore.totalPages
  const currentPage = positionStore.currentPage
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
  positionStore.fetchPositions(page)
}

const sortTable = (column: string) => {
  if (sortColumn.value === column) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortColumn.value = column
    sortOrder.value = 'asc'
  }
  positionStore.setSorting(sortColumn.value, sortOrder.value)
  positionStore.fetchPositions(1)
}

const getSortIcon = (column: string) => {
  if (sortColumn.value !== column) return null
  return sortOrder.value === 'asc' ? ChevronUpIcon : ChevronDownIcon
}
</script>

<template>
  <div class="h-full w-full bg-gray-50 overflow-auto p-6">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold">Position</h1>
      <Button @click="isAddModalOpen = true" size="sm">
        <PlusIcon class="mr-2 h-4 w-4" /> Add Position
      </Button>
    </div>

    <div class="bg-white shadow-md rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead @click="sortTable('positionName')" class="cursor-pointer">
              <div class="flex items-center justify-between">
                <span>Name</span>
                <component 
                  :is="getSortIcon('positionName') || 'div'" 
                  class="w-4 h-4 ml-2"
                  :class="{'text-transparent': !getSortIcon('positionName')}"
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
          <TableRow v-for="position in positionStore.positions" :key="position.id">
            <TableCell class="font-medium">{{ position.positionName }}</TableCell>
            <TableCell>{{ position.totalEmployee }}</TableCell>
            <TableCell>{{ new Date(position.createAt).toLocaleString() }}</TableCell>
            <TableCell class="text-right">
              <Button
                variant="ghost"
                size="icon"
                @click="openInfoModal(position)"
              >
                <InfoIcon class="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                @click="openEditModal(position)"
              >
                <PencilIcon class="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                @click="deletePosition(position.id)"
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
        Showing {{ (positionStore.currentPage - 1) * 5 + 1 }} to {{ Math.min(positionStore.currentPage * 5, positionStore.totalItems) }} of {{ positionStore.totalItems }} entries
      </div>
      <div class="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          @click="goToPage(positionStore.currentPage - 1)"
          :disabled="positionStore.currentPage === 1"
        >
          <ChevronLeftIcon class="h-4 w-4" />
        </Button>
        <Button
          v-for="page in pageNumbers"
          :key="page"
          variant="outline"
          size="sm"
          :class="{ 'bg-primary text-primary-foreground': page === positionStore.currentPage }"
          @click="typeof page === 'number' ? goToPage(page) : null"
          :disabled="typeof page !== 'number'"
        >
          {{ page }}
        </Button>
        <Button
          variant="outline"
          size="sm"
          @click="goToPage(positionStore.currentPage + 1)"
          :disabled="positionStore.currentPage === positionStore.totalPages"
        >
          <ChevronRightIcon class="h-4 w-4" />
        </Button>
      </div>
    </div>

    <!-- Add Position Modal -->
    <Dialog v-model:open="isAddModalOpen">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Position</DialogTitle>
          <DialogDescription>
            Enter the details for the new position.
          </DialogDescription>
        </DialogHeader>
        <form @submit.prevent="addPosition" class="space-y-4">
          <div class="space-y-2">
            <Label for="name">Name</Label>
            <Input
              id="name"
              v-model="newPosition.positionName"
              required
            />
          </div>
          <div class="space-y-2">
            <Label for="description">Description</Label>
            <Textarea
              id="description"
              v-model="newPosition.positionDescription"
            />
          </div>
          <DialogFooter>
            <Button type="submit">Add Position</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>

    <!-- Edit Position Modal -->
    <Dialog v-model:open="isEditModalOpen">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Position</DialogTitle>
          <DialogDescription>
            Make changes to the position.
          </DialogDescription>
        </DialogHeader>
        <form @submit.prevent="editPosition" class="space-y-4">
          <div class="space-y-2">
            <Label for="edit-name">Name</Label>
            <Input
              id="edit-name"
              v-model="currentPosition.positionName"
              required
            />
          </div>
          <div class="space-y-2">
            <Label for="edit-description">Description</Label>
            <Textarea
              id="edit-description"
              v-model="currentPosition.positionDescription"
            />
          </div>
          <DialogFooter>
            <Button type="submit">Save Changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>

    <!-- Position Info Modal -->
    <Dialog v-model:open="isInfoModalOpen">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Position Information</DialogTitle>
        </DialogHeader>
        <div class="space-y-4">
          <div>
            <Label class="font-bold">Name:</Label>
            <p>{{ currentPosition.positionName }}</p>
          </div>
          <div>
            <Label class="font-bold">Description:</Label>
            <p>{{ currentPosition.positionDescription || 'N/A' }}</p>
          </div>
          <div>
            <Label class="font-bold">Total Employees:</Label>
            <p>{{ currentPosition.totalEmployee }}</p>
          </div>
          <div>
            <Label class="font-bold">Created At:</Label>
            <p>{{ new Date(currentPosition.createAt).toLocaleString() }}</p>
          </div>
          <div>
            <Label class="font-bold">Updated At:</Label>
            <p>{{ new Date(currentPosition.updateAt).toLocaleString() }}</p>
          </div>
        </div>
        <DialogFooter>
          <Button @click="isInfoModalOpen = false">Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>
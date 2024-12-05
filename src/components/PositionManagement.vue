<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { PlusIcon, PencilIcon, Trash2Icon, ChevronLeftIcon, ChevronRightIcon, InfoIcon, ChevronUpIcon, ChevronDownIcon } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { usePositionStore } from './pinia/position.store'
import { useEmployeeStore } from './pinia/employee.store'
import { useToast } from "./ui/toast"
const { toast } = useToast();

const positionStore = usePositionStore()
const employeeStore = useEmployeeStore()
// const employeeStore = useEmployeeStore()

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
})

const addPosition = async () => {
  if (!validateNewPosition()) return
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
  if (!validateCurrentPosition()) return
  await positionStore.updatePosition(currentPosition.value)
  isEditModalOpen.value = false
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

const searchQuery = ref('')

const resetFilters = () => {
  searchQuery.value = ''
}

watch([searchQuery], () => {
  // alert(searchQuery.value)
  positionStore.setSearch(searchQuery.value);
  positionStore.fetchPositions(1)
})


const isDeleteDialogOpen = ref(false);
const IDOfObjectAboutToBeDeleted = ref('');
const openDeleteConfirmDialog = (objectID: string) => {
  // console.log("tableID:", tableID);
  IDOfObjectAboutToBeDeleted.value = objectID;
  isDeleteDialogOpen.value = true;
}

const deletePosition = async () => {
  await positionStore.deletePosition(IDOfObjectAboutToBeDeleted.value);
  isDeleteDialogOpen.value = false;
}


const validateNewPosition = () => {
  if (!newPosition.value.positionName || newPosition.value.positionName.length > 100) {
    toast({
      title: 'Lỗi',
      description: 'Tên chức vụ phải nhỏ hơn 100 ký tự và không được để trống',
    })
    return false
  }
  if (newPosition.value.positionDescription.length > 1024) {
    toast({
      title: 'Lỗi',
      description: 'Mô tả chức vụ phải nhỏ hơn 1024 ký tự',
    })
    return false
  }
  return true
}

const validateCurrentPosition = () => {
  if (!currentPosition.value.positionName || currentPosition.value.positionName.length > 100) {
    toast({
      title: 'Lỗi',
      description: 'Tên chức vụ phải nhỏ hơn 100 ký tự và không được để trống',
    })
    return false
  }
  if (currentPosition.value.positionDescription.length > 1024) {
    toast({
      title: 'Lỗi',
      description: 'Mô tả chức vụ phải nhỏ hơn 1024 ký tự',
    })
    return false
  }
  return true
}




</script>

<template>
  <div class="h-full w-full bg-gray-50 overflow-auto p-6">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold">Chức Vụ</h1>
      <Button @click="isAddModalOpen = true" class="bg-blue-500 hover:bg-blue-600 text-white">
        <PlusIcon class="mr-2 h-4 w-4" /> Thêm Chức Vụ
      </Button>
    </div>

    <div class="mb-4 flex space-x-4">
      <div class="relative flex-grow">
        <Input v-model="searchQuery" placeholder="Tìm kiếm theo tên" class="pl-10" />
        <SearchIcon class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
      </div>
      <Button @click="resetFilters" variant="outline">Reset Bộ Lọc</Button>
    </div>

    <div class="bg-white shadow-md rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead @click="sortTable('positionName')" class="cursor-pointer">
              <div class="flex items-center justify-between">
                <span>Tên Chức Vụ</span>
                <component :is="getSortIcon('positionName') || 'div'" class="w-4 h-4 ml-2"
                  :class="{ 'text-transparent': !getSortIcon('positionName') }" />
              </div>
            </TableHead>
            <TableHead @click="sortTable('totalEmployee')" class="cursor-pointer">
              <div class="flex items-center justify-between">
                <span>Tổng Số Nhân Viên</span>
                <component :is="getSortIcon('totalEmployee') || 'div'" class="w-4 h-4 ml-2"
                  :class="{ 'text-transparent': !getSortIcon('totalEmployee') }" />
              </div>
            </TableHead>
            <TableHead @click="sortTable('createAt')" class="cursor-pointer">
              <div class="flex items-center justify-between">
                <span>Ngày Tạo</span>
                <component :is="getSortIcon('createAt') || 'div'" class="w-4 h-4 ml-2"
                  :class="{ 'text-transparent': !getSortIcon('createAt') }" />
              </div>
            </TableHead>
            <TableHead class="text-right"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-for="position in positionStore.positions" :key="position.id">
            <TableCell class="font-medium">{{ position.positionName }}</TableCell>
            <TableCell>{{ position.totalEmployee }}</TableCell>
            <TableCell>{{ new Date(position.createAt).toLocaleString() }}</TableCell>
            <TableCell class="text-right">
              <Button variant="ghost" size="icon" @click="openInfoModal(position)"
                class="text-blue-500 hover:text-blue-600 hover:bg-blue-100">
                <InfoIcon class="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" @click="openEditModal(position)"
                class="text-blue-500 hover:text-blue-600 hover:bg-blue-100">
                <PencilIcon class="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" @click="openDeleteConfirmDialog(position.id)"
                class="text-red-500 hover:text-white hover:bg-red-500">
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
        Showing {{ (positionStore.currentPage - 1) * 5 + 1 }} to {{ Math.min(positionStore.currentPage * 5,
          positionStore.totalItems) }} of {{ positionStore.totalItems }} entries
      </div>
      <div class="flex items-center space-x-2">
        <Button variant="outline" size="sm" @click="goToPage(positionStore.currentPage - 1)"
          :disabled="positionStore.currentPage === 1" class="text-gray-700 hover:bg-gray-100 disabled:opacity-50">
          <ChevronLeftIcon class="h-4 w-4" />
        </Button>
        <Button v-for="page in pageNumbers" :key="page" variant="outline" size="sm"
          :class="{ 'bg-blue-500 text-white': page === positionStore.currentPage, 'text-gray-700 hover:bg-gray-100': page !== positionStore.currentPage }"
          @click="typeof page === 'number' ? goToPage(page) : null" :disabled="typeof page !== 'number'">
          {{ page }}
        </Button>
        <Button variant="outline" size="sm" @click="goToPage(positionStore.currentPage + 1)"
          :disabled="positionStore.currentPage === positionStore.totalPages"
          class="text-gray-700 hover:bg-gray-100 disabled:opacity-50">
          <ChevronRightIcon class="h-4 w-4" />
        </Button>
      </div>
    </div>

    <!-- Add Position Modal -->
    <Dialog v-model:open="isAddModalOpen">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Thêm Chức Vụ</DialogTitle>
          <DialogDescription>
            Nhập thông tin chức vụ dưới đây để thêm chức vụ mới
          </DialogDescription>
        </DialogHeader>
        <form @submit.prevent="addPosition" class="space-y-4">
          <div class="space-y-2">
            <Label for="name">Tên Chức Vụ</Label>
            <Input id="name" v-model="newPosition.positionName" required />
          </div>
          <div class="space-y-2">
            <Label for="description">Mô Tả</Label>
            <Textarea id="description" v-model="newPosition.positionDescription" />
          </div>
          <DialogFooter>
            <Button type="submit">Thêm Chức Vụ</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>

    <!-- Edit Position Modal -->
    <Dialog v-model:open="isEditModalOpen">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Chỉnh Sửa Chức Vụ</DialogTitle>
          <DialogDescription>
            Thay đổi thông tin cho chức vụ dưới đây
          </DialogDescription>
        </DialogHeader>
        <form @submit.prevent="editPosition" class="space-y-4">
          <div class="space-y-2">
            <Label for="edit-name">Tên Chức Vụ</Label>
            <Input id="edit-name" v-model="currentPosition.positionName" required />
          </div>
          <div class="space-y-2">
            <Label for="edit-description">Mô Tả:</Label>
            <Textarea id="edit-description" v-model="currentPosition.positionDescription" />
          </div>
          <DialogFooter>
            <Button type="submit">Lưu Chức Vụ</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>

    <!-- Position Info Modal -->
    <Dialog v-model:open="isInfoModalOpen">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Thông tin chức vụ</DialogTitle>
        </DialogHeader>
        <div class="space-y-4">
          <div>
            <Label class="font-bold">Tên Chức Vụ:</Label>
            <p>{{ currentPosition.positionName }}</p>
          </div>
          <div>
            <Label class="font-bold">Mô Tả:</Label>
            <p>{{ currentPosition.positionDescription || 'N/A' }}</p>
          </div>
          <div>
            <Label class="font-bold">Tổng Số Nhân Viên:</Label>
            <p>{{ currentPosition.totalEmployee }}</p>
          </div>
          <div>
            <Label class="font-bold"> Ngày Tạo:</Label>
            <p>{{ new Date(currentPosition.createAt).toLocaleString() }}</p>
          </div>
          <div>
            <Label class="font-bold"> Ngày Cập Nhật:</Label>
            <p>{{ new Date(currentPosition.updateAt).toLocaleString() }}</p>
          </div>
        </div>
        <DialogFooter>
          <Button @click="isInfoModalOpen = false">Đóng</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>


    <Dialog v-model:open="isDeleteDialogOpen">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Xác nhận xóa chức vụ này?</DialogTitle>
          <DialogDescription>
            Bạn có chắc chắn muốn xóa chức vụ này. Hành động này không thể hoàn tác trừ
            khi liên hệ với kỹ
            thuật viên.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button @click="isDeleteDialogOpen = false"> Hủy </Button>
          <Button @click="deletePosition" class="bg-red-400 hover:bg-red-500 text-white">Xóa</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>
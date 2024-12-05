<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { PlusIcon, PencilIcon, Trash2Icon, ChevronLeftIcon, ChevronRightIcon, InfoIcon, ChevronUpIcon, ChevronDownIcon } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useDepartmentStore } from './pinia/department.store'
import { useEmployeeStore } from './pinia/employee.store'
import { useToast } from './ui/toast'

const { toast } = useToast()
const departmentStore = useDepartmentStore()
const employeeStore = useEmployeeStore()

const isAddModalOpen = ref(false)
const isEditModalOpen = ref(false)
const isInfoModalOpen = ref(false)
const currentDepartment = ref({
  id: '',
  departmentName: '',
  departmentDescription: null as string | null,
  totalEmployee: 0,
  headOfDepartment: undefined as string | undefined,
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
  employeeStore.fetchEmployees(1, 900000) //featch all employee instead of making a proper search component because i am so so so fucking tired. 
})

const addDepartment = async () => {
  try {
    await departmentStore.addDepartment(newDepartment.value,)
    isAddModalOpen.value = false
    newDepartment.value = {
      departmentName: '',
      departmentDescription: null as string | null,
      totalEmployee: 0,
      headOfDepartment: null as string | null,
    }
    toast({
      title: 'Thành Công',
      description: 'Thêm bộ phận thành công',
    });
  } catch (error) {
    toast({
      title: 'Lỗi',
      description: 'Thêm bộ phận không thành công',
    });
  }
}

const findHeadOfDepartment = async () => {

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
  try {
    await departmentStore.updateDepartment(currentDepartment.value)
    isEditModalOpen.value = false
  } catch {
    toast({
      title: 'Lỗi',
      description: 'Sửa bộ phận không thành công',
    });
  }
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

const searchQuery = ref('')

const resetFilters = () => {
  searchQuery.value = ''
}

watch([searchQuery], () => {
  // alert(searchQuery.value)
  departmentStore.setSearch(searchQuery.value);
  departmentStore.fetchDepartments(1)
})


const isDeleteDialogOpen = ref(false);
const IDOfObjectAboutToBeDeleted = ref('');
const openDeleteConfirmDialog = (objectID: string) => {
  // console.log("tableID:", tableID);
  IDOfObjectAboutToBeDeleted.value = objectID;
  isDeleteDialogOpen.value = true;
}

const deleteDepartment = async () => {
  try {
    await departmentStore.deleteDepartment(IDOfObjectAboutToBeDeleted.value);
    isDeleteDialogOpen.value = false;
    isDeleteDialogOpen.value = false;

  } catch (error) {
    toast({
      title: 'Lỗi',
      description: 'Xóa bộ phận không thành công',
    });

  }
}




</script>

<template>
  <div class="h-full w-full bg-gray-50 overflow-auto p-6">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold">Quản Lý Bộ Phận</h1>
      <Button @click="isAddModalOpen = true" size="sm" class="bg-blue-500 hover:bg-blue-600 text-white">
        <PlusIcon class="mr-2 h-4 w-4" /> Thêm Bộ Phần
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
            <TableHead @click="sortTable('departmentName')" class="cursor-pointer">
              <div class="flex items-center justify-between">
                <span>Tên Bộ Phận</span>
                <component :is="getSortIcon('departmentName') || 'div'" class="w-4 h-4 ml-2"
                  :class="{ 'text-transparent': !getSortIcon('departmentName') }" />
              </div>
            </TableHead>
            <TableHead @click="sortTable('totalEmployee')" class="cursor-pointer">
              <div class="flex items-center justify-between">
                <span>Tổng Số Nhân Viên</span>
                <component :is="getSortIcon('totalEmployee') || 'div'" class="w-4 h-4 ml-2"
                  :class="{ 'text-transparent': !getSortIcon('totalEmployee') }" />
              </div>
            </TableHead>
            <TableHead @click="sortTable('headOfDepartment')" class="cursor-pointer">
              <div class="flex items-center justify-between">
                <span>Trưởng Bộ Phận</span>
                <component :is="getSortIcon('headOfDepartment') || 'div'" class="w-4 h-4 ml-2"
                  :class="{ 'text-transparent': !getSortIcon('headOfDepartment') }" />
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
          <TableRow v-for="department in departmentStore.departments" :key="department.id">
            <TableCell class="font-medium">{{ department.departmentName }}</TableCell>
            <TableCell>{{ department.totalEmployee }}</TableCell>

            <!-- This is one cell -->
            <TableCell v-if="department.headOfDepartment">{{ department.headOfDepartment.name }}</TableCell>
            <TableCell v-else>No head of department</TableCell>

            <TableCell>{{ new Date(department.createAt).toLocaleString() }}</TableCell>
            <TableCell class="text-right">
              <Button variant="ghost" size="icon" @click="openInfoModal(department)"
                class="text-gray-600 hover:text-blue-600 hover:bg-blue-100">
                <InfoIcon class="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" @click="openEditModal(department)"
                class="text-blue-600 hover:text-blue-600 hover:bg-blue-100">
                <PencilIcon class="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" @click="openDeleteConfirmDialog(department.id)"
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
        Showing {{ (departmentStore.currentPage - 1) * 5 + 1 }} to {{ Math.min(departmentStore.currentPage * 5,
          departmentStore.totalItems) }} of {{ departmentStore.totalItems }} entries
      </div>
      <div class="flex items-center space-x-2">
        <Button variant="outline" size="sm" @click="goToPage(departmentStore.currentPage - 1)"
          :disabled="departmentStore.currentPage === 1" class="text-gray-700 hover:bg-gray-100 disabled:opacity-50">
          <ChevronLeftIcon class="h-4 w-4" />
        </Button>
        <Button v-for="page in pageNumbers" :key="page" variant="outline" size="sm"
          :class="{ 'bg-blue-500 text-white': page === departmentStore.currentPage, 'text-gray-700 hover:bg-gray-100': page !== departmentStore.currentPage }"
          @click="typeof page === 'number' ? goToPage(page) : null" :disabled="typeof page !== 'number'">
          {{ page }}
        </Button>
        <Button variant="outline" size="sm" @click="goToPage(departmentStore.currentPage + 1)"
          :disabled="departmentStore.currentPage === departmentStore.totalPages"
          class="text-gray-700 hover:bg-gray-100 disabled:opacity-50">
          <ChevronRightIcon class="h-4 w-4" />
        </Button>
      </div>
    </div>

    <!-- Add Department Modal -->
    <!-- <Dialog v-model:open="isAddModalOpen">
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
            <Input id="name" v-model="newDepartment.departmentName" required />
          </div>
          <div class="space-y-2">
            <Label for="description">Description</Label>
            <Textarea id="description" v-model="newDepartment.departmentDescription" />
          </div>
          <div class="space-y-2">
            <Label for="headOfDepartment">Head of Department</Label>
            <Input id="headOfDepartment" v-model="newDepartment.headOfDepartment" />
          </div>
          <DialogFooter>
            <Button type="submit" class="bg-blue-500 hover:bg-blue-600 text-white">Add Department</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog> -->

    <!-- Lmao so the thing is we dont have employee yet soooo, let just put it here and make it work later -->
    <Dialog v-model:open="isAddModalOpen">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Thêm Bộ Phận Mới</DialogTitle>
          <DialogDescription>
            Nhập thông tin cho bộ phận mới dưới đây.
          </DialogDescription>
        </DialogHeader>
        <form @submit.prevent="addDepartment" class="space-y-4">
          <div class="space-y-2">
            <Label for="name">Tên Bộ Phận </Label>
            <Input id="name" v-model="newDepartment.departmentName" required />
          </div>
          <div class="space-y-2">
            <Label for="description">Mô Tả</Label>
            <Textarea id="description" v-model="newDepartment.departmentDescription" />
          </div>
          <div class="space-y-2">
            <Label for="headOfDepartment">Trưởng Bộ Phận</Label>
            <Select v-model="newDepartment.headOfDepartment">
              <SelectTrigger>
                <SelectValue placeholder="Chọn Trưởng Bộ Phận" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem v-for="employee in employeeStore.employees" :key="employee.id" :value="employee.id">
                  {{ employee.person.name }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button type="submit">Thêm Bộ Phận</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>

    <!-- Edit Department Modal -->
    <Dialog v-model:open="isEditModalOpen">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Chỉnh Sửa Bộ Phận</DialogTitle>
          <DialogDescription>
            Nhập thông tin muốn chỉnh sửa cho bộ phận dưới đây.
          </DialogDescription>
        </DialogHeader>
        <form @submit.prevent="editDepartment" class="space-y-4">
          <div class="space-y-2">
            <Label for="edit-name">Tên Bộ Phận</Label>
            <Input id="edit-name" v-model="currentDepartment.departmentName" required />
          </div>
          <div class="space-y-2">
            <Label for="edit-description">Mô Tả</Label>
            <Textarea id="edit-description" v-model="currentDepartment.departmentDescription" />
          </div>
          <div class="space-y-2">
            <Label for="edit-headOfDepartment">Trưởng Bộ Phận</Label>
            <Select v-model="currentDepartment.headOfDepartment.id">
              <SelectTrigger>
                <SelectValue :placeholder="currentDepartment.headOfDepartment.name" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem v-for="employee in employeeStore.employees" :key="employee.id" :value="employee.id">
                  {{ employee.person.name }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button type="submit">Lưu Thay Đổi </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>

    <!-- Department Info Modal -->
    <Dialog v-model:open="isInfoModalOpen">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Thông Tin Bộ Phận</DialogTitle>
        </DialogHeader>
        <div class="space-y-4">
          <div>
            <Label class="font-bold">Tên Bộ Phận:</Label>
            <p>{{ currentDepartment.departmentName }}</p>
          </div>
          <div>
            <Label class="font-bold">Mô Tả:</Label>
            <p>{{ currentDepartment.departmentDescription || 'N/A' }}</p>
          </div>
          <div>
            <Label class="font-bold">Tổng Số Nhân Viên:</Label>
            <p>{{ currentDepartment.totalEmployee }}</p>
          </div>
          <div>
            <Label class="font-bold">Trưởng Bộ Phận:</Label>
            <p>{{ currentDepartment.headOfDepartment.name || 'N/A' }}</p>
          </div>
          <div>
            <Label class="font-bold">Ngày Tạo:</Label>
            <p>{{ new Date(currentDepartment.createAt).toLocaleString() }}</p>
          </div>
          <div>
            <Label class="font-bold">Ngày Cập Nhật:</Label>
            <p>{{ new Date(currentDepartment.updateAt).toLocaleString() }}</p>
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
          <DialogTitle>Xác nhận xóa phong ban này?</DialogTitle>
          <DialogDescription>
            Bạn có chắc chắn muốn xóa phòng ban này. Hành động này không thể hoàn tác trừ
            khi liên hệ với kỹ
            thuật viên.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button @click="isDeleteDialogOpen = false"> Hủy </Button>
          <Button @click="deleteDepartment" class="bg-red-400 hover:bg-red-500 text-white">Xóa</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>


    <Dialog v-model:open="isDeleteDialogOpen">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Xác nhận xóa bộ phận này?</DialogTitle>
          <DialogDescription>
            Bạn có chắc chắn muốn xóa bộ phận này. Hành động này không thể hoàn tác trừ
            khi liên hệ với kỹ thuật viên.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button @click="isDeleteDialogOpen = false"> Hủy </Button>
          <Button @click="deleteDepartment" class="bg-red-400 hover:bg-red-500 text-white">Xóa</Button>
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
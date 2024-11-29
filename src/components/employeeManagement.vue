<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { PlusIcon, PencilIcon, Trash2Icon, ChevronLeftIcon, ChevronRightIcon } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { useEmployeeStore } from './pinia/employee.store'

const employeeStore = useEmployeeStore()

const isAddEmployeeModalOpen = ref(false)
const isEditEmployeeModalOpen = ref(false)
const isAccountCreatedModalOpen = ref(false)
const currentEmployee = ref({ name: '', employeeAdress: '', employeeGender: true, employeeDateOfBirth: '', departmentId: '', positionId: '' })
const newEmployee = ref({ name: '', employeeAdress: '', employeeGender: true, employeeDateOfBirth: '', departmentId: '', positionId: '', createAccount: false, StartDay: '', AccountAuthority: 1 })
const createdAccount = ref({ username: '', password: '' })

onMounted(async () => {
  await employeeStore.fetchEmployees(1)
  await employeeStore.fetchDepartments()
  await employeeStore.fetchPositions()
  console.log(employeeStore.departments)
  employeeStore.employees.forEach(emp => {
    emp.Work.forEach(work => {
      emp.position = work.Position.positionName
      emp.department = work.Department.departmentName// Truy cập vào departmentName
    })
  })
})
const result = ref('');
const addEmployee = async () => {
  console.log("Irun");
  newEmployee.value.employeeDateOfBirth = new Date(newEmployee.value.employeeDateOfBirth).toISOString();
  newEmployee.value.StartDay = new Date().toISOString();
  result.value = await employeeStore.addEmployee(newEmployee.value)
  isAddEmployeeModalOpen.value = false
  console.log("Irun2");
  if (result.value && result.value.account) {
    createdAccount.value = result.value.account
    console.log("Result: ", result.value);
    isAccountCreatedModalOpen.value = true
  }
  await employeeStore.fetchEmployees(employeeStore.currentPage)
  employeeStore.employees.forEach(emp => {
    emp.Work.forEach(work => {
      emp.position = work.Position.positionName
      emp.department = work.Department.departmentName// Truy cập vào departmentName
    })
  })
  newEmployee.value = { name: '', employeeAdress: '', employeeGender: true, employeeDateOfBirth: '', departmentId: '', positionId: '', createAccount: false, StartDay: '', AccountAuthority: 1 }
}

const openEditModal = (employee: any) => {
  currentEmployee.value = { ...employee }
  isEditEmployeeModalOpen.value = true
}

const editEmployee = async () => {
  await employeeStore.updateEmployee(currentEmployee.value)
  isEditEmployeeModalOpen.value = false
}

const deleteEmployee = async (id: string) => {
  await employeeStore.deleteEmployee(id)
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}

const pageNumbers = computed(() => {
  const totalPages = employeeStore.totalPages
  const currentPage = employeeStore.currentPage
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
  employeeStore.fetchEmployees(page)
}


watch(newEmployee, (newVal) => {
  console.log(JSON.stringify(newVal.AccountAuthority))
})

const handleChange = () => {
  newEmployee.value.createAccount = !newEmployee.value.createAccount
}
</script>

<template>
  <div class="h-full w-full bg-gray-50 overflow-auto p-6">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold">Quản Lý Nhân Viên</h1>
      <div class="space-x-2">
        <Button @click="isAddEmployeeModalOpen = true" size="sm" class="bg-blue-500 hover:bg-blue-600 text-white">
          <PlusIcon class="mr-2 h-4 w-4" /> Thêm Nhân Viên
        </Button>
      </div>
    </div>

    <div class="bg-white shadow-md rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Tên</TableHead>
            <TableHead>Địa Chỉ</TableHead>
            <TableHead>Giới Tính</TableHead>
            <TableHead>Ngày Sinh</TableHead>
            <TableHead>Phòng Ban</TableHead>
            <TableHead>Chức Vụ</TableHead>
            <TableHead class="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-for="employee in employeeStore.employees" :key="employee.id">
            <TableCell class="font-medium">{{ employee.person.name }}</TableCell>
            <TableCell class="w-4/12">{{ employee.employeeAdress }}</TableCell>
            <TableCell>{{ employee.employeeGender ? 'Nam' : 'Nữ' }}</TableCell>
            <TableCell>{{ formatDate(employee.employeeDateOfBirth) }}</TableCell>
            <TableCell>{{ employee.position }}</TableCell>
            <TableCell>{{ employee.department }}</TableCell>
            <TableCell class="text-right">
              <Button variant="ghost" size="icon" @click="openEditModal(employee)"
                class="text-blue-600 hover:text-blue-600 hover:bg-blue-100">
                <PencilIcon class="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" @click="deleteEmployee(employee.id)"
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
        Showing {{ (employeeStore.currentPage - 1) * 5 + 1 }} to {{ Math.min(employeeStore.currentPage * 5,
          employeeStore.totalItems) }} of {{ employeeStore.totalItems }} entries
      </div>
      <div class="flex items-center space-x-2">
        <Button variant="outline" size="sm" @click="goToPage(employeeStore.currentPage - 1)"
          :disabled="employeeStore.currentPage === 1" class="text-gray-700 hover:bg-gray-100 disabled:opacity-50">

          <ChevronLeftIcon class="h-4 w-4 " />

        </Button>
        <Button v-for="page in pageNumbers" :key="page" variant="outline" size="sm"
          :class="{ 'bg-blue-500 text-white': page === employeeStore.currentPage, 'text-gray-700 hover:bg-gray-100': page !== employeeStore.currentPage }"
          @click="typeof page === 'number' ? goToPage(page) : null" :disabled="typeof page !== 'number'">
          {{ page }}
        </Button>
        <Button variant="outline" size="sm" @click="goToPage(employeeStore.currentPage + 1)"
          :disabled="employeeStore.currentPage === employeeStore.totalPages"
          class="text-gray-700 hover:bg-gray-100 disabled:opacity-50">
          <ChevronRightIcon class="h-4 w-4" />
        </Button>
      </div>
    </div>

    <!-- Add Employee Modal -->
    <Dialog v-model:open="isAddEmployeeModalOpen">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Thêm Nhân Viên Mới</DialogTitle>
          <DialogDescription>
            Nhập Thông Tin Cho Nhân Viên Mới Dưới Đây
          </DialogDescription>
        </DialogHeader>
        <form @submit.prevent="addEmployee" class="space-y-4">
          <div class="space-y-2">
            <Label for="name">Tên Nhân Viên</Label>
            <Input id="name" v-model="newEmployee.name" type="string" required />
          </div>
          <div class="space-y-2">
            <Label for="address">Địa Chỉ</Label>
            <Input id="address" v-model="newEmployee.employeeAdress" required />
          </div>
          <div class="space-y-2">
            <Label for="gender">Giới Tính</Label>
            <Select v-model="newEmployee.employeeGender" required>
              <SelectTrigger>
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem :value="true">Nam</SelectItem>
                <SelectItem :value="false">Nữ</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div class="space-y-2">
            <Label for="dob">Ngày Sinh</Label>
            <Input id="dob" type="date" v-model="newEmployee.employeeDateOfBirth" required />
          </div>
          <div class="space-y-2">
            <Label for="department">Bộ Phận</Label>
            <Select v-model="newEmployee.departmentId" required>
              <SelectTrigger>
                <SelectValue placeholder="Chọn Bộ Phận Làm Việc" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem v-for="dept in employeeStore.departments" :key="dept.id" :value="dept.id">
                  {{ dept.departmentName }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div class="space-y-2">
            <Label for="position">Vị Trí</Label>
            <Select v-model="newEmployee.positionId" required>
              <SelectTrigger>
                <SelectValue placeholder="Chọn Vị Trí" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem v-for="pos in employeeStore.positions" :key="pos.id" :value="pos.id">
                  {{ pos.positionName }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div class="flex items-center space-x-2">
            <Checkbox id="create-account" v-model="newEmployee.createAccount" @update:checked="handleChange" />
            <Label for="create-account">Tạo tài khoản cho nhân viên này?</Label>
          </div>
          <div v-if="newEmployee.createAccount" class="space-y-2">
            <Label for="account-authority">Loại Tài Khoản</Label>
            <Select v-model="newEmployee.AccountAuthority" required>
              <SelectTrigger>
                <SelectValue placeholder="Chọn loại tài khoản" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1" key="1">Tài Khoản Quản Lý</SelectItem>
                <SelectItem value="2" key="2">Tài Khoản Đầu Bếp</SelectItem>
                <SelectItem value="3" key="3">Tài Khoản Tiếp Tân</SelectItem>
                <SelectItem value="4" key="4">Tài Khoản Phục Vụ</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button type="submit">Thêm Nhân Viên</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>

    <!-- Edit Employee Modal -->
    <Dialog v-model:open="isEditEmployeeModalOpen">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Chỉnh Sửa Thông Tin Nhân Viên</DialogTitle>
          <DialogDescription>
            Chỉnh sửa thông tin cho nhân viên bằng cách nhập các trường dưới đây
          </DialogDescription>
        </DialogHeader>
        <form @submit.prevent="editEmployee" class="space-y-4">
          <div class="space-y-2">
            <Label for="edit-name">Tên Nhân Viên</Label>
            <Input id="edit-name" v-model="currentEmployee.person.name" required />
          </div>
          <div class="space-y-2">
            <Label for="edit-address">Địa Chỉ Nhân Viên</Label>
            <Input id="edit-address" v-model="currentEmployee.employeeAdress" required />
          </div>
          <div class="space-y-2">
            <Label for="edit-gender">Giới Tính Nhân Viên</Label>
            <Select v-model="currentEmployee.employeeGender" required>
              <SelectTrigger>
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem :value="true">Nam</SelectItem>
                <SelectItem :value="false">Nữ</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div class="space-y-2">
            <Label for="edit-dob">Ngày Sinh</Label>
            <Input id="edit-dob" type="date"
              :value="new Date(currentEmployee.employeeDateOfBirth).toISOString().substr(0, 10)"
              @input="currentEmployee.employeeDateOfBirth = $event.target.value" required />
          </div>
          <div class="space-y-2">
            <Label for="edit-department">Bộ Phận</Label>
            <Select v-model="currentEmployee.departmentName" required>
              <SelectTrigger>
                <SelectValue placeholder="Select a department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem v-for="dept in employeeStore.departments" :key="dept.id" :value="dept.id">
                  {{ dept.departmentName }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div class="space-y-2">
            <Label for="edit-position">Chức Vụ</Label>
            <Select v-model="currentEmployee.work" required>
              <SelectTrigger>
                <SelectValue placeholder="Select a position" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem v-for="pos in employeeStore.positions" :key="pos.id" :value="pos.id">
                  {{ pos.positionName }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div v-if="currentEmployee.person.account" class="space-y-2">
            <Label for="account-authority">Loại Tài Khoản</Label>
            <Select v-model="currentEmployee.person.account.AccountAuthority" required>
              <SelectTrigger>
                <SelectValue :placeholder="currentEmployee.person.account.AccountAuthority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1" key="1">Tài Khoản Quản Lý</SelectItem>
                <SelectItem value="2" key="2">Tài Khoản Đầu Bếp</SelectItem>
                <SelectItem value="3" key="3">Tài Khoản Tiếp Tân</SelectItem>
                <SelectItem value="4" key="4">Tài Khoản Phục Vụ</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button type="submit">Lưu Nhân Viên</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>

    <!-- Account Created Modal -->
    <!-- <Dialog v-model:open="isAccountCreatedModalOpen">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Account Created</DialogTitle>
          <DialogDescription>
            An account has been created for the new employee.
          </DialogDescription>
        </DialogHeader>
        <div class="space-y-4">
          <div>
            <Label>Username</Label>
            <Input :value="createdAccount.username" readonly />
          </div>
          <div>
            <Label>Password</Label>
            <Input :value="createdAccount.password" readonly />
          </div>
        </div>
        <DialogFooter>
          <Button @click="isAccountCreatedModalOpen = false">Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog> -->

    <Dialog v-model:open="isAccountCreatedModalOpen">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tài Khoản Nhân Viên Vừa Được Tạo</DialogTitle>
          <DialogDescription>
            Thông tin về tài khoản nhân viên vừa được tạo. Thông tin chỉ hiện ra 1 lần. Hãy lưu trữ thông tin này cẩn
            thận.
          </DialogDescription>
        </DialogHeader>
        <div class="space-y-4">
          <div>
            <Label>Tên Đăng Nhập</Label>
            <Input v-model="result.AccountUsername" readonly />
          </div>
          <div>
            <Label>Mật Khẩu</Label>
            <Input v-model="result.AccountPassword" readonly />
          </div>
        </div>
        <DialogFooter>
          <Button @click="isAccountCreatedModalOpen = false" class="hover:bg-red-600">Đóng</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>
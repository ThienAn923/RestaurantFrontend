<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
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
const newEmployee = ref({ name: '', employeeAdress: '', employeeGender: true, employeeDateOfBirth: '', departmentId: '', positionId: '', createAccount: false, StartDay: '', AccountAuthority: 1})
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

const addEmployee = async () => {
  newEmployee.value.employeeDateOfBirth = new Date(newEmployee.value.employeeDateOfBirth).toISOString();
  newEmployee.value.StartDay = new Date().toISOString();
  const result = await employeeStore.addEmployee(newEmployee.value)
  isAddEmployeeModalOpen.value = false
  if (result && result.account) {
    createdAccount.value = result.account
    isAccountCreatedModalOpen.value = true
  }
  await employeeStore.fetchEmployees(employeeStore.currentPage)
  employeeStore.employees.forEach(emp => {
  emp.Work.forEach(work => {
    emp.position = work.Position.positionName
    emp.department = work.Department.departmentName// Truy cập vào departmentName
  })
})
  newEmployee.value = { name: '', employeeAdress: '', employeeGender: true, employeeDateOfBirth: '', departmentId: '', positionId: '', createAccount: false, StartDay: '', AccountAuthority: 1}
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
</script>

<template>
  <div class="h-full w-full bg-gray-50 overflow-auto p-6">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold">Employees</h1>
      <div class="space-x-2">
        <Button @click="isAddEmployeeModalOpen = true" size="sm">
          <PlusIcon class="mr-2 h-4 w-4" /> Add Employee
        </Button>
      </div>
    </div>

    <div class="bg-white shadow-md rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Address</TableHead>
            <TableHead>Gender</TableHead>
            <TableHead>Date of Birth</TableHead>
            <TableHead>Department</TableHead>
            <TableHead>Position</TableHead>
            <TableHead class="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-for="employee in employeeStore.employees" :key="employee.id">
            <TableCell class="font-medium">{{ employee.id }}</TableCell>
            <TableCell>{{ employee.employeeAdress }}</TableCell>
            <TableCell>{{ employee.employeeGender ? 'Male' : 'Female' }}</TableCell>
            <TableCell>{{ formatDate(employee.employeeDateOfBirth) }}</TableCell>
            <TableCell>{{ employee.department }}</TableCell>
            <TableCell>{{ employee.position }}</TableCell>
            <TableCell class="text-right">
              <Button
                variant="ghost"
                size="icon"
                @click="openEditModal(employee)"
              >
                <PencilIcon class="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                @click="deleteEmployee(employee.id)"
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
        Showing {{ (employeeStore.currentPage - 1) * 5 + 1 }} to {{ Math.min(employeeStore.currentPage * 5, employeeStore.totalItems) }} of {{ employeeStore.totalItems }} entries
      </div>
      <div class="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          @click="goToPage(employeeStore.currentPage - 1)"
          :disabled="employeeStore.currentPage === 1"
        >
          <ChevronLeftIcon class="h-4 w-4" />
        </Button>
        <Button
          v-for="page in pageNumbers"
          :key="page"
          variant="outline"
          size="sm"
          :class="{ 'bg-primary text-primary-foreground': page === employeeStore.currentPage }"
          @click="typeof page === 'number' ? goToPage(page) : null"
          :disabled="typeof page !== 'number'"
        >
          {{ page }}
        </Button>
        <Button
          variant="outline"
          size="sm"
          @click="goToPage(employeeStore.currentPage + 1)"
          :disabled="employeeStore.currentPage === employeeStore.totalPages"
        >
          <ChevronRightIcon class="h-4 w-4" />
        </Button>
      </div>
    </div>

    <!-- Add Employee Modal -->
    <Dialog v-model:open="isAddEmployeeModalOpen">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Employee</DialogTitle>
          <DialogDescription>
            Enter the details for the new employee.
          </DialogDescription>
        </DialogHeader>
        <form @submit.prevent="addEmployee" class="space-y-4">
          <div class="space-y-2">
            <Label for="name">Name</Label>
            <Input
              id="name"
              v-model="newEmployee.name"
              required
            />
          </div>
          <div class="space-y-2">
            <Label for="address">Address</Label>
            <Input
              id="address"
              v-model="newEmployee.employeeAdress"
              required
            />
          </div>
          <div class="space-y-2">
            <Label for="gender">Gender</Label>
            <Select v-model="newEmployee.employeeGender" required>
              <SelectTrigger>
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem :value="true">Male</SelectItem>
                <SelectItem :value="false">Female</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div class="space-y-2">
            <Label for="dob">Date of Birth</Label>
            <Input
              id="dob"
              type="date"
              v-model="newEmployee.employeeDateOfBirth"
              required
            />
          </div>
          <div class="space-y-2">
            <Label for="department">Department</Label>
            <Select v-model="newEmployee.departmentId" required>
              <SelectTrigger>
                <SelectValue placeholder="Select a department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem v-for="dept in employeeStore.departments.departments" :key="dept.id" :value="dept.id">
                  {{ dept.departmentName}}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div class="space-y-2">
            <Label for="position">Position</Label>
            <Select v-model="newEmployee.positionId" required>
              <SelectTrigger>
                <SelectValue placeholder="Select a position" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem v-for="pos in employeeStore.positions.positions" :key="pos.id" :value="pos.id">
                  {{ pos.positionName }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div class="flex items-center space-x-2">
            <Checkbox id="create-account" v-model="newEmployee.createAccount" />
            <Label for="create-account">Create account for this employee</Label>
          </div>
          <DialogFooter>
            <Button type="submit">Add Employee</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>

    <!-- Edit Employee Modal -->
    <Dialog v-model:open="isEditEmployeeModalOpen">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Employee</DialogTitle>
          <DialogDescription>
            Make changes to the employee information.
          </DialogDescription>
        </DialogHeader>
        <form @submit.prevent="editEmployee" class="space-y-4">
          <div class="space-y-2">
            <Label for="edit-name">Name</Label>
            <Input
              id="edit-name"
              v-model="currentEmployee.name"
              required
            />
          </div>
          <div class="space-y-2">
            <Label for="edit-address">Address</Label>
            <Input
              id="edit-address"
              v-model="currentEmployee.employeeAdress"
              required
            />
          </div>
          <div class="space-y-2">
            <Label for="edit-gender">Gender</Label>
            <Select v-model="currentEmployee.employeeGender" required>
              <SelectTrigger>
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem :value="true">Male</SelectItem>
                <SelectItem :value="false">Female</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div class="space-y-2">
            <Label for="edit-dob">Date of Birth</Label>
            <Input
              id="edit-dob"
              type="date"
              v-model="currentEmployee.employeeDateOfBirth"
              required
            />
          </div>
          <div class="space-y-2">
            <Label for="edit-department">Department</Label>
            <Select v-model="currentEmployee.departmentId" required>
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
            <Label for="edit-position">Position</Label>
            <Select v-model="currentEmployee.positionId" required>
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
          <DialogFooter>
            <Button type="submit">Save Changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>

    <!-- Account Created Modal -->
    <Dialog v-model:open="isAccountCreatedModalOpen">
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
    </Dialog>
  </div>
</template>
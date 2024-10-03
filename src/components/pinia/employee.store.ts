import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

interface Department {
  id: string
  departmentName: string
  departmentDescription?: string
}

interface Position {
  id: string
  positionName: string
  positionDescription?: string
}

interface Employee {
  id: string
  name: string
  employeeAdress: string
  employeeGender: boolean
  employeeDateOfBirth: string
  department: Department
  position: Position
}

interface NewEmployee {
  name: string
  employeeAdress: string
  employeeGender: boolean
  employeeDateOfBirth: string
  departmentId: string
  positionId: string
  createAccount: boolean
}

export const useEmployeeStore = defineStore('employee', () => {
  const employees = ref<Employee[]>([])
  const departments = ref<Department[]>([])
  const positions = ref<Position[]>([])
  const currentPage = ref(1)
  const totalItems = ref(0)
  const itemsPerPage = 5

  const totalPages = computed(() => Math.ceil(totalItems.value / itemsPerPage))

  const fetchEmployees = async (page: number) => {
    try {
      const response = await fetch(`http://localhost:3000/api/employee?page=${page}&limit=${itemsPerPage}`)
      const data = await response.json()
      employees.value = data.employees
      totalItems.value = data.total
      currentPage.value = page
    } catch (error) {
      console.error('Error fetching employees:', error)
    }
  }

  const fetchDepartments = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/department')
      const data = await response.json()
      departments.value = data
    } catch (error) {
      console.error('Error fetching departments:', error)
    }
  }

  const fetchPositions = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/position')
      const data = await response.json()
      positions.value = data
    } catch (error) {
      console.error('Error fetching positions:', error)
    }
  }

  const addEmployee = async (newEmployee: NewEmployee) => {
    try {
      const response = await fetch('http://localhost:3000/api/employee', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newEmployee),
      })
      if (response.ok) {
        const data = await response.json()
        await fetchEmployees(currentPage.value)
        return data
      } else {
        console.error('Failed to add employee')
      }
    } catch (error) {
      console.error('Error adding employee:', error)
    }
  }

  const updateEmployee = async (updatedEmployee: Employee) => {
    try {
      const response = await fetch(`http://localhost:3000/api/employee/${updatedEmployee.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedEmployee),
      })
      if (response.ok) {
        await fetchEmployees(currentPage.value)
      } else {
        console.error('Failed to update employee')
      }
    } catch (error) {
      console.error('Error updating employee:', error)
    }
  }

  const deleteEmployee = async (id: string) => {
    try {
      const response = await fetch(`http://localhost:3000/api/employee/${id}`, {
        method: 'DELETE',
      })
      if (response.ok) {
        await fetchEmployees(currentPage.value)
      } else {
        console.error('Failed to delete employee')
      }
    } catch (error) {
      console.error('Error deleting employee:', error)
    }
  }

  return {
    employees,
    departments,
    positions,
    currentPage,
    totalItems,
    totalPages,
    fetchEmployees,
    fetchDepartments,
    fetchPositions,
    addEmployee,
    updateEmployee,
    deleteEmployee,
  }
})
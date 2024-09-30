import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

interface Department {
  id: string
  departmentName: string
  departmentDescription: string | null
  totalEmployee: number
  headOfDepartment: string | null
  isDeleted: boolean
  updateAt: Date
  createAt: Date
}

export const useDepartmentStore = defineStore('department', () => {
    const departments = ref<Department[]>([])
    const currentPage = ref(1)
    const totalItems = ref(0)
    const itemsPerPage = 5
    const sortColumn = ref('departmentName')
    const sortOrder = ref<'asc' | 'desc'>('asc')

    const totalPages = computed(() => Math.ceil(totalItems.value / itemsPerPage))

    const fetchDepartments = async (page: number) => {
        try {
            const url = `http://localhost:3000/api/department?page=${page}&limit=${itemsPerPage}&sortColumn=${sortColumn.value}&sortOrder=${sortOrder.value}`;
            const response = await fetch(url)
            const data = await response.json()
            departments.value = data.departments
            totalItems.value = data.total
            currentPage.value = page
            // console.log("YOOOOOOOOOOOOO, IM RUNNNINGGGGG")
            console.log(url);

        } catch (error) {
            console.error('Error fetching departments:', error)
        }
    }

    const addDepartment = async (newDepartment: Omit<Department, 'id' | 'isDeleted' | 'updateAt' | 'createAt'>) => {
        try {
        const response = await fetch('http://localhost:3000/api/department', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newDepartment),
        })
        if (response.ok) {
            await fetchDepartments(currentPage.value)
        } else {
            console.error('Failed to add department')
        }
        } catch (error) {
        console.error('Error adding department:', error)
        }
    }

    const updateDepartment = async (updatedDepartment: Omit<Department, 'isDeleted' | 'updateAt' | 'createAt'>) => {
        try {
        const { id, ...updatedDepartmentWithoutId } = updatedDepartment
        const response = await fetch(`http://localhost:3000/api/department/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedDepartmentWithoutId),
        })
        if (response.ok) {
            await fetchDepartments(currentPage.value)
        } else {
            console.error('Failed to update department')
        }
        } catch (error) {
        console.error('Error updating department:', error)
        }
    }

    const deleteDepartment = async (id: string) => {
        try {
        const response = await fetch(`http://localhost:3000/api/department/${id}`, {
            method: 'DELETE',
        })
        if (response.ok) {
            await fetchDepartments(currentPage.value)
        } else {
            console.error('Failed to delete department')
        }
        } catch (error) {
        console.error('Error deleting department:', error)
        }
    }

    const setSorting = (column: string, order: 'asc' | 'desc') => {
        sortColumn.value = column
        sortOrder.value = order
    }

    return {
        departments,
        currentPage,
        totalItems,
        totalPages,
        sortColumn,
        sortOrder,
        fetchDepartments,
        addDepartment,
        updateDepartment,
        deleteDepartment,
        setSorting,
    }
})


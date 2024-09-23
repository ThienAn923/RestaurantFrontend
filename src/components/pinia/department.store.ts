import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

interface Department {
    id: string,
    departmentName: string,
    departmentDescription: string,
}

export const useDepartmentStore = defineStore('department', () => {
    const departments = ref<Department[]>([])
    const currentPage = ref(1)
    const totalItems = ref(0)
    const itemsPerPage = 5

    const totalPages = computed(() => Math.ceil(totalItems.value / itemsPerPage))

    const fetchDepartments = async (page: number) => {
        try {
            const response = await fetch(`http://localhost:3000/api/department?page=${page}&limit=${itemsPerPage}`)
            const data = await response.json()
            departments.value = data.departments
            totalItems.value = data.total
            currentPage.value = page
        } catch (error) {
            console.error('Error fetching departments:', error)
        }
    }

    const addDepartment = async (newDepartment: Omit<Department, 'id'>) => {
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
            console.error('Error adding department:', error);
        }
    }

    const updateDepartment = async (updatedDepartment: Department) => {
        try {
            const {id, ...updatedDepartmentWithoutId} = updatedDepartment;
            console.log(JSON.stringify(updatedDepartmentWithoutId));
            const response = await fetch(`http://localhost:3000/api/department/${updatedDepartment.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedDepartmentWithoutId),
            })
            if (response.ok) {
                await fetchDepartments(currentPage.value)
            } else {
                console.error('Failed to update department')
                const responseBody = await response.text(); // read the response body
                console.error('Response body:', responseBody);
                
                
            }
        } catch (error) {
            console.error('Error updating department:', error);
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
            console.error('Error deleting department:', error);
        }
    }

    return {
        departments,
        currentPage,
        totalItems,
        totalPages,
        fetchDepartments,
        addDepartment,
        updateDepartment,
        deleteDepartment,
    }
})
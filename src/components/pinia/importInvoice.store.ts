import { defineStore } from 'pinia'
import { ref, computed } from 'vue'


interface Employee {
    id: string
    name: string
    employeeAdress: string
    employeeGender: boolean
    employeeDateOfBirth: string
  }
  interface Provider {
    id: string,
    providerName: string,
    providerDescription: string,
}
interface Ingredient {
    id: string
    ingredientName: string
    ingredientTypeID: string
    ingredientType: string
  }
  
interface ImportInvoice {
  id: string,
  Provider: Provider
  Employee: Employee
  importDate: string
  totalExpense: number,
  importInvoiceDetail: ImportInvoiceDetail[]
}
interface ImportInvoiceDetail {
    id: string,
    importInvoiceID: string,
    ingredientID: string,
    quantity: number,
    totalExpense: number
}

export const useImportInvoiceStore = defineStore('importinvoice', () => {
  const importInvoices = ref<ImportInvoice[]>([])
  const employees = ref<Employee[]>([])
  const ingredients = ref<Ingredient[]>([])
  const providers = ref<Provider[]>([])
  const currentPage = ref(1)
  const totalItems = ref(0)
  const itemsPerPage = 5

  const totalPages = computed(() => Math.ceil(totalItems.value / itemsPerPage))

  const fetchEmployees = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/employee')
      const data = await response.json()
      employees.value = data.employees
    } catch (error) {
      console.error('Error fetching employees:', error)
    }
  }
  const fetchIngredients = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/ingredient')
      const data = await response.json()
      ingredients.value = data.ingredients
    } catch (error) {
      console.error('Error fetching employees:', error)
    }
  }
  const fetchProviders = async () => {
    try {
        const response = await fetch('http://localhost:3000/api/provider')
        const data = await response.json()
        providers.value = data.providers
    } catch (error) {
        console.error('Error fetching providers:', error)
    }
}
  const fetchImportInvoices = async (page: number) => {
    try {
      const response = await fetch(`http://localhost:3000/api/importinvoice?page=${page}&limit=${itemsPerPage}`)
      const data = await response.json()
      importInvoices.value = data
      totalItems.value = data.total
      currentPage.value = page
      console.log(importInvoices.value)
    } catch (error) {
      console.error('Error fetching import invoices:', error)
    }
  }

  const addImportInvoice = async (newImportInvoice: Omit<ImportInvoice, 'id'>) => {
    try {
      const response = await fetch('http://localhost:3000/api/importinvoice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newImportInvoice),
      })
      if (response.ok) {
        await fetchImportInvoices(currentPage.value)
      } else {
        console.error('Failed to add import invoice')
      }
    } catch (error) {
      console.error('Error adding import invoice:', error)
    }
  }

  const updateImportInvoice = async (updatedImportInvoice: ImportInvoice) => {
    try {
      const { id, ...updatedImportInvoiceWithoutId } = updatedImportInvoice
      const response = await fetch(`http://localhost:3000/api/importinvoice/${updatedImportInvoice.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedImportInvoiceWithoutId),
      })
      if (response.ok) {
        await fetchImportInvoices(currentPage.value)
      } else {
        console.error('Failed to update import invoice')
        const responseBody = await response.text()
        console.error('Response body:', responseBody)
      }
    } catch (error) {
      console.error('Error updating import invoice:', error)
    }
  }

  const deleteImportInvoice = async (id: string) => {
    try {
      const response = await fetch(`http://localhost:3000/api/importinvoice/${id}`, {
        method: 'DELETE',
      })
      if (response.ok) {
        await fetchImportInvoices(currentPage.value)
      } else {
        console.error('Failed to delete import invoice')
      }
    } catch (error) {
      console.error('Error deleting import invoice:', error)
    }
  }

  return {
    importInvoices,
    employees,
    providers,
    ingredients,
    currentPage,
    totalItems,
    totalPages,
    fetchEmployees,
    fetchIngredients,
    fetchProviders,
    fetchImportInvoices,
    addImportInvoice,
    updateImportInvoice,
    deleteImportInvoice,
  }
})
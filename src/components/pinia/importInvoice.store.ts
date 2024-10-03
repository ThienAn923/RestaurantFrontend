import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

interface Employee {
  id: string
  employeeAdress: string
  employeeGender: boolean
  employeeDateOfBirth: string
  employeePhoneNumber: string
  employeeEmail: string
  personId: string
  isDeleted: boolean
  updateAt: string
  createAt: string
  person: Person
}

interface Person {
  id: string
  name: string
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
  price: number,
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
  const sortColumn = ref('importDate')
  const sortOrder = ref<'asc' | 'desc'>('desc')

  const totalPages = computed(() => Math.ceil(totalItems.value / itemsPerPage))

  const fetchEmployees = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/employee')
      const data = await response.json()
      employees.value = data
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
      console.error('Error fetching ingredients:', error)
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

  const fetchImportInvoices = async (page: number, sortCol: string = sortColumn.value, sortOrd: 'asc' | 'desc' = sortOrder.value) => {
    try {
      const response = await fetch(`http://localhost:3000/api/importinvoice?page=${page}&limit=${itemsPerPage}&sortColumn=${sortCol}&sortOrder=${sortOrd}`)
      const data = await response.json()
      importInvoices.value = data.importInvoices
      totalItems.value = data.total
      currentPage.value = page
      sortColumn.value = sortCol
      sortOrder.value = sortOrd
    } catch (error) {
      console.error('Error fetching import invoices:', error)
    }
  }

  const addImportInvoice = async (newImportInvoice: Omit<ImportInvoice, 'id'>) => {
    try {
      console.log(newImportInvoice)
      const totalExpense = newImportInvoice.importInvoiceDetails.reduce((acc, detail) => acc + detail.totalExpense, 0);
      const importInvoiceData = {
        providerId: newImportInvoice.providerId,
        employeeId: newImportInvoice.employeeId,
        totalExpense: totalExpense,
        importInvoiceDetails: newImportInvoice.importInvoiceDetails.map(detail => ({
          ingredientId: detail.id,
          quantity: detail.quantity,
          price: detail.price,
          totalExpense: detail.totalExpense // This should match the 'total' calculated in the component
        }))
      };
      //debug
      console.log(JSON.stringify(importInvoiceData))

      const response = await fetch('http://localhost:3000/api/importinvoice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(importInvoiceData),
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
    sortColumn,
    sortOrder,
    fetchEmployees,
    fetchIngredients,
    fetchProviders,
    fetchImportInvoices,
    addImportInvoice,
    deleteImportInvoice,
  }
})
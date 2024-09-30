import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

interface DishType {
  id: string
  DishTypeName: string
  DishTypeDescription: string
  DishTypeAvailable: boolean
  createAt: string
}

export const useDishTypeStore = defineStore('dishType', () => {
  const dishTypes = ref<DishType[]>([])
  const currentPage = ref(1)
  const totalItems = ref(0)
  const itemsPerPage = 5
  const sortColumn = ref('DishTypeName')
  const sortOrder = ref<'asc' | 'desc'>('asc')

  const totalPages = computed(() => Math.ceil(totalItems.value / itemsPerPage))

  const fetchDishTypes = async (page: number) => {
    try {
      const response = await fetch(`http://localhost:3000/api/dishType?page=${page}&limit=${itemsPerPage}&sortColumn=${sortColumn.value}&sortOrder=${sortOrder.value}`)
      const data = await response.json()
      dishTypes.value = data.dishTypes
      totalItems.value = data.total
      currentPage.value = page
    } catch (error) {
      console.error('Error fetching dish types:', error)
    }
  }

  const addDishType = async (newDishType: Omit<DishType, 'id' | 'createAt' | 'updateAt'>) => {
    try {
      const response = await fetch('http://localhost:3000/api/dishType', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newDishType),
      })
      console.log(JSON.stringify(newDishType))
      if (response.ok) {
        await fetchDishTypes(currentPage.value)
      } else {
        console.error('Failed to add dish type')
      }
    } catch (error) {
      console.error('Error adding dish type:', error)
    }
  }

  const updateDishType = async (updatedDishType: DishType) => {
    try {
      const { id, ...updatedDishTypeWithoutId } = updatedDishType
      const response = await fetch(`http://localhost:3000/api/dishType/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedDishTypeWithoutId),
      })
      if (response.ok) {
        await fetchDishTypes(currentPage.value)
      } else {
        console.error('Failed to update dish type')
      }
    } catch (error) {
      console.error('Error updating dish type:', error)
    }
  }

  const deleteDishType = async (id: string) => {
    try {
      const response = await fetch(`http://localhost:3000/api/dishType/${id}`, {
        method: 'DELETE',
      })
      if (response.ok) {
        await fetchDishTypes(currentPage.value)
      } else {
        console.error('Failed to delete dish type')
      }
    } catch (error) {
      console.error('Error deleting dish type:', error)
    }
  }

  const setSorting = (column: string, order: 'asc' | 'desc') => {
    sortColumn.value = column
    sortOrder.value = order
  }

  return {
    dishTypes,
    currentPage,
    totalItems,
    totalPages,
    fetchDishTypes,
    addDishType,
    updateDishType,
    deleteDishType,
    setSorting,
    sortColumn,
    sortOrder,
  }
})
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axiosInstance, {type ApiResponse} from '../services/axiosInstance'

interface IngredientType {
  id: string
  ingredientTypeName: string
  ingredientTypeDescription: string
  createAt: Date
  updatedAt: Date
}

interface Ingredient {
  id: string
  ingredientName: string
  ingredientTypeID: string
  ingredientType: IngredientType
  createAt: Date
}

export const useIngredientStore = defineStore('ingredient', () => {
  const ingredients = ref<Ingredient[]>([])
  const ingredientTypes = ref<IngredientType[]>([])
  const currentPage = ref(1)
  const totalItems = ref(0)
  const itemsPerPage = 5
  const sortColumn = ref('createAt')
  const sortOrder = ref<'desc' | 'asc'>('desc')
  const search = ref('')
  const filter = ref('AllTypes')

  const totalPages = computed(() => Math.ceil(totalItems.value / itemsPerPage))

  const fetchIngredients = async (page: number) => {
    try {
      const response = await axiosInstance.get<ApiResponse<Ingredient[]>>("/ingredient", {
        params: {
          page: page,
          limit: itemsPerPage,
          sortColumn: sortColumn.value,
          sortOrder: sortOrder.value,
          filter: filter.value,
          search: search.value,
        },
      });

      ingredients.value = response.data.data;
      totalItems.value = response.data.total;
      currentPage.value = page
    } catch (error) {
      console.error('Error fetching ingredients:', error)
    }
  }

  //this will return all the ingredient types, NOT in pages
  const fetchIngredientTypes = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/ingredientType')
      const data = await response.json()
      ingredientTypes.value = data
      console.log(data);
    } catch (error) {
      console.error('Error fetching ingredient types:', error)
    }
  }

  const addIngredient = async (newIngredient: Omit<Ingredient, 'id' | 'ingredientType'>) => {
    try {
      const response = await fetch('http://localhost:3000/api/ingredient', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newIngredient),
      })
      console.log(JSON.stringify(newIngredient));
      if (response.ok) {
        await fetchIngredients(currentPage.value)
      } else {
        console.error('Failed to add ingredient')
      }
    } catch (error) {
      console.error('Error adding ingredient:', error)
    }
  }

  const updateIngredient = async (updatedIngredient: Omit<Ingredient, 'ingredientType'>) => {
    try {
      //i have absolute no idea why there's an error here, but it works lololol. Will fix later
      const { id, ...updatedIngredientWithoutId } = updatedIngredient
      // const { ingredientTypeId, ...updatedIngredientWithoutType } = updatedIngredientWithoutId
      const response = await fetch(`http://localhost:3000/api/ingredient/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedIngredientWithoutId),
      })
      console.log(JSON.stringify(updatedIngredientWithoutId));
      if (response.ok) {
        await fetchIngredients(currentPage.value)
      } else {
        console.error('Failed to update ingredient')
      }
    } catch (error) {
      console.error('Error updating ingredient:', error)
    }
  }

  const deleteIngredient = async (id: string) => {
    try {
      const response = await fetch(`http://localhost:3000/api/ingredient/${id}`, {
        method: 'DELETE',
      })
      if (response.ok) {
        await fetchIngredients(currentPage.value)
      } else {
        console.error('Failed to delete ingredient')
      }
    } catch (error) {
      console.error('Error deleting ingredient:', error)
    }
  }

  const addIngredientType = async (newIngredientType: Omit<IngredientType, 'id'>) => {
    try {
      const response = await fetch('http://localhost:3000/api/ingredientType', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newIngredientType),
      })
      if (response.ok) {
        await fetchIngredientTypes()
      } else {
        console.error('Failed to add ingredient type')
      }
    } catch (error) {
      console.error('Error adding ingredient type:', error)
    }
  }

  const setSorting = (column: string, order: 'asc' | 'desc') => {
    sortColumn.value = column
    sortOrder.value = order
  }
  const setFilter = (filterValue: string) => {
    filter.value = filterValue;
  }
  const setSearch = (searchValue: string) => {
    search.value = searchValue;
  }


  return {
    ingredients,
    ingredientTypes,
    currentPage,
    totalItems,
    totalPages,
    fetchIngredients,
    fetchIngredientTypes,
    addIngredient,
    updateIngredient,
    deleteIngredient,
    addIngredientType,
    setSorting,
    setFilter,
    setSearch,
  }
})
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

interface IngredientType {
    id: string,
    ingredientTypeName: string,
    ingredientTypeDescription: string,
}

export const useIngredientTypeStore = defineStore('ingredientType', () => {
    const ingredientTypes = ref<IngredientType[]>([])
    const currentPage = ref(1)
    const totalItems = ref(0)
    const itemsPerPage = 5

    const totalPages = computed(() => Math.ceil(totalItems.value / itemsPerPage))

    const fetchIngredientTypes = async (page: number) => {
        try {
            const response = await fetch(`http://localhost:3000/api/ingredientType?page=${page}&limit=${itemsPerPage}`)
            const data = await response.json()
            ingredientTypes.value = data.ingredientTypes
            totalItems.value = data.total
            currentPage.value = page
        } catch (error) {
            console.error('Error fetching ingredientTypes:', error)
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
                await fetchIngredientTypes(currentPage.value)
            } else {
                console.error('Failed to add ingredientType')
            }
        } catch (error) {
            console.error('Error adding ingredientType:', error);
        }
    }

    const updateIngredientType = async (updatedIngredientType: IngredientType) => {
        try {
            const {id, ...updatedIngredientTypeWithoutId} = updatedIngredientType;
            console.log(JSON.stringify(updatedIngredientTypeWithoutId));
            const response = await fetch(`http://localhost:3000/api/ingredientType/${updatedIngredientType.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedIngredientTypeWithoutId),
            })
            if (response.ok) {
                await fetchIngredientTypes(currentPage.value)
            } else {
                console.error('Failed to update ingredientType')
                const responseBody = await response.text(); // read the response body
                console.error('Response body:', responseBody);
                
                
            }
        } catch (error) {
            console.error('Error updating ingredientType:', error);
        }
    }

    const deleteIngredientType = async (id: string) => {
        try {
            const response = await fetch(`http://localhost:3000/api/ingredientType/${id}`, {
                method: 'DELETE',
            })
            if (response.ok) {
                await fetchIngredientTypes(currentPage.value)
            } else {
                console.error('Failed to delete ingredientType')
            }
        } catch (error) {
            console.error('Error deleting ingredientType:', error);
        }
    }

    return {
        ingredientTypes,
        currentPage,
        totalItems,
        totalPages,
        fetchIngredientTypes,
        addIngredientType,
        updateIngredientType,
        deleteIngredientType,
    }
})
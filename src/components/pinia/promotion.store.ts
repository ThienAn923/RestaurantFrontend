import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

interface Dish {
  id: string
  name: string
}

interface Promotion {
  id: string
  promotionName: string
  promotionDescription: string | null
  discount: number
  startDate: string
  endDate: string
  isAfterDish: boolean
  dishID: string
}

export const usePromotionStore = defineStore('promotion', () => {
  const promotions = ref<Promotion[]>([])
  const dishes = ref<Dish[]>([])
  const currentPage = ref(1)
  const totalItems = ref(0)
  const itemsPerPage = 5

  const totalPages = computed(() => Math.ceil(totalItems.value / itemsPerPage))

  const fetchPromotions = async (page: number) => {
    try {
      const response = await fetch(`http://localhost:3000/api/promotion?page=${page}&limit=${itemsPerPage}`)
      const data = await response.json()
      promotions.value = data.promotions
      totalItems.value = data.total
      currentPage.value = page
      console.log(data)
    } catch (error) {
      console.error('Error fetching promotions:', error)
    }
  }

  const fetchDishes = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/dish')
      const data = await response.json()
      dishes.value = data
    } catch (error) {
      console.error('Error fetching dishes:', error)
    }
  }

  const addPromotion = async (newPromotion: Omit<Promotion, 'id'>) => {
    try {
      const response = await fetch('http://localhost:3000/api/promotion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPromotion),
      })
      if (response.ok) {
        await fetchPromotions(currentPage.value)
      } else {
        console.error('Failed to add promotion')
      }
    } catch (error) {
      console.error('Error adding promotion:', error)
    }
  }

  const updatePromotion = async (updatedPromotion: Promotion) => {
    try {
      const response = await fetch(`http://localhost:3000/api/promotion/${updatedPromotion.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedPromotion),
      })
      if (response.ok) {
        await fetchPromotions(currentPage.value)
      } else {
        console.error('Failed to update promotion')
      }
    } catch (error) {
      console.error('Error updating promotion:', error)
    }
  }

  const deletePromotion = async (id: string) => {
    try {
      const response = await fetch(`http://localhost:3000/api/promotion/${id}`, {
        method: 'DELETE',
      })
      if (response.ok) {
        await fetchPromotions(currentPage.value)
      } else {
        console.error('Failed to delete promotion')
      }
    } catch (error) {
      console.error('Error deleting promotion:', error)
    }
  }

  return {
    promotions,
    dishes,
    currentPage,
    totalItems,
    totalPages,
    fetchPromotions,
    fetchDishes,
    addPromotion,
    updatePromotion,
    deletePromotion,
  }
})
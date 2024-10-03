import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

interface Position {
    id: string
    positionName: string
    positionDescription: string | null
    totalEmployee: number
    headOfPosition: string | null
    isDeleted: boolean
    updateAt: Date
    createAt: Date
}

export const usePositionStore = defineStore('position', () => {
    const positions = ref<Position[]>([])
    const currentPage = ref(1)
    const totalItems = ref(0)
    const itemsPerPage = 5
    const sortColumn = ref('positionName')
    const sortOrder = ref<'asc' | 'desc'>('asc')

    const totalPages = computed(() => Math.ceil(totalItems.value / itemsPerPage))

    const fetchPositions = async (page: number) => {
        try {
            const url = `http://localhost:3000/api/position?page=${page}&limit=${itemsPerPage}&sortColumn=${sortColumn.value}&sortOrder=${sortOrder.value}`;
            const response = await fetch(url)
            const data = await response.json()
            positions.value = data.positions
            totalItems.value = data.total
            currentPage.value = page
            console.log(url);
        } catch (error) {
            console.error('Error fetching positions:', error)
        }
    }

    const addPosition = async (newPosition: Omit<Position, 'id' | 'isDeleted' | 'updateAt' | 'createAt'>) => {
        try {
            console.log(JSON.stringify(newPosition));
            const response = await fetch('http://localhost:3000/api/position', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newPosition),
            })
            if (response.ok) {
                await fetchPositions(currentPage.value)
            } else {
                console.error('Failed to add position')
            }
        } catch (error) {
            console.error('Error adding position:', error)
        }
    }

    const updatePosition = async (updatedPosition: Omit<Position, 'isDeleted' | 'updateAt' | 'createAt'>) => {
        try {
            const { id, ...updatedPositionWithoutId } = updatedPosition
            const response = await fetch(`http://localhost:3000/api/position/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedPositionWithoutId),
            })
            if (response.ok) {
                await fetchPositions(currentPage.value)
            } else {
                console.error('Failed to update position')
                const responseBody = await response.text()
                console.error('Response body:', responseBody)
            }
        } catch (error) {
            console.error('Error updating position:', error)
        }
    }

    const deletePosition = async (id: string) => {
        try {
            const response = await fetch(`http://localhost:3000/api/position/${id}`, {
                method: 'DELETE',
            })
            if (response.ok) {
                await fetchPositions(currentPage.value)
            } else {
                console.error('Failed to delete position')
            }
        } catch (error) {
            console.error('Error deleting position:', error)
        }
    }

    const setSorting = (column: string, order: 'asc' | 'desc') => {
        sortColumn.value = column
        sortOrder.value = order
    }

    return {
        positions,
        currentPage,
        totalItems,
        totalPages,
        sortColumn,
        sortOrder,
        fetchPositions,
        addPosition,
        updatePosition,
        deletePosition,
        setSorting,
    }
})
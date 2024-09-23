import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

interface Position {
    id: string,
    positionName: string,
    positionDescription: string,
}

export const usePositionStore = defineStore('position', () => {
    const positions = ref<Position[]>([])
    const currentPage = ref(1)
    const totalItems = ref(0)
    const itemsPerPage = 5

    const totalPages = computed(() => Math.ceil(totalItems.value / itemsPerPage))

    const fetchPositions = async (page: number) => {
        try {
            const response = await fetch(`http://localhost:3000/api/position?page=${page}&limit=${itemsPerPage}`)
            const data = await response.json()
            positions.value = data.positions
            totalItems.value = data.total
            currentPage.value = page
        } catch (error) {
            console.error('Error fetching positions:', error)
        }
    }

    const addPosition = async (newPosition: Omit<Position, 'id'>) => {
        try {
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
            console.error('Error adding position:', error);
        }
    }

    const updatePosition = async (updatedPosition: Position) => {
        try {
            const {id, ...updatedPositionWithoutId} = updatedPosition;
            console.log(JSON.stringify(updatedPositionWithoutId));
            const response = await fetch(`http://localhost:3000/api/position/${updatedPosition.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedPositionWithoutId),
            })
            if (response.ok) {
                await fetchPositions(currentPage.value)
            } else {
                console.error('Failed to update position')
                const responseBody = await response.text(); // read the response body
                console.error('Response body:', responseBody);
                
                
            }
        } catch (error) {
            console.error('Error updating position:', error);
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
            console.error('Error deleting position:', error);
        }
    }

    return {
        positions,
        currentPage,
        totalItems,
        totalPages,
        fetchPositions,
        addPosition,
        updatePosition,
        deletePosition,
    }
})
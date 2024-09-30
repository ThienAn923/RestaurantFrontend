import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

interface Provider {
  id: string
  providerName: string
  providerDescription: string | null
  providerPhoneNumber: string | null
  providerEmail: string | null
  providerAddress: string | null
  providerStatus: string | null
  createAt: Date
  updateAt: Date
}

export const useProviderStore = defineStore('provider', () => {
  const providers = ref<Provider[]>([])
  const currentPage = ref(1)
  const totalItems = ref(0)
  const itemsPerPage = 5
  const sortColumn = ref('providerName')
  const sortOrder = ref<'asc' | 'desc'>('asc')

  const totalPages = computed(() => Math.ceil(totalItems.value / itemsPerPage))

  const fetchProviders = async (page: number) => {
    try {
      const response = await fetch(`http://localhost:3000/api/provider?page=${page}&limit=${itemsPerPage}&sortColumn=${sortColumn.value}&sortOrder=${sortOrder.value}`)
      const data = await response.json()
      providers.value = data.providers
      totalItems.value = data.total
      currentPage.value = page
    } catch (error) {
      console.error('Error fetching providers:', error)
    }
  }

  const addProvider = async (newProvider: Omit<Provider, 'id' | 'createAt' | 'updateAt'>) => {
    try {
      console.log(JSON.stringify(newProvider));
      const response = await fetch('http://localhost:3000/api/provider', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProvider),
      })

      
      
      if (response.ok) {
        await fetchProviders(currentPage.value)
      } else {
        console.error('Failed to add provider')
      }
    } catch (error) {
      console.error('Error adding provider:', error)
    }
  }
  const updateProvider = async (updatedProvider: Provider) => {
    try {
      const { id, ...updatedProviderWithoutId } = updatedProvider
      const response = await fetch(`http://localhost:3000/api/provider/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedProviderWithoutId),
      })
      if (response.ok) {
        await fetchProviders(currentPage.value)
      } else {
        console.error('Failed to update provider')
      }
    } catch (error) {
      console.error('Error updating provider:', error)
    }
  }

  const deleteProvider = async (id: string) => {
    try {
      const response = await fetch(`http://localhost:3000/api/provider/${id}`, {
        method: 'DELETE',
      })
      if (response.ok) {
        await fetchProviders(currentPage.value)
      } else {
        console.error('Failed to delete provider')
      }
    } catch (error) {
      console.error('Error deleting provider:', error)
    }
  }

  const setSorting = (column: string, order: 'asc' | 'desc') => {
    sortColumn.value = column
    sortOrder.value = order
  }

  return {
    providers,
    currentPage,
    totalItems,
    totalPages,
    fetchProviders,
    addProvider,
    updateProvider,
    deleteProvider,
    setSorting,
  }
})

// import { defineStore } from 'pinia'
// import { ref, computed } from 'vue'

// interface Provider {
//     id: string,
//     providerName: string,
//     providerDescription: string,
// }

// export const useProviderStore = defineStore('provider', () => {
//     const providers = ref<Provider[]>([])
//     const currentPage = ref(1)
//     const totalItems = ref(0)
//     const itemsPerPage = 5

//     const totalPages = computed(() => Math.ceil(totalItems.value / itemsPerPage))

//     const fetchProviders = async (page: number) => {
//         try {
//             const response = await fetch(`http://localhost:3000/api/provider?page=${page}&limit=${itemsPerPage}`)
//             const data = await response.json()
//             providers.value = data.providers
//             totalItems.value = data.total
//             currentPage.value = page
//         } catch (error) {
//             console.error('Error fetching providers:', error)
//         }
//     }

//     const addProvider = async (newProvider: Omit<Provider, 'id'>) => {
//         try {
//             const response = await fetch('http://localhost:3000/api/provider', {
//                 method: 'POST',
//                 headers: { 'Content-Type': 'application/json' },
//                 body: JSON.stringify(newProvider),
//             })
//             if (response.ok) {
//                 await fetchProviders(currentPage.value)
//             } else {
//                 console.error('Failed to add provider')
//             }
//         } catch (error) {
//             console.error('Error adding provider:', error);
//         }
//     }

//     const updateProvider = async (updatedProvider: Provider) => {
//         try {
//             const {id, ...updatedProviderWithoutId} = updatedProvider;
//             console.log(JSON.stringify(updatedProviderWithoutId));
//             const response = await fetch(`http://localhost:3000/api/provider/${updatedProvider.id}`, {
//                 method: 'PUT',
//                 headers: { 'Content-Type': 'application/json' },
//                 body: JSON.stringify(updatedProviderWithoutId),
//             })
//             if (response.ok) {
//                 await fetchProviders(currentPage.value)
//             } else {
//                 console.error('Failed to update provider')
//                 const responseBody = await response.text(); // read the response body
//                 console.error('Response body:', responseBody);
                
                
//             }
//         } catch (error) {
//             console.error('Error updating provider:', error);
//         }
//     }

//     const deleteProvider = async (id: string) => {
//         try {
//             const response = await fetch(`http://localhost:3000/api/provider/${id}`, {
//                 method: 'DELETE',
//             })
//             if (response.ok) {
//                 await fetchProviders(currentPage.value)
//             } else {
//                 console.error('Failed to delete provider')
//             }
//         } catch (error) {
//             console.error('Error deleting provider:', error);
//         }
//     }

//     return {
//         providers,
//         currentPage,
//         totalItems,
//         totalPages,
//         fetchProviders,
//         addProvider,
//         updateProvider,
//         deleteProvider,
//     }
// })
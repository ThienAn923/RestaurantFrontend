import {defineStore} from 'pinia'
import {ref, computed} from 'vue'
import axiosInstance, {ApiResponse} from '../services/axiosInstance'

interface ClientTemporary {
    id: string
    name: string
    phoneNumber: string
    point: number
    createAt: Date
    updateAt: Date
}

export const useClientTemporaryStore = defineStore('clientTemporary', () => {
    const clientsTemporary = ref<ClientTemporary[]>([]) //it have an "s" in client, beware
    const currentPage = ref(1)
    const totalItems = ref(0)
    const itemsPerPage = 3
    const sortColumn = ref('createAt')
    const search = ref('')

    const totalPages = computed(() => Math.ceil(totalItems.value / itemsPerPage))


    const fetchClientTemporary = async(page: number) => {
        try {
            console.log("Search value", search.value);
            const response = await axiosInstance.get<ApiResponse<ClientTemporary[]>>('/clientTemporary',{
                params: {
                    page: page,
                    limit: 5,
                    sortColumn: 'createAt',
                    sortOrder: 'desc',
                    search: search.value
                }
            })

            clientsTemporary.value = response.data.data
            console.log(JSON.stringify(response.data.data));
            totalItems.value = response.data.total
            currentPage.value = page
        } catch (error) {
            console.error('Error fetching clientTemporary:', error)
        }
    }

    const fetchClientTemporaryById = async(id: string) => {
        try {
            const response = await axiosInstance.get(`/clientTemporary/${id}`)
            return response.data.data
        } catch (error) {
            console.error('Error fetching clientTemporary by id:', error)
        }
    }

    const addClientTemporary = async (clientTemporary: Omit<ClientTemporary, 'id | createAt | updateAt'>) => {
        try {
            const response = await axiosInstance.post('/clientTemporary', clientTemporary)
            if(response.status === 201){
                await fetchClientTemporary(currentPage.value) //refresh the data
            }
        } catch (error) {
            console.error('Error adding clientTemporary:', error)
        }
    }

    const updateClientTemporary = async(clientTemporary: Omit<ClientTemporary, 'createAt' | 'updateAt'>) => {
        try {
            console.log("id and clientTemporary", clientTemporary.id, clientTemporary);
            const response = await axiosInstance.put(`/clientTemporary/${clientTemporary.id}`, clientTemporary)
            if(response.status === 200){
                await fetchClientTemporary(currentPage.value) //refresh the data
            }
        } catch (error) {
            console.error('Error updating clientTemporary:', error)
        }
    }

    const deleteClientTemporary = async(id: string) => {
        try {
            const response = await axiosInstance.delete(`/clientTemporary/${id}`)
            if(response.status === 204){
                await fetchClientTemporary(currentPage.value) //refresh the data
            }
        } catch (error) {
            console.error('Error deleting clientTemporary:', error)
        }
    }
    const setSearch = (value: string) => {
        search.value = value
    }

    return{
        clientsTemporary,
        currentPage,
        totalItems,
        itemsPerPage,
        sortColumn,
        search,
        totalPages,

        addClientTemporary,
        fetchClientTemporary,
        updateClientTemporary,
        deleteClientTemporary,
        fetchClientTemporaryById,
        setSearch,

    }
})
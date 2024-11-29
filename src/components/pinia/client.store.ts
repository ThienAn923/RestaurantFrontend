import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import axiosInstance, {ApiResponse} from '../services/axiosInstance'

interface Client {
  id: string;
  name: string;
  personId: string;
  email: string;
  phone: string;
  gender: boolean;
  profilePicture: string;
}

export const useClientStore = defineStore('client', () => {
  const clients = ref<Client[]>([]);
  const currentPage = ref(1);
  const totalItems = ref(0);
  const itemsPerPage = 5;
  const totalPages = computed(() => Math.ceil(totalItems.value / itemsPerPage));
  const sortColumn = ref('createAt')
  const sortOrder = ref('desc')
  const search = ref('')

  const fetchClients = async(page: number, limit?:number) => {
        try {
            console.log("check params", page, limit,  search.value);
            const response = await axiosInstance.get<ApiResponse<Client[]>>('/client',{
                params: {
                    page: page,
                    limit: limit ?? 2, //this thing is like magic lmao, i can call the function with or without the limit parameter. BLACK MAGIC!!
                    sortColumn: sortColumn.value,
                    sortOrder: sortOrder.value,
                    search: search.value
                }
            })

            clients.value = response.data.data
            console.log(response.data.data);
            totalItems.value = response.data.total
            currentPage.value = page
        } catch (error) {
            console.error('Error fetching clients:', error)
        }
    }

  const addClient = async (newClient: Omit<Client, 'id'>) => {
    try {
      const response = await fetch('http://localhost:3000/api/client', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newClient),
      });
      if (response.ok) {
        await fetchClients(currentPage.value);
      } else {
        console.error('Failed to add client');
      }
    } catch (error) {
      console.error('Error adding client:', error);
    }
  };

  const fetchClientById = async (id: string) => {
    try {
      const response = await fetch(`http://localhost:3000/api/client/${id}`);
      if (response.ok) {
        return await response.json();
      } else {
        console.error('Failed to fetch client');
      }
    } catch (error) {
      console.error('Error fetching client:', error);
    }
  }
  const updateClient = async (updatedClient: Client) => {
    try {
      const { id, ...clientData } = updatedClient;
      const response = await fetch(`http://localhost:3000/api/client/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(clientData),
      });
      if (response.ok) {
        await fetchClients(currentPage.value);
      } else {
        console.error('Failed to update client');
      }
    } catch (error) {
      console.error('Error updating client:', error);
    }
  };

  const deleteClient = async (id: string) => {
    try {
      const response = await fetch(`http://localhost:3000/api/client/${id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        await fetchClients(currentPage.value);
      } else {
        console.error('Failed to delete client');
      }
    } catch (error) {
      console.error('Error deleting client:', error);
    }
  };

  const banAccount = async (id: string, reason: string) => {
    try {
      const response = await axiosInstance.put(`/client/${id}/ban`, { reason });
      if (response.status === 200) {
        await fetchClients(currentPage.value, 5);
      } else {
        console.error('Failed to ban client');
      }
    } catch (error) {
      console.error('Error banning client:', error);
    }
  }

  const unbanAccount = async (id: string) => { 
    try {
      const response = await axiosInstance.put(`/client/${id}/unban`);
      if (response.status === 200) {
        await fetchClients(currentPage.value, 5);
      } else {
        console.error('Failed to unban client');
      }
    } catch (error) {
      console.error('Error unbanning client:', error);
    }
  }


  const setSearch = (searchValue: string) => {
    search.value = searchValue;
  }
  const setSorting = (column: string, order: string) => {
    sortColumn.value = column;
    sortOrder.value = order;
  }

  return {
    clients,
    currentPage,
    totalItems,
    totalPages,
    fetchClients,
    addClient,
    updateClient,
    deleteClient,
    setSearch,
    setSorting,
    banAccount,
    fetchClientById,
    unbanAccount,
  };
});

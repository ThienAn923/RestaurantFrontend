import { defineStore } from 'pinia'
import { ref } from 'vue'
import axiosInstance, { ApiResponse } from '../services/axiosInstance'


interface Dish {
    id: string;
    name: string;
    description: string;
    cost: number[];
    images: Image[];
    available: boolean;
    timeToCook: number;
}

interface Image{
    id: string;
    Link: string;
    createAt: string;
    updateAt: string;
    dishId: string;
}

export const useDishStore = defineStore('dish', () => {
    const dish = ref<Dish[]>([])
    const currentPage = ref(1)
    const totalItems = ref(0)
    const search = ref('')
    const filter = ref('AllStatus')
    const filterType = ref('AllType')

    const fetchDish = async (page: number) => {
        try {
            // console.log(filter.value, filterType.value, search.value);
            // const params = {
            //     page: page,
            //     search: search.value,
            //     filter: filter.value,
            //     filterType: filterType.value
            // };
            // const url = `/dish?${new URLSearchParams(params).toString()}`;
            // console.log(url);

            // const response = await axiosInstance.get<ApiResponse<Dish[]>>(url);

            const response = await axiosInstance.get<ApiResponse<Dish[]>>("/dish", {
                params: {
                    page: page,
                    search: search.value,
                    filter: filter.value,
                    filterType: filterType.value
                }    
            });
            

            dish.value = response.data.data;
            totalItems.value = response.data.total
            currentPage.value = page
        } catch (error) {
            console.error('Error fetching dish:', error)
        }
    }

    const fetchDishByID = async (id: string) => {
        try{
            const response = await axiosInstance.get<ApiResponse<Dish>>(`/dish/${id}`)
            if(response.status === 200){
                return response.data
            }
        }
        catch(error){
            console.error('Error fetching dish by ID:', error)
        }
    }

    const addDish = async (newDish: Omit<Dish, 'id' | 'createAt' | 'updateAt'>) => {
        try {
            const response = await fetch('http://localhost:3000/api/dish', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newDish),
            })
            console.log(JSON.stringify(newDish))
            if (response.ok) {
                await fetchDish(currentPage.value)
            } else {
                console.error('Failed to add dish')
            }
        } catch (error) {
            console.error('Error adding dish:', error)
        }
    }

    const updateDish = async (updatedDish: Omit<Dish, 'createAt' | 'updateAt' >) => {
        try {
            //Will combacl, not sure if it was able to update if i include the id
            console.log(JSON.stringify(updatedDish));
            const response = await fetch(`http://localhost:3000/api/dish/${updatedDish.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedDish),
            })
            if (response.ok) {
                await fetchDish(currentPage.value)
            } else {
                console.error('Failed to update dish')
            }
        } catch (error) {
            console.error('Error updating dish:', error)
        }
    }

    const deleteDish = async (id: string) => {
        try {
            const response = await fetch(`http://localhost:3000/api/dish/${id}`, {
                method: 'DELETE',
            })
            if (response.ok) {
                await fetchDish(currentPage.value)
            } else {
                console.error('Failed to delete dish')
            }
        } catch (error) {
            console.error('Error deleting dish:', error)
        }
    }

    const setFilter = (filterValue: string) => {
        filter.value = filterValue;
    }
    const setFilterType = (filterTypeValue: string) => {
        filterType.value = filterTypeValue;
    }
    const setSearch = (searchValue: string) => {
        search.value = searchValue;
    }

    return {
        dish,
        currentPage,
        totalItems,
        search,
        filter,
        filterType,
        fetchDish,
        addDish,
        updateDish,
        setFilter,
        setSearch,
        deleteDish,
        setFilterType,
        fetchDishByID,


    }

})
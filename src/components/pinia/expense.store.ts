import {defineStore} from 'pinia'
import {ref, computed} from 'vue'
import axiosInstance, {ApiResponse} from '../services/axiosInstance'

interface Expense {
    id: string,
    expenseName:string,
    expenseDescription:string | undefined,
    expenseMoney: number,
    createAt: Date,
    updateAt: Date
}

type ExpenseWithoutMeta = Omit<Expense, 'createAt' | 'id' | 'updateAt'>;

export const useExpenseStore = defineStore('expense', () => {
    const expenses = ref<Expense[]>([])
    const currentPage = ref(1)
    const totalItems = ref(0)
    const itemsPerPage = 5
    const sortColumn = ref('createAt')
    const sortOrder = ref<'desc' | 'asc'>('desc')
    const search = ref('')
    const totalPages = computed(() => Math.ceil(totalItems.value / itemsPerPage))
    
    const fetchExpenses = async (page: number) => {
        // console.log(sortColumn.value, sortOrder.value);
        try {
            const response = await axiosInstance.get<ApiResponse<Expense[]>>("/expense", {
                params: {
                    page: page,
                    limit: itemsPerPage,
                    sortColumn: sortColumn.value,
                    sortOrder: sortOrder.value,
                    search: search.value,
                },
            });
            
            expenses.value = response.data.data
            totalItems.value = response.data.total
            currentPage.value = page
        } catch (error) {
            console.error('Error fetching expenses:', error)
        }
    }

    //literally unused
    const fetchExpenseAfterID = async (id: string) => {
        try {
            const response = await axiosInstance.get<ApiResponse<Expense[]>>(`/expense/${id}`, {});            
            expenses.value = response.data.data
            totalItems.value = response.data.total
            currentPage.value = 1
        } catch (error) {
            console.error('Error fetching expenses:', error)
        }
    }

    const updateExpense = async (id: string, expense: ExpenseWithoutMeta) => {
        try {
            const response = await axiosInstance.put<ApiResponse<Expense>>(`/expense/${id}`, expense)
            return response.data.data;
        } catch (error) {
            console.error('Error updating expense:', error)
        }
    }

    const createExpense = async (expense: ExpenseWithoutMeta) => {
        try {
            const response = await axiosInstance.post<ApiResponse<Expense>>('/expense', expense)
            return response.data.data;
        } catch (error) {
            console.error('Error creating expense:', error)
        }
    }

    const deleteExpense = async (id: string) => {
        try {
            const response = await axiosInstance.delete<ApiResponse<Expense>>(`/expense/${id}`)
            return response.data.data;
        } catch (error) {
            console.error('Error deleting expense:', error)
        }
    }

    const setSorting = (column: string, order: 'asc' | 'desc') => {
        sortColumn.value = column
        sortOrder.value = order
    }
    const setSearch = (searchValue: string) => {
        search.value = searchValue;
    }

    

    return {
        expenses,
        currentPage,
        totalItems,
        itemsPerPage,
        sortColumn,
        sortOrder,
        search,
        fetchExpenses,
        totalPages,
        fetchExpenseAfterID,
        updateExpense,
        createExpense,
        deleteExpense,
        setSorting,
        setSearch,
    }
})

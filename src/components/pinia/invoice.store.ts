// stores/invoiceStore.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axiosInstance, { ApiResponse } from '../services/axiosInstance'

interface InvoiceDetail {
  id: string;
  dishName: string;
  quantity: number;
  totalCost: number;
  createAt: Date;
  salePerUnit: undefined | number;
  promotionAfterDishID?: string | null;
  originalPrice: number;
  promotionName?: string;
  discount?: number;
}

interface Invoice {
  id: string;
  invoiceDate: Date;
  totalCost: number;
  orderNote?: string | undefined;
  totalPromotion?: number | undefined;
  invoiceStatus: boolean;
  employeeID: string;
  employeeName: string;
  tableID: string;
  tableNumber: number;
  promotionID?: string | undefined;
  promotionName: string;
  invoiceDetails: InvoiceDetail[];
  finalTotalCost: number;
  pointEarned: number;
  pointUsed: number;
  discount: number;
}


// interface InvoiceDetail {
//   id : string
//   dishID: string
//   invoiceID: string
//   quantity: number
//   totalCost: number
//   promotionAfterDish?: string
//   salesPerUnit?: number
//   createAt: string

// }

// interface Invoice {
//   id: string;
//   invoiceDate: Date;
//   totalCost: number;
//   orderNote?: string;
//   employeeID: string;
//   employeeName: string;
//   tableID: number;
//   tableNumber: number;
//   promotionID?: string;
//   promotionName?: string;
//   invoiceDetails: InvoiceDetail[];
// }

// interface InvoiceDetail {
//   id: string;
//   dishName: string;
//   quantity: number;
//   totalCost: number;
//   invoiceID: string;
//   promotionAfterDishID?: string
//   salesPerUnit?: number
//   createAt: string
// }

// interface PoinUsage {
//   id        :string 
//   pointUsed :number
//   invoiceID :string
//   clientID  :string 
// }



export const useInvoiceStore = defineStore('invoice', () => {
  const invoices = ref<Invoice[]>([])
  // const InvoiceDetails = ref<InvoiceDetail[]>([])
  const currentPage = ref(1)
  const totalItems = ref(0)
  const itemsPerPage = 5
  const sortColumn = ref('invoiceDate')
  const sortOrder = ref<'asc' | 'desc'>('asc')
  const search = ref('')
  const filter = ref('')

  const totalPages = computed(() => Math.ceil(totalItems.value / itemsPerPage))

  const fetchInvoices = async (page: number) => {
      try {
        const response = await axiosInstance.get<ApiResponse<Invoice[]>>("/invoice", {
            params: {
            page: page,
            limit: itemsPerPage,
            sortColumn: sortColumn.value,
            sortOrder: sortOrder.value,
            search: search.value,
            filter: filter.value,
            },
        });
        console.log(response.data.data);
        invoices.value = response.data.data
        totalItems.value = response.data.total
        currentPage.value = page
    } catch (error) {
      console.error('Error fetching invoices:', error)
    }
  }

  const fetchInvoiceDetails = async (invoiceId: string): Promise<InvoiceDetail[]> => {
    try {
      const response = await fetch(`http://localhost:3000/api/invoice/${invoiceId}/details`)
      const data = await response.json()
      return data
    } catch (error) {
      console.error('Error fetching invoice details:', error)
      return []
    }
  }

  const createInvoice = async (selectedOrderID: string, selectedClient: string, pointUsed?: number) => {
    try {
      //no worry bout pointused, it have been handled in the backend, if no point used, it will be 0
      const response = await axiosInstance.post('/invoice', {OrderID: selectedOrderID, ClientID: selectedClient, pointUsed: pointUsed}); //wrap data in JSON
      return response.data;
    } catch (error) {
      console.error('Error creating invoice:', error)
    }
  }


  //for dashboard
  interface TotalIncome {
    today: number,
    week: number,
    month: number,
    
  }
  
  const getTotalIncome = async (): Promise<TotalIncome> => {
    try {
      const response = await axiosInstance.get<TotalIncome>("/invoice/getTotalIncome");
      return response.data; // Directly return the TotalIncome object
    } catch (error) {
      console.error('Error fetching total income:', error);
      // Return a TotalIncome object with default values in case of an error
      return {
        today: 0,
        week: 0,
        month: 0
      };
    }
  };

  //I CAN  modify the fetch invocie to fetch the recent invoice, but it will break all the file that use this function
  //so I will create a new function to fetch the recent invoice
  interface RecentInvoice {
    id: string;
    finalTotalMoney: number;
    invoiceDate: Date;
  }
  const fetchRecentInvoice = async () => {
    try{
      const response = await axiosInstance.get<ApiResponse<RecentInvoice[]>>("/invoice/recentInvoice")
      return response.data
    }catch (error) {
      console.error('Error fetching recent invoices:', error)
    }
  }

  const getTopDishes = async () => { 
    try {
      const response = await axiosInstance.get<ApiResponse<InvoiceDetail[]>>("/invoice/topDish")
      return response.data
    } catch (error) {
      console.error('Error fetching top dish:', error)
    }
  }

  interface IncomeDataPoint {
  timeUnit: string;
  income: number;
}

type incomePeriod = 'day' | 'week' | 'month' | 'year';

interface IncomeData extends Record<incomePeriod, IncomeDataPoint[]> {}

const fetchIncomeData = async () => {
  try {
    const response = await axiosInstance.get<ApiResponse<IncomeData>>(`/invoice/incomeData/`);
    return response;
  } catch (error) {
    console.error('Error fetching income data:', error);
  }
};

//This function is unused, purpose: fetch income data for EACH period, not ALL period like the function above, there is also
// no backend for this function. This is a "just in case" function
// const fetchIncomeData = async (period: incomePeriod) => {
//   try {
//     const response = await axiosInstance.get<ApiResponse<IncomeData>>(`/invoice/incomeData/${period}`);
//     return response;
//   } catch (error) {
//     console.error('Error fetching income data:', error);
//   }
// };

  interface CustomIncomeData {
    custom: [
        {
          timeUnit: '',
          income: 0,
          expense: 0,
          ingredientCost: 0,
        },
      ]
  }

  const fetchCustomIncomeData = async (startDate: Date, endDate: Date, step: number) => {
    try{
      const response = await axiosInstance.get<ApiResponse<CustomIncomeData>>(`/invoice/getCustomIncome`, {
        params: {
          startDate: startDate,
          endDate: endDate,
          step: step
        }
      })
      return response
    }catch (error) {
      console.error('Error fetching custom income data:', error)
    }
  }


  
  const setSorting = (column: string, order: 'asc' | 'desc') => {
    sortColumn.value = column
    sortOrder.value = order
  }

  const setSearch = (searchValue: string) => {
    search.value = searchValue;
  }

  const setFilter = (filterValue: string) => {
    filter.value = filterValue
  }

  return {
    invoices,
    currentPage,
    totalItems,
    totalPages,
    fetchInvoices,
    fetchInvoiceDetails,
    setSorting,
    setSearch,
    setFilter,
    createInvoice,
    getTotalIncome,
    fetchRecentInvoice,
    getTopDishes,
    fetchIncomeData,
    fetchCustomIncomeData,
  }
})
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
  promotionName: string; //this have a default value "No promotion"
  invoiceDetails: InvoiceDetail[];
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

  const createInvoice = async (data: any) => {
    try {
      // console.log("Im here" + data);
      const response = await axiosInstance.post('/invoice', {OrderID: data}); //wrap data in JSON
      return response.data;
    } catch (error) {
      console.error('Error creating invoice:', error)
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
  }
})
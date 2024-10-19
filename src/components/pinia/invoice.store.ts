// stores/invoiceStore.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

interface Invoice {
  id: string
  invoiceDate: Date
  totalCost: number
  orderNote?: string
  totalPromotion?: number
  invoiceStatus: boolean
  employeeID: string
  tableID: number
  promotionAfterInvoice?: string
}

interface InvoiceDetail {
  id : string
  dishID: string
  invoiceID: string
  quantity: number
  totalCost: number
  promotionAfterDish?: string
  salesPerUnit?: number
  createAt: string

}
interface PoinUsage {
  id        :string 
  pointUsed :number
  invoiceID :string
  clientID  :string 
}



export const useInvoiceStore = defineStore('invoice', () => {
  const invoices = ref<Invoice[]>([])
  const currentPage = ref(1)
  const totalItems = ref(0)
  const itemsPerPage = 5

  const totalPages = computed(() => Math.ceil(totalItems.value / itemsPerPage))

  const fetchInvoices = async (page: number) => {
    try {
      const response = await fetch(`http://localhost:3000/api/invoice?page=${page}&limit=${itemsPerPage}`)
      const data = await response.json()
      invoices.value = data.invoices
      totalItems.value = data.total
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

  return {
    invoices,
    currentPage,
    totalItems,
    totalPages,
    fetchInvoices,
    fetchInvoiceDetails,
  }
})
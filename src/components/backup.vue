<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { ChevronLeftIcon, ChevronRightIcon, InfoIcon, ChevronUpIcon, ChevronDownIcon, SearchIcon } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useInvoiceStore } from './pinia/invoice.store'
import { format } from 'date-fns'

const invoiceStore = useInvoiceStore()

const isDetailModalOpen = ref(false)
const currentInvoice = ref(null)
const currentInvoiceDetails = ref([])

const sortColumn = ref('invoiceDate')
const sortOrder = ref<'asc' | 'desc'>('desc')
const searchQuery = ref('')
const filterStatus = ref('All')

onMounted(() => {
  invoiceStore.fetchInvoices(1)
})

const openInvoiceDetail = async (invoice) => {
  currentInvoice.value = invoice
  currentInvoiceDetails.value = await invoiceStore.fetchInvoiceDetails(invoice.id)
  isDetailModalOpen.value = true
}

const pageNumbers = computed(() => {
  const totalPages = invoiceStore.totalPages
  const currentPage = invoiceStore.currentPage
  const pages = []

  if (totalPages <= 4) {
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i)
    }
  } else {
    if (currentPage <= 3) {
      pages.push(1, 2, 3, 4, '...', totalPages)
    } else if (currentPage >= totalPages - 2) {
      pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages)
    } else {
      pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages)
    }
  }

  return pages
})

const goToPage = (page: number) => {
  invoiceStore.fetchInvoices(page)
}

const sortTable = (column: string) => {
  if (sortColumn.value === column) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortColumn.value = column
    sortOrder.value = 'asc'
  }
  invoiceStore.setSorting(sortColumn.value, sortOrder.value)
  invoiceStore.fetchInvoices(1)
}

const getSortIcon = (column: string) => {
  if (sortColumn.value !== column) return null
  return sortOrder.value === 'asc' ? ChevronUpIcon : ChevronDownIcon
}

const resetFilters = () => {
  searchQuery.value = ''
  filterStatus.value = 'All'
}

watch([filterStatus], () => {
  invoiceStore.setFilter(filterStatus.value)
  invoiceStore.fetchInvoices(1)
})

watch([searchQuery], () => {
  invoiceStore.setSearch(searchQuery.value)
  invoiceStore.fetchInvoices(1)
})

const formatDate = (dateString: string) => {
  return format(new Date(dateString), 'yyyy-MM-dd HH:mm:ss')
}

const getStatusColor = (status: boolean) => {
  return status ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
}
</script>

<template>
  <div class="h-full w-full bg-gray-50 overflow-auto p-6">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold">Invoices</h1>
    </div>
    <div class="mb-4 flex space-x-4">
      <div class="relative flex-grow">
        <Input
          v-model="searchQuery"
          placeholder="Search by employee name or table number"
          class="pl-10"
        />
        <SearchIcon class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
      </div>
      <Select v-model="filterStatus">
        <SelectTrigger class="w-[200px]">
          <SelectValue placeholder="Filter by status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="All">All Statuses</SelectItem>
          <SelectItem value="true">Paid</SelectItem>
          <SelectItem value="false">Unpaid</SelectItem>
        </SelectContent>
      </Select>
      <Button @click="resetFilters" variant="outline">Reset Filters</Button>
    </div>

    <div class="bg-white shadow-md rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead @click="sortTable('invoiceDate')" class="cursor-pointer">
              <div class="flex items-center justify-between">
                <span>Date</span>
                <component 
                  :is="getSortIcon('invoiceDate') || 'div'" 
                  class="w-4 h-4 ml-2"
                  :class="{'text-transparent': !getSortIcon('invoiceDate')}"
                />
              </div>
            </TableHead>
            <TableHead @click="sortTable('totalCost')" class="cursor-pointer">
              <div class="flex items-center justify-between">
                <span>Total Cost</span>
                <component 
                  :is="getSortIcon('totalCost') || 'div'" 
                  class="w-4 h-4 ml-2"
                  :class="{'text-transparent': !getSortIcon('totalCost')}"
                />
              </div>
            </TableHead>
            <TableHead>Order Note</TableHead>
            <TableHead @click="sortTable('employeeName')" class="cursor-pointer">
              <div class="flex items-center justify-between">
                <span>Employee</span>
                <component 
                  :is="getSortIcon('employeeName') || 'div'" 
                  class="w-4 h-4 ml-2"
                  :class="{'text-transparent': !getSortIcon('employeeName')}"
                />
              </div>
            </TableHead>
            <TableHead @click="sortTable('tableNumber')" class="cursor-pointer">
              <div class="flex items-center justify-between">
                <span>Table</span>
                <component 
                  :is="getSortIcon('tableNumber') || 'div'" 
                  class="w-4 h-4 ml-2"
                  :class="{'text-transparent': !getSortIcon('tableNumber')}"
                />
              </div>
            </TableHead>
            <TableHead>Promotion</TableHead>
            <TableHead @click="sortTable('invoiceStatus')" class="cursor-pointer">
              <div class="flex items-center justify-between">
                <span>Status</span>
                <component 
                  :is="getSortIcon('invoiceStatus') || 'div'" 
                  class="w-4 h-4 ml-2"
                  :class="{'text-transparent': !getSortIcon('invoiceStatus')}"
                />
              </div>
            </TableHead>
            <TableHead class="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-for="invoice in invoiceStore.invoices" :key="invoice.id">
            <TableCell>{{ formatDate(invoice.invoiceDate) }}</TableCell>
            <TableCell>${{ invoice.totalCost.toFixed(2) }}</TableCell>
            <TableCell>{{ invoice.orderNote || 'N/A' }}</TableCell>
            <TableCell>{{ invoice.employeeName }}</TableCell>
            <TableCell>{{ invoice.tableNumber }}</TableCell>
            <TableCell>{{ invoice.promotionName || 'None' }}</TableCell>
            <TableCell>
              <span :class="`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(invoice.invoiceStatus)}`">
                {{ invoice.invoiceStatus ? 'Paid' : 'Unpaid' }}
              </span>
            </TableCell>
            <TableCell class="text-right">
              <Button
                variant="ghost"
                size="icon"
                @click="openInvoiceDetail(invoice)"
                class="text-blue-600 hover:text-blue-600 hover:bg-blue-100"
              >
                <InfoIcon class="h-4 w-4" />
              </Button>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>

    <!-- Pagination -->
    <div class="mt-4 flex items-center justify-between">
      <div class="text-sm text-gray-700">
        Showing {{ (invoiceStore.currentPage - 1) * 5 + 1 }} to {{ Math.min(invoiceStore.currentPage * 5, invoiceStore.totalItems) }} of {{ invoiceStore.totalItems }} entries
      </div>
      <div class="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          @click="goToPage(invoiceStore.currentPage - 1)"
          :disabled="invoiceStore.currentPage === 1"
          class="text-gray-700 hover:bg-gray-100 disabled:opacity-50"
        >
          <ChevronLeftIcon class="h-4 w-4" />
        </Button>
        <Button
          v-for="page in pageNumbers"
          :key="page"
          variant="outline"
          size="sm"
          :class="{ 'bg-blue-500 text-white': page === invoiceStore.currentPage, 'text-gray-700 hover:bg-gray-100': page !== invoiceStore.currentPage }"
          @click="typeof page === 'number' ? goToPage(page) : null"
          :disabled="typeof page !== 'number'"
        >
          {{ page }}
        </Button>
        <Button
          variant="outline"
          size="sm"
          @click="goToPage(invoiceStore.currentPage + 1)"
          :disabled="invoiceStore.currentPage === invoiceStore.totalPages"
          class="text-gray-700 hover:bg-gray-100 disabled:opacity-50"
        >
          <ChevronRightIcon class="h-4 w-4" />
        </Button>
      </div>
    </div>

    <!-- Invoice Detail Modal -->
    <Dialog v-model:open="isDetailModalOpen">
      <DialogContent class="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>Invoice Details</DialogTitle>
          <DialogDescription>
            Full information for the selected invoice.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea v-if="currentInvoice" class="mt-4 max-h-[80vh]">
          <div class="space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <Label class="font-semibold">Date:</Label>
                <p>{{ formatDate(currentInvoice.invoiceDate) }}</p>
              </div>
              <div>
                <Label class="font-semibold">Total Cost:</Label>
                <p>${{ currentInvoice.totalCost.toFixed(2) }}</p>
              </div>
              <div>
                <Label class="font-semibold">Order Note:</Label>
                <p>{{ currentInvoice.orderNote || 'N/A' }}</p>
              </div>
              <div>
                <Label class="font-semibold">Employee:</Label>
                <p>{{ currentInvoice.employeeName }}</p>
              </div>
              <div>
                <Label class="font-semibold">Table:</Label>
                <p>{{ currentInvoice.tableNumber }}</p>
              </div>
              <div>
                <Label class="font-semibold">Promotion:</Label>
                <p>{{ currentInvoice.promotionName || 'None' }}</p>
              </div>
              <div>
                <Label class="font-semibold">Status:</Label>
                <p>{{ currentInvoice.invoiceStatus ? 'Paid' : 'Unpaid' }}</p>
              </div>
            </div>
            <div>
              <h3 class="text-lg font-semibold mb-2">Invoice Details</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Dish Name</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Total Cost</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow v-for="detail in currentInvoiceDetails" :key="detail.dishName">
                    <TableCell>{{ detail.dishName }}</TableCell>
                    <TableCell>{{ detail.quantity }}</TableCell>
                    <TableCell>${{ detail.totalCost.toFixed(2) }}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </div>
        </ScrollArea>
        <DialogFooter>
          <Button @click="isDetailModalOpen = false">Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>
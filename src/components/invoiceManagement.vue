<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { ChevronLeftIcon, ChevronRightIcon, InfoIcon } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { format } from 'date-fns'
import { useInvoiceStore } from './pinia/invoice.store'

const invoiceStore = useInvoiceStore()

interface InvoiceDetail {
  dishName: string
  quantity: number
  totalCost: number
}

const isDetailModalOpen = ref(false)
const currentInvoice = ref<Invoice | null>(null)
const currentInvoiceDetails = ref<InvoiceDetail[]>([])

onMounted(async () => {
  await invoiceStore.fetchInvoices(1)
})

const goToPage = async (page: number) => {
  await invoiceStore.fetchInvoices(page)
}

const openInvoiceDetail = async (invoice: Invoice) => {
  currentInvoice.value = invoice
  currentInvoiceDetails.value = await invoiceStore.fetchInvoiceDetails(invoice.id)
  isDetailModalOpen.value = true
}

const pageNumbers = computed(() => {
  const pages = []
  for (let i = 1; i <= invoiceStore.totalPages; i++) {
    pages.push(i)
  }
  return pages
})

const formatDate = (dateString: string) => {
  return format(new Date(dateString), 'yyyy-MM-dd HH:mm:ss')
}
</script>

<template>
  <div class="h-full w-full bg-gray-50 overflow-auto p-6">
    <h1 class="text-3xl font-bold mb-6">Invoice Management</h1>

    <div class="bg-white shadow-md rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Total Cost</TableHead>
            <TableHead>Order Note</TableHead>
            <TableHead>Employee</TableHead>
            <TableHead>Table</TableHead>
            <TableHead>Promotion</TableHead>
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
            <TableCell class="text-right">
              <Button variant="ghost" size="icon" @click="openInvoiceDetail(invoice)">
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
        >
          <ChevronLeftIcon class="h-4 w-4" />
        </Button>
        <Button
          v-for="page in pageNumbers"
          :key="page"
          variant="outline"
          size="sm"
          :class="{ 'bg-primary text-primary-foreground': page === invoiceStore.currentPage }"
          @click="goToPage(page)"
        >
          {{ page }}
        </Button>
        <Button
          variant="outline"
          size="sm"
          @click="goToPage(invoiceStore.currentPage + 1)"
          :disabled="invoiceStore.currentPage === invoiceStore.totalPages"
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
        <div v-if="currentInvoice" class="mt-4 space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <p class="font-semibold">Date:</p>
              <p>{{ formatDate(currentInvoice.invoiceDate) }}</p>
            </div>
            <div>
              <p class="font-semibold">Total Cost:</p>
              <p>${{ currentInvoice.totalCost.toFixed(2) }}</p>
            </div>
            <div>
              <p class="font-semibold">Order Note:</p>
              <p>{{ currentInvoice.orderNote || 'N/A' }}</p>
            </div>
            <div>
              <p class="font-semibold">Employee:</p>
              <p>{{ currentInvoice.employeeName }}</p>
            </div>
            <div>
              <p class="font-semibold">Table:</p>
              <p>{{ currentInvoice.tableNumber }}</p>
            </div>
            <div>
              <p class="font-semibold">Promotion:</p>
              <p>{{ currentInvoice.promotionName || 'None' }}</p>
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
      </DialogContent>
    </Dialog>
  </div>
</template>
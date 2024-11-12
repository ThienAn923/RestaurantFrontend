<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { ChevronLeftIcon, ChevronRightIcon, InfoIcon, ChevronUpIcon, ChevronDownIcon, SearchIcon } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { format } from 'date-fns';
import { useInvoiceStore } from './pinia/invoice.store'
import { formatCurrency } from '../lib/formatMoney'

const invoiceStore = useInvoiceStore()

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
}

const isDetailModalOpen = ref(false)
const currentInvoice = ref<Invoice | null>(null)

const statusOptions = [
  { value: 'true', label: 'Đã trả tiền' },
  { value: 'false', label: 'Chưa trả tiền' },
]

const searchQuery = ref('')
const filterStatus = ref('')
const sortColumn = ref('invoiceDate')
const sortOrder = ref<'asc' | 'desc'>('asc')

onMounted(async () => {
  await invoiceStore.fetchInvoices(1);
})

const openInvoiceDetail = (invoice: Invoice) => {
  currentInvoice.value = { ...invoice }
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

const goToPage = (page: number) => {
  invoiceStore.fetchInvoices(page)
}

const resetFilters = () => {
  searchQuery.value = ''
  filterStatus.value = 'AllTypes'
}

watch([filterStatus], () => {
  invoiceStore.setFilter(filterStatus.value);
  invoiceStore.fetchInvoices(1)
})

watch([searchQuery], () => {
  invoiceStore.setSearch(searchQuery.value);
  invoiceStore.fetchInvoices(1)
})

const formatDate = (dateString: string | Date): string => {
  return format(new Date(dateString), 'yyyy-MM-dd HH:mm:ss');
};
</script>

<template>
  <div class="h-full w-full bg-gray-50 overflow-auto p-6">
    <h1 class="text-3xl font-bold mb-6">Quản lý hóa đơn</h1>

    <div class="mb-4 flex space-x-4">
      <div class="relative flex-grow">
        <Input v-model="searchQuery" placeholder="Tìm kiếm theo tên" class="pl-10" />
        <SearchIcon class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
      </div>
      <Select v-model="filterStatus">
        <SelectTrigger class="w-[200px]">
          <SelectValue placeholder="Tất cả trạng thái" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="AllTypes">Tất cả trạng thái</SelectItem>
          <SelectItem v-for="status in statusOptions" :key="status.value" :value="status.value">
            {{ status.label }}
          </SelectItem>
        </SelectContent>
      </Select>
      <Button @click="resetFilters" variant="outline">Reset bộ lọc</Button>
    </div>

    <div class="bg-white shadow-md rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead class="cursor-pointer" @click="sortTable('invoiceDate')">
              <div class="flex items-center justify-between">
                <span>Ngày tạo</span>
                <component :is="getSortIcon('invoiceDate') || 'div'" class="w-4 h-4 ml-2"
                  :class="{ 'text-transparent': !getSortIcon('invoiceDate') }" />
              </div>
            </TableHead>
            <TableHead class="cursor-pointer w-1/11" @click="sortTable('totalCost')">
              <div class="flex items-center justify-end">
                <span class="cursor-pointer w-1/11 flex items-center justify-end">Tổng</span>
                <component :is="getSortIcon('totalCost') || 'div'" class=" w-4 h-4 ml-2"
                  :class="{ 'text-transparent': !getSortIcon('totalCost') }" />
              </div>
            </TableHead>
            <TableHead>Ghi chú</TableHead>
            <TableHead>Bàn</TableHead>
            <TableHead>Khuyến mãi</TableHead>
            <TableHead>Tỷ lệ</TableHead>
            <TableHead class="cursor-pointer w-1/11 flex items-center justify-end">Tổng Tiền Sau Cùng</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-for="invoice in invoiceStore.invoices" :key="invoice.id">
            <TableCell>{{ formatDate(invoice.invoiceDate) }}</TableCell>
            <TableCell class="text-right">{{ formatCurrency(invoice.totalCost) }}</TableCell>
            <TableCell>{{ invoice.orderNote || 'N/A' }}</TableCell>
            <TableCell>{{ invoice.tableNumber }}</TableCell>
            <TableCell>{{ invoice.promotionName || 'None' }}</TableCell>
            <TableCell>{{ invoice.discount + "%" || 'None' }}</TableCell>
            <TableCell class="text-right">{{ formatCurrency((invoice.finalTotalCost)) || 'None' }}</TableCell>
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
        Đang xem từ {{ (invoiceStore.currentPage - 1) * 5 + 1 }} đến {{ Math.min(invoiceStore.currentPage * 5,
          invoiceStore.totalItems) }} of {{ invoiceStore.totalItems }} thực thể
      </div>
      <div class="flex items-center space-x-2">
        <Button variant="outline" size="sm" @click="goToPage(invoiceStore.currentPage - 1)"
          :disabled="invoiceStore.currentPage === 1" class="text-gray-700 hover:bg-gray-100 disabled:opacity-50">
          <ChevronLeftIcon class="h-4 w-4" />
        </Button>
        <Button v-for="page in pageNumbers" :key="page" variant="outline" size="sm"
          :class="{ 'bg-blue-500 text-white': page === invoiceStore.currentPage, 'text-gray-700 hover:bg-gray-100': page !== invoiceStore.currentPage }"
          @click="goToPage(page)">
          {{ page }}
        </Button>
        <Button variant="outline" size="sm" @click="goToPage(invoiceStore.currentPage + 1)"
          :disabled="invoiceStore.currentPage === invoiceStore.totalPages"
          class="text-gray-700 hover:bg-gray-100 disabled:opacity-50">
          <ChevronRightIcon class="h-4 w-4" />
        </Button>
      </div>
    </div>

    <!-- Invoice Detail Modal -->
    <Dialog v-model:open="isDetailModalOpen">
      <DialogContent class="sm:max-w-[1000px]"> <!-- Increased max-width here -->
        <DialogHeader>
          <DialogTitle>Invoice Details</DialogTitle>
          <DialogDescription>
            Full information for the selected invoice.
          </DialogDescription>
        </DialogHeader>
        <div v-if="currentInvoice" class="mt-6 space-y-6">
          <div class="relative bg-white shadow-lg sm:rounded-3xl sm:p-10">
            <div class="max-w-3xl mx-auto">
              <div class="flex items-center justify-between mb-8">
                <div class="flex items-center">
                  <img
                    src="https://logowik.com/content/uploads/images/restaurant9491.logowik.com.webp?height=80&width=80?height=80&width=80"
                    alt="N&A Restaurant Logo" class="h-20 w-20 mr-4" />
                  <div>
                    <h1 class="text-3xl font-extrabold text-gray-900">N&A Restaurant</h1>
                    <p class="text-sm text-gray-600">Số 405 đường Lý Tự Trọng P.An Khánh Q.Ninh kiều tp.Cần Thơ</p>
                    <p class="text-sm text-gray-600">Phone: (+84) 7575-9999</p>
                  </div>
                </div>
                <div class="text-right">
                  <h2 class="text-2xl font-bold text-gray-900">Hóa Đơn</h2>
                  <p class="text-sm text-gray-600">#{{ currentInvoice.id }}</p>
                </div>
              </div>

              <div class="border-t border-b border-gray-200 py-4 mb-6">
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <p class="text-sm font-medium text-gray-600">Ngày lập:</p>
                    <p class="text-sm text-gray-900">{{ formatDate(currentInvoice.invoiceDate) }}</p>
                  </div>
                  <div>
                    <p class="text-sm font-medium text-gray-600">Bàn:</p>
                    <p class="text-sm text-gray-900">{{ currentInvoice.tableNumber }}</p>
                  </div>
                  <div>
                    <p class="text-sm font-medium text-gray-600">Nhân viên lập:</p>
                    <p class="text-sm text-gray-900">{{ currentInvoice.employeeName }}</p>
                  </div>
                  <div>
                    <p class="text-sm font-medium text-gray-600">Khuyến mãi:</p>
                    <p class="text-sm text-gray-900">{{ currentInvoice.promotionName }}</p>
                  </div>
                  <div>
                    <p class="text-sm font-medium text-gray-600">Tỷ Lệ Khuyến mãi:</p>
                    <p class="text-sm text-gray-900">{{ currentInvoice.discount }}%</p>
                  </div>
                  <div>
                    <p class="text-sm font-medium text-gray-600">Ghi Chú:</p>
                    <p class="text-sm text-gray-900">{{ currentInvoice.orderNote || "Không có ghi chú" }}</p>
                  </div>
                </div>
              </div>

              <div class="mb-8">
                <h3 class="text-lg font-semibold mb-3">Chi tiết hóa đơn</h3>
                <Table v-if="currentInvoice.invoiceDetails.length > 0">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tên món</TableHead>
                      <TableHead>Số lượng</TableHead>
                      <TableHead>Tên khuyến mãi</TableHead>
                      <TableHead>Tỷ lệ khuyến mãi</TableHead>
                      <TableHead>Giá Gốc/Đơn Vị</TableHead>
                      <TableHead>Giá sau cùng</TableHead>
                      <TableHead>Tổng Cộng</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow v-for="detail in currentInvoice.invoiceDetails" :key="detail.id">
                      <TableCell>{{ detail.dishName }}</TableCell>
                      <TableCell>{{ detail.quantity }}</TableCell>
                      <TableCell>{{ detail.promotionName || 'Không' }}</TableCell>
                      <TableCell>{{ detail.discount }}%</TableCell>
                      <TableCell>{{ formatCurrency(detail.originalPrice) }}</TableCell>
                      <TableCell>{{ formatCurrency(detail.totalCost / detail.quantity) }}</TableCell>
                      <TableCell>{{ formatCurrency(detail.totalCost) }}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
                <p v-else class="text-gray-500">No details available for this invoice.</p>
              </div>

              <div class="flex justify-between items-center mb-8">
                <div class="text-sm">
                  <p class="font-medium text-gray-600">Tổng cộng:</p>
                  <p class="font-medium text-gray-600">Giảm giá:</p>
                  <p class="font-bold text-gray-900">Tổng sau cùng:</p>
                </div>
                <div class="text-sm text-right">
                  <p>{{ formatCurrency(currentInvoice.totalCost) }}</p>
                  <p>{{ formatCurrency((currentInvoice.discount / 100 *
                    currentInvoice.totalCost) || 0) }}</p>
                  <p class="font-bold">{{ formatCurrency(currentInvoice.finalTotalCost) }}</p>
                </div>
              </div>

              <div class="flex justify-between items-center">
                <div>
                  <p class="text-xs text-gray-600 mb-1">Quét để nhận điểm thưởng:</p>
                  <img
                    src="https://logowik.com/content/uploads/images/restaurant9491.logowik.com.webp?height=80&width=80.svg?height=80&width=80"
                    alt="QR Code" class="h-20 w-20" />
                </div>
                <div class="text-right">
                  <p class="text-xs text-gray-600 mb-1">Đã bao gồm thuế VAT </p>
                  <!-- <p class="text-sm text-gray-900">{{ currentInvoice.orderNote || 'N/A' }}</p> -->
                </div>
              </div>

              <div class="mt-8 text-center">
                <p class="text-xs text-gray-600">Cảm ơn quý khách đã dùng bữa tại nhà hàng chúng tôi!</p>
                <p class="text-xs text-gray-600">Hẹn gặp lại quý khách trong thời gian sớm nhất.</p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  </div>
</template>
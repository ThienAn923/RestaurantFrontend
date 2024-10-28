<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { ChevronLeftIcon, ChevronRightIcon, InfoIcon, ChevronUpIcon, ChevronDownIcon, SearchIcon } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { format } from 'date-fns';
import { useInvoiceStore } from './pinia/invoice.store'

const invoiceStore = useInvoiceStore()

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

const isDetailModalOpen = ref(false)
// const currentInvoice = ref<any>(null)
// const currentInvoiceDetails = ref<any[]>([])
// const currentInvoice = ref({
//   id: '',
//   invoiceDate: new Date(),
//   totalCost: 0,
//   orderNote: undefined,
//   totalPromotion: undefined,
//   invoiceStatus: false,
//   employeeID: '',
//   employeeName: '',
//   tableID: '',
//   tableNumber: 0,
//   promotionID: undefined,
//   promotionName:'',
//   invoiceDetails: InvoiceDetail[];
// })

const currentInvoice = ref<Invoice | null>(null)



// const currentInvoiceDetails = ref<InvoiceDetail[]>([
//   {
//     id: '',
//     dishName: '',
//     quantity: 0,
//     totalCost: 0,
//     createAt: new Date(),
//     salePerUnit: undefined,
//     promotionAfterDishID: undefined
//   }
// ]);

const statusOptions = [
  { value: 'true', label: 'Đã trả tiền' },
  { value: 'false', label: 'Chưa trả tiền' },
]


const searchQuery = ref('')
const filterStatus = ref('')
const sortColumn = ref('ingredientName')
const sortOrder = ref<'asc' | 'desc'>('asc')

onMounted(async () => {
  await invoiceStore.fetchInvoices(1);
  console.log(invoiceStore.invoices);
})

const openInvoiceDetail = (invoice: Invoice) => {
  currentInvoice.value = { ...invoice }
  isDetailModalOpen.value = true
}
// const pageNumbers = computed(() => {
//   const pages = []
//   for (let i = 1; i <= invoiceStore.totalPages; i++) {
//     pages.push(i)
//   }
//   return pages
// })

// const formatDate = (dateString: string) => {
//   return format(new Date(dateString), 'yyyy-MM-dd HH:mm:ss')
// }

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
  // alert(filterStatus.value)
  invoiceStore.setFilter(filterStatus.value);
  invoiceStore.fetchInvoices(1)
})
watch([searchQuery], () => {
  // alert(searchQuery.value)
  invoiceStore.setSearch(searchQuery.value);
  invoiceStore.fetchInvoices(1)
})



const formatDate = (dateString: string): string => {
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
            <TableHead class="cursor-pointer" @click="sortTable('totalCost')">
              <div class="flex items-center justify-between">
                <span>Total Cost</span>
                <component :is="getSortIcon('totalCost') || 'div'" class="w-4 h-4 ml-2"
                  :class="{ 'text-transparent': !getSortIcon('totalCost') }" />
              </div>
            </TableHead>
            <TableHead>Ghi chú</TableHead>
            <TableHead>Nhân viên lập đơn</TableHead>
            <TableHead>Bàn</TableHead>
            <TableHead>Khuyến mãi</TableHead>
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
      <DialogContent class="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>Invoice Details</DialogTitle>
          <DialogDescription>
            Full information for the selected invoice.
          </DialogDescription>
        </DialogHeader>
        <div v-if="currentInvoice" class="mt-6 space-y-6">
          <div class="grid grid-cols-2 gap-x-12 gap-y-4">
            <div>
              <p class="font-semibold">Ngày lập:</p>
              <p>{{ formatDate(currentInvoice.invoiceDate) }}</p>
            </div>
            <div>
              <p class="font-semibold">Tổng cộng:</p>
              <p>{{ currentInvoice.totalCost }}</p>
            </div>
            <div>
              <p class="font-semibold">Ghi chú:</p>
              <p>{{ currentInvoice.orderNote || 'N/A' }}</p>
            </div>
            <div>
              <p class="font-semibold">Nhân viên lập:</p>
              <p>{{ currentInvoice.employeeName }}</p>
            </div>
            <div>
              <p class="font-semibold">Bàn:</p>
              <p>{{ currentInvoice.tableNumber }}</p>
            </div>
            <div>
              <p class="font-semibold">Khuyến mãi:</p>
              <p>{{ currentInvoice.promotionName }}</p>
            </div>
          </div>
          <div>
            <h3 class="text-lg font-semibold mb-3">Invoice Details</h3>
            <Table v-if="currentInvoice.invoiceDetails.length > 0">
              <TableHeader>
                <TableRow>
                  <TableHead>Tên món</TableHead>
                  <TableHead>Số lượng</TableHead>
                  <TableHead>Tổng cộng</TableHead>
                  <TableHead>Giá một đơn vị</TableHead>
                  <TableHead>ID khuyến mãi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow v-for="detail in currentInvoice.invoiceDetails" :key="detail.id">
                  <TableCell>{{ detail.dishName }}</TableCell>
                  <TableCell>{{ detail.quantity }}</TableCell>
                  <TableCell>{{ detail.totalCost }}</TableCell>
                  <TableCell>{{ detail.salePerUnit }}</TableCell>
                  <TableCell>{{ detail.promotionAfterDishID || 'Không' }}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
            <p v-else class="text-gray-500">No details available for this invoice.</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  </div>
</template>
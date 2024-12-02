<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { PlusIcon, PencilIcon, Trash2Icon, ChevronLeftIcon, ChevronRightIcon, InfoIcon, ChevronUpIcon, ChevronDownIcon, SearchIcon } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useProviderStore } from './pinia/provider.store'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useToast } from "./ui/toast"
const { toast } = useToast();

const providerStore = useProviderStore()

const isAddModalOpen = ref(false)
const isEditModalOpen = ref(false)
const isInfoModalOpen = ref(false)
const currentProvider = ref({
  id: '',
  providerName: '',
  providerDescription: '',
  providerPhoneNumber: '',
  providerEmail: '',
  providerAddress: '',
  providerStatus: '',
  createAt: '',
  updateAt: '',
})
const newProvider = ref({
  providerName: '',
  providerDescription: '',
  providerPhoneNumber: '',
  providerEmail: '',
  providerAddress: '',
  providerStatus: '',
  // customStatus: '',
})

const sortColumn = ref('providerName')
const sortOrder = ref<'asc' | 'desc'>('asc')


//Color for each status option
const statusOptions = [
  { value: 'Potential', label: 'Tiềm Năng', color: 'bg-blue-100 text-blue-800' },
  { value: 'Normal', label: 'Bình thường', color: 'bg-gray-100 text-gray-800' },
  { value: 'Important', label: 'Quan Trọng', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'Very Important', label: 'Rất Quan Trọng', color: 'bg-red-100 text-red-800' },
  { value: 'Custom', label: 'Tùy Chỉnh', color: 'bg-purple-100 text-purple-800' },
]

onMounted(() => {
  providerStore.fetchProviders(1)
})

const customStatus = ref('')
const addProvider = async () => {
  if (!isValidNewProvider()) return;
  const providerData = { ...newProvider.value }
  if (providerData.providerStatus === 'Custom') {
    providerData.providerStatus = customStatus.value
  }
  await providerStore.addProvider(providerData)
  isAddModalOpen.value = false
  newProvider.value = {
    providerName: '',
    providerDescription: '',
    providerPhoneNumber: '',
    providerEmail: '',
    providerAddress: '',
    providerStatus: '',
  }
  customStatus.value = ''
}

const openEditModal = (provider: typeof currentProvider.value) => {
  currentProvider.value = { ...provider }
  isEditModalOpen.value = true
}

const openInfoModal = (provider: typeof currentProvider.value) => {
  currentProvider.value = { ...provider }
  isInfoModalOpen.value = true
}

const editProvider = async () => {
  if (!isValidEditProvider()) return;
  const providerData = { ...currentProvider.value }
  if (providerData.providerStatus === 'Custom') {
    providerData.providerStatus = providerData.customStatus
  }
  await providerStore.updateProvider(providerData)
  isEditModalOpen.value = false
}



//This function is used to display the page numbers in the pagination section
const pageNumbers = computed(() => {
  const totalPages = providerStore.totalPages
  const currentPage = providerStore.currentPage
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
  providerStore.fetchProviders(page)
}

const sortTable = (column: string) => {
  if (sortColumn.value === column) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortColumn.value = column
    sortOrder.value = 'asc'
  }
  providerStore.setSorting(sortColumn.value, sortOrder.value)
  providerStore.fetchProviders(1)
}

const getSortIcon = (column: string) => {
  if (sortColumn.value !== column) return null
  return sortOrder.value === 'asc' ? ChevronUpIcon : ChevronDownIcon
}

const getStatusColor = (status: string) => {
  const statusOption = statusOptions.find(option => option.value === status)
  return statusOption ? statusOption.color : 'bg-gray-100 text-gray-800'
}

const searchQuery = ref('')
const filterStatus = ref('')


const resetFilters = () => {
  searchQuery.value = ''
  filterStatus.value = 'AllStatus'
}

watch([filterStatus], () => {
  // alert(filterStatus.value)
  providerStore.setFilter(filterStatus.value);
  providerStore.fetchProviders(1)
})
watch([searchQuery], () => {
  // alert(searchQuery.value)
  providerStore.setSearch(searchQuery.value);
  providerStore.fetchProviders(1)
})


const isDeleteDialogOpen = ref(false);
const IDOfObjectAboutToBeDeleted = ref('');
const openDeleteConfirmDialog = (tableID: string) => {
  // console.log("tableID:", tableID);
  IDOfObjectAboutToBeDeleted.value = tableID;
  isDeleteDialogOpen.value = true;
}

const deleteProvider = async () => {
  try {
    await providerStore.deleteProvider(IDOfObjectAboutToBeDeleted.value)
    isDeleteDialogOpen.value = false;
  } catch (e) {
    toast({
      title: 'Không thể xóa nhà cung cấp',
      description: 'Không thể xóa nhà cung cấp. Hãy thử lại sau',
    });
  }
}

const isValidNewProvider = () => {
  const providerData = newProvider.value;
  console.log("I run");
  console.log(JSON.stringify(providerData));
  if (!providerData.providerName || providerData.providerName.length > 100) {
    toast({ title: 'Lỗi', description: 'Tên nhà cung cấp không hợp lệ' });
    return false;
  }
  if (providerData.providerDescription.length > 1024) {
    toast({ title: 'Lỗi', description: 'Mô tả nhà cung cấp không hợp lệ' });
    return false;
  }
  if (providerData.providerEmail.length > 1024) {
    toast({ title: 'Lỗi', description: 'Email nhà cung cấp không hợp lệ' });
    return false;
  }
  if (providerData.providerPhoneNumber.length > 20 || !/^\d+$/.test(providerData.providerPhoneNumber)) {
    toast({ title: 'Lỗi', description: 'Số điện thoại nhà cung cấp không hợp lệ' });
    return false;
  }
  if (providerData.providerAddress.length > 1024) {
    toast({ title: 'Lỗi', description: 'Địa chỉ nhà cung cấp không hợp lệ' });
    return false;
  }
  return true;
}

const isValidEditProvider = () => {
  const providerData = currentProvider.value;
  if (!providerData.providerName || providerData.providerName.length > 100) {
    toast({ title: 'Lỗi', description: 'Tên nhà cung cấp không hợp lệ' });
    return false;
  }
  if (providerData.providerDescription.length > 1024) {
    toast({ title: 'Lỗi', description: 'Mô tả nhà cung cấp không hợp lệ' });
    return false;
  }
  if (providerData.providerEmail.length > 1024) {
    toast({ title: 'Lỗi', description: 'Email nhà cung cấp không hợp lệ' });
    return false;
  }
  if (providerData.providerPhoneNumber.length > 20 || !/^\d+$/.test(providerData.providerPhoneNumber)) {
    toast({ title: 'Lỗi', description: 'Số điện thoại nhà cung cấp không hợp lệ' });
    return false;
  }
  if (providerData.providerAddress.length > 1024) {
    toast({ title: 'Lỗi', description: 'Địa chỉ nhà cung cấp không hợp lệ' });
    return false;
  }
  return true;
}


</script>

<template>
  <div class="h-full w-full bg-gray-50 overflow-auto p-6">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold">Nhà Cung Cấp</h1>
      <Button @click="isAddModalOpen = true" size="sm" class="bg-blue-500 hover:bg-blue-600 text-white">
        <PlusIcon class="mr-2 h-4 w-4 " /> Thêm Nhà Cung Cấp
      </Button>
    </div>
    <div class="mb-4 flex space-x-4">
      <div class="relative flex-grow">
        <Input v-model="searchQuery" placeholder="Tìm kiếm theo tên, email hoặc số điện thoại" class="pl-10" />
        <SearchIcon class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
      </div>
      <Select v-model="filterStatus">
        <SelectTrigger class="w-[200px]">
          <SelectValue placeholder="Lọc Bằng Trạng Thái" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="AllStatus">Tất Cả Trạng Thái</SelectItem>
          <SelectItem v-for="option in statusOptions" :key="option.value" :value="option.value">
            {{ option.label }}
          </SelectItem>
        </SelectContent>
      </Select>
      <Button @click="resetFilters" variant="outline">Reset Bộ Lọc</Button>
    </div>

    <div class="bg-white shadow-md rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead @click="sortTable('providerName')" class="cursor-pointer">
              <div class="flex items-center justify-between">
                <span>Tên Nhà Cung Cấp</span>
                <component :is="getSortIcon('providerName') || 'div'" class="w-4 h-4 ml-2"
                  :class="{ 'text-transparent': !getSortIcon('providerName') }" />
              </div>
            </TableHead>
            <TableHead @click="sortTable('providerEmail')" class="cursor-pointer">
              <div class="flex items-center justify-between">
                <span>Địa Chỉ Mail</span>
                <component :is="getSortIcon('providerEmail') || 'div'" class="w-4 h-4 ml-2"
                  :class="{ 'text-transparent': !getSortIcon('providerEmail') }" />
              </div>
            </TableHead>
            <TableHead @click="sortTable('providerPhoneNumber')" class="cursor-pointer">
              <div class="flex items-center justify-between">
                <span>Số Điện Thoại</span>
                <component :is="getSortIcon('providerPhoneNumber') || 'div'" class="w-4 h-4 ml-2"
                  :class="{ 'text-transparent': !getSortIcon('providerPhoneNumber') }" />
              </div>
            </TableHead>
            <TableHead @click="sortTable('providerStatus')" class="cursor-pointer">
              <div class="flex items-center justify-between">
                <span>Trạng Thái</span>
                <component :is="getSortIcon('providerStatus') || 'div'" class="w-4 h-4 ml-2"
                  :class="{ 'text-transparent': !getSortIcon('providerStatus') }" />
              </div>
            </TableHead>
            <TableHead @click="sortTable('createAt')" class="cursor-pointer">
              <div class="flex items-center justify-between">
                <span>Ngày Tạo</span>
                <component :is="getSortIcon('createAt') || 'div'" class="w-4 h-4 ml-2"
                  :class="{ 'text-transparent': !getSortIcon('createAt') }" />
              </div>
            </TableHead>
            <TableHead class="text-right"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-for="provider in providerStore.providers" :key="provider.id">
            <TableCell class="font-medium">{{ provider.providerName }}</TableCell>
            <TableCell>{{ provider.providerEmail }}</TableCell>
            <TableCell>{{ provider.providerPhoneNumber }}</TableCell>
            <TableCell>
              <span :class="`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(provider.providerStatus)}`">
                {{ provider.providerStatus }}
              </span>
            </TableCell>
            <TableCell>{{ new Date(provider.createAt).toLocaleString() }}</TableCell>
            <TableCell class="text-right">
              <Button variant="ghost" size="icon" @click="openInfoModal(provider)"
                class="text-gray-600 hover:text-blue-600 hover:bg-blue-100">
                <InfoIcon class="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" @click="openEditModal(provider)"
                class="text-blue-600 hover:text-blue-600 hover:bg-blue-100">
                <PencilIcon class="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" @click="openDeleteConfirmDialog(provider.id)"
                class="text-red-500 hover:text-white hover:bg-red-500">
                <Trash2Icon class="h-4 w-4" />
              </Button>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>

    <!-- Pagination -->
    <div class="mt-4 flex items-center justify-between">
      <div class="text-sm text-gray-700">
        Đang xem từ {{ (providerStore.currentPage - 1) * 5 + 1 }} đến {{ Math.min(providerStore.currentPage * 5,
          providerStore.totalItems) }} trong {{ providerStore.totalItems }} thực thể
      </div>
      <div class="flex items-center space-x-2">
        <Button variant="outline" size="sm" @click="goToPage(providerStore.currentPage - 1)"
          :disabled="providerStore.currentPage === 1" class="text-gray-700 hover:bg-gray-100 disabled:opacity-50">
          <ChevronLeftIcon class="h-4 w-4" />
        </Button>
        <Button v-for="page in pageNumbers" :key="page" variant="outline" size="sm"
          :class="{ 'bg-blue-500 text-white': page === providerStore.currentPage, 'text-gray-700 hover:bg-gray-100': page !== providerStore.currentPage }"
          @click="typeof page === 'number' ? goToPage(page) : null" :disabled="typeof page !== 'number'">
          {{ page }}
        </Button>
        <Button variant="outline" size="sm" @click="goToPage(providerStore.currentPage + 1)"
          :disabled="providerStore.currentPage === providerStore.totalPages"
          class="text-gray-700 hover:bg-gray-100 disabled:opacity-50">
          <ChevronRightIcon class="h-4 w-4" />
        </Button>
      </div>
    </div>

    <!-- Add Provider Modal -->
    <Dialog v-model:open="isAddModalOpen">
      <ScrollArea>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Thêm Nhà Cung Cấp Mới</DialogTitle>
            <DialogDescription>
              Điền thông tin dưới đây để thêm nhà cung cấp mới.
            </DialogDescription>
          </DialogHeader>
          <form @submit.prevent="addProvider" class="space-y-4">
            <div class="space-y-2">
              <Label for="name">Tên nhà cung cấp</Label>
              <Input id="name" v-model="newProvider.providerName" required />
            </div>
            <div class="space-y-2">
              <Label for="email">Email</Label>
              <Input id="email" type="email" v-model="newProvider.providerEmail" />
            </div>
            <div class="space-y-2">
              <Label for="phoneNumber">Số điện thoại</Label>
              <Input id="phoneNumber" v-model="newProvider.providerPhoneNumber" />
            </div>
            <div class="space-y-2">
              <Label for="address">Địa chỉ</Label>
              <Textarea id="address" v-model="newProvider.providerAddress" />
            </div>
            <div class="space-y-2">
              <Label for="status">Trạng thái</Label>
              <Select v-model="newProvider.providerStatus">
                <SelectTrigger>
                  <SelectValue placeholder="Chọn trạng thái nhà cung cấp" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem v-for="option in statusOptions" :key="option.value" :value="option.value">
                    {{ option.label }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div v-if="newProvider.providerStatus === 'Custom'" class="space-y-2">
              <Label for="customStatus">Tự Chọn</Label>
              <Input id="customStatus" v-model="customStatus" required />
            </div>
            <div class="space-y-2">
              <Label for="description">Mô tả</Label>
              <Textarea id="description" v-model="newProvider.providerDescription" />
            </div>
            <DialogFooter>
              <Button type="submit" class="bg-blue-500 hover:bg-blue-600 text-white">Thêm Nhà Cung Cấp</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </ScrollArea>
    </Dialog>

    <!-- Edit Provider Modal -->
    <Dialog v-model:open="isEditModalOpen">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Chỉnh Sửa Nhà Cung Cấp</DialogTitle>
          <DialogDescription>
            Thay đổi thông tin của nhà cung cấp dưới đây.
          </DialogDescription>
        </DialogHeader>
        <form @submit.prevent="editProvider" class="space-y-4">
          <div class="space-y-2">
            <Label for="edit-name">Tên nhà cung cấp</Label>
            <Input id="edit-name" v-model="currentProvider.providerName" required />
          </div>
          <div class="space-y-2">
            <Label for="edit-email"> Địa chỉ mail</Label>
            <Input id="edit-email" type="email" v-model="currentProvider.providerEmail" />
          </div>
          <div class="space-y-2">
            <Label for="edit-phoneNumber">Số điện thoại</Label>
            <Input id="edit-phoneNumber" v-model="currentProvider.providerPhoneNumber" />
          </div>
          <div class="space-y-2">
            <Label for="edit-address">Địa Chỉ</Label>
            <Textarea id="edit-address" v-model="currentProvider.providerAddress" />
          </div>
          <div class="space-y-2">
            <Label for="edit-status">Trạng Thái</Label>
            <Select v-model="currentProvider.providerStatus">
              <SelectTrigger>
                <SelectValue placeholder="Chọn trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem v-for="option in statusOptions" :key="option.value" :value="option.value">
                  {{ option.label }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div
            v-if="!statusOptions.some(option => option.value === currentProvider.providerStatus) || currentProvider.providerStatus === 'Custom'"
            class="space-y-2">
            <Label for="edit-customStatus">Trạng thái</Label>
            <Input id="edit-customStatus" v-model="currentProvider.providerStatus" placeholder="Tự Chọn" required />
            <p>{{ currentProvider.providerStatus === 'Custom' ? currentProvider.providerStatus :
              statusOptions.find(option =>
                option.value === currentProvider.providerStatus)?.label }}</p>
          </div>
          <div class="space-y-2">
            <Label for="edit-description">Mô tả</Label>
            <Textarea id="edit-description" v-model="currentProvider.providerDescription" />
          </div>
          <DialogFooter>
            <Button type="submit">Lưu Thay Đổi</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>

    <!-- Provider Info Modal -->
    <Dialog v-model:open="isInfoModalOpen">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Thông Tin Nhà Cung Cấp</DialogTitle>
        </DialogHeader>
        <div class="space-y-4">
          <div>
            <Label class="font-bold">Tên Nhà Cung Cấp:</Label>
            <p>{{ currentProvider.providerName }}</p>
          </div>
          <div>
            <Label class="font-bold">Địa Chỉ Mail:</Label>
            <p>{{ currentProvider.providerEmail }}</p>
          </div>
          <div>
            <Label class="font-bold">Số Điện Thoại:</Label>
            <p>{{ currentProvider.providerPhoneNumber }}</p>
          </div>
          <div>
            <Label class="font-bold">Địa Chỉ:</Label>
            <p>{{ currentProvider.providerAddress || 'N/A' }}</p>
          </div>
          <div>
            <Label class="font-bold">Trạng thái:</Label>
            <p>{{ currentProvider.providerStatus }}</p>
          </div>
          <div>
            <Label class="font-bold">Mô tả:</Label>
            <p>{{ currentProvider.providerDescription || 'N/A' }}</p>
          </div>
          <div>
            <Label class="font-bold">Ngày Tạo:</Label>
            <p>{{ new Date(currentProvider.createAt).toLocaleString() }}</p>
          </div>
          <div>
            <Label class="font-bold">Ngày Chỉnh Sửa:</Label>
            <p>{{ new Date(currentProvider.updateAt).toLocaleString() }}</p>
          </div>
        </div>
        <DialogFooter>
          <Button @click="isInfoModalOpen = false">Đóng</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>


    <Dialog v-model:open="isDeleteDialogOpen">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Xác nhận xóa nhà cung cấp này?</DialogTitle>
          <DialogDescription>
            Bạn có chắc chắn muốn xóa nhà cung cấp này không? Hành động này không thể hoàn tác trừ khi liên hệ với kỹ
            thuật viên.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button @click="isDeleteDialogOpen = false"> Hủy </Button>
          <Button @click="deleteProvider" class="bg-red-400 hover:bg-red-500 text-white">Xóa</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>

<!-- <style scoped>
@import './output.css';
</style> -->
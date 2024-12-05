<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { PlusIcon, PencilIcon, Trash2Icon, ChevronLeftIcon, ChevronRightIcon, InfoIcon, ChevronUpIcon, ChevronDownIcon } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { usePromotionStore } from './pinia/promotion.store'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { UtensilsCrossed } from 'lucide-vue-next'

import { useAuthStore } from './pinia/auth'
import { hasPermission, ROLES } from './utils/permission'
import { useToast } from "./ui/toast"

const { toast } = useToast();
const authStore = useAuthStore()
const promotionStore = usePromotionStore()

const isAddPromotionModalOpen = ref(false)
const isAddPromotionForDishModalOpen = ref(false)
const isEditPromotionModalOpen = ref(false)
const isInfoModalOpen = ref(false)
const currentPromotion = ref({ id: '', promotionName: '', promotionDescription: '', discount: 0, startDate: '', endDate: '', promotionType: { type: 'invoice', details: { id: '', promotionID: '', isDeleted: false, updateAt: '', createAt: '' } } })
const newPromotion = ref({ promotionName: '', promotionDescription: '', discount: 0, startDate: '', endDate: '', promotionType: 'invoice', minimumSpend: 0, promotionLimit: null })
const selectedDishes = ref<string[]>([])
const searchQuery = ref('')

onMounted(async () => {
  await promotionStore.fetchPromotions(1)
  await promotionStore.fetchDishes()
})

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(amount)
}

const getBadgeVariant = (type: string) => {
  switch (type) {
    case 'invoice': return 'default'
    case 'dish': return 'secondary'
    default: return 'outline'
  }
}

function checkPermission() {
  const requiredRoles = [ROLES.ADMIN]; // Define the roles required to add a dish type
  console.log(authStore.userRole, requiredRoles);
  if (!hasPermission(authStore.userRole, requiredRoles)) {
    toast({
      title: 'Bị cấm',
      description: 'Tài khoản của bạn không thể thực hiện thao tác này',
    });
    return false;
  }
  return true;
}

const addPromotion = async () => {
  if (!checkPermission()) return;
  newPromotion.value.startDate = new Date(newPromotion.value.startDate).toISOString()
  newPromotion.value.endDate = new Date(newPromotion.value.endDate).toISOString()
  await promotionStore.addPromotion(newPromotion.value)
  isAddPromotionModalOpen.value = false
  newPromotion.value = { promotionName: '', promotionDescription: '', discount: 0, startDate: '', endDate: '', promotionType: 'invoice', minimumSpend: 0, promotionLimit: null }
}

const addPromotionForDish = async () => {
  if (!checkPermission()) return;
  newPromotion.value.startDate = new Date(newPromotion.value.startDate).toISOString()
  newPromotion.value.endDate = new Date(newPromotion.value.endDate).toISOString()
  const promotionData = {
    ...newPromotion.value,
    promotionType: 'dish',
    dishes: selectedDishes.value
  }
  await promotionStore.addPromotion(promotionData)
  isAddPromotionForDishModalOpen.value = false
  newPromotion.value = { promotionName: '', promotionDescription: '', discount: 0, startDate: '', endDate: '', promotionType: 'dish', minimumSpend: 0, promotionLimit: null }
  selectedDishes.value = []
}

const openEditModal = (promotion: any) => {
  if (!checkPermission()) return;
  currentPromotion.value = { ...promotion }
  isEditPromotionModalOpen.value = true
}

const openInfoModal = (promotion: any) => {
  currentPromotion.value = { ...promotion }
  isInfoModalOpen.value = true
}

const editPromotion = async () => {
  await promotionStore.updatePromotion(currentPromotion.value)
  isEditPromotionModalOpen.value = false
}



const pageNumbers = computed(() => {
  const totalPages = promotionStore.totalPages
  const currentPage = promotionStore.currentPage
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
  promotionStore.fetchPromotions(page)
}

const sortTable = (column: string) => {
  if (promotionStore.sortColumn === column) {
    promotionStore.setSorting(column, promotionStore.sortOrder === 'asc' ? 'desc' : 'asc')
  } else {
    promotionStore.setSorting(column, 'asc')
  }
  promotionStore.fetchPromotions(1)
}

const getSortIcon = (column: string) => {
  if (promotionStore.sortColumn !== column) return null
  return promotionStore.sortOrder === 'asc' ? ChevronUpIcon : ChevronDownIcon
}

const filteredDishes = computed(() => {
  // console.log("I run from promotionManagement.vue 1111111111");
  // await promotionStore.fetchDishes();
  // console.log("I run from promotionManagement.vue 22222222");
  // console.log("AHHHHHHHHHHHHHHHH", JSON.stringify(promotionStore.dishes));
  return promotionStore.dishes.filter(dish =>
    dish.name.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

const toVietnamese = (type: string) => {
  switch (type) {
    case 'invoice':
      return 'Hóa Đơn'
    case 'dish':
      return 'Món Ăn'
    default:
      return 'Khác'
  }
}

const isDeleteDialogOpen = ref(false);
const IDOfObjectAboutToBeDeleted = ref('');
const openDeleteConfirmDialog = (objectID: string) => {
  // console.log("tableID:", tableID);
  IDOfObjectAboutToBeDeleted.value = objectID;
  isDeleteDialogOpen.value = true;
}

const deletePromotion = async () => {
  if (!checkPermission()) return;
  await promotionStore.deletePromotion(IDOfObjectAboutToBeDeleted.value);
  isDeleteDialogOpen.value = false;
}

</script>

<template>
  <div class="h-full w-full bg-gray-50 overflow-auto p-6">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold black">Quản Lý Khuyến Mãi</h1>
      <div class="space-x-2">
        <Button @click="isAddPromotionModalOpen = true" size="sm" class="bg-blue-500 hover:bg-blue-600 text-white">
          <PlusIcon class="mr-2 h-4 w-4" /> Thêm Khuyến Mãi
        </Button>
        <Button @click="isAddPromotionForDishModalOpen = true" size="sm"
          class="bg-blue-500 hover:bg-blue-600 text-white">
          <PlusIcon class="mr-2 h-4 w-4" /> Thêm Khuyến Mãi Cho Món Ăn
        </Button>
      </div>
    </div>

    <div class="bg-white shadow-md rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead @click="sortTable('promotionName')" class="cursor-pointer">
              <div class="flex items-center justify-between">
                <span>Tên Khuyến Mãi</span>
                <component :is="getSortIcon('promotionName') || 'div'" class="w-4 h-4 ml-2" />
              </div>
            </TableHead>
            <TableHead @click="sortTable('discount')" class="cursor-pointer">
              <div class="flex items-center justify-between">
                <span>Tỷ Lệ Giảm Giá</span>
                <component :is="getSortIcon('discount') || 'div'" class="w-4 h-4 ml-2" />
              </div>
            </TableHead>
            <TableHead @click="sortTable('startDate')" class="cursor-pointer">
              <div class="flex items-center justify-between">
                <span>Ngày Bắt Đầu</span>
                <component :is="getSortIcon('startDate') || 'div'" class="w-4 h-4 ml-2" />
              </div>
            </TableHead>
            <TableHead @click="sortTable('endDate')" class="cursor-pointer">
              <div class="flex items-center justify-between">
                <span>Ngày Kết Thúc</span>
                <component :is="getSortIcon('endDate') || 'div'" class="w-4 h-4 ml-2" />
              </div>
            </TableHead>
            <TableHead>Loại Khuyến Mãi</TableHead>
            <TableHead class="text-right"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-for="promotion in promotionStore.promotions" :key="promotion.id">
            <TableCell class="font-medium">{{ promotion.promotionName }}</TableCell>
            <TableCell>{{ promotion.discount }}%</TableCell>
            <TableCell>{{ new Date(promotion.startDate).toLocaleDateString() }}</TableCell>
            <TableCell>{{ new Date(promotion.endDate).toLocaleDateString() }}</TableCell>
            <TableCell>{{ toVietnamese(promotion.promotionType.type) }}</TableCell>
            <TableCell class="text-right">
              <Button variant="ghost" size="icon" @click="openInfoModal(promotion)"
                class="text-blue-500 hover:text-blue-600 hover:bg-blue-100">
                <InfoIcon class="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" @click="openEditModal(promotion)"
                class="text-blue-500 hover:text-blue-600 hover:bg-blue-100">
                <PencilIcon class="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" @click="openDeleteConfirmDialog(promotion.id)"
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
        Showing {{ (promotionStore.currentPage - 1) * 5 + 1 }} to {{ Math.min(promotionStore.currentPage * 5,
          promotionStore.totalItems) }} of {{ promotionStore.totalItems }} entries
      </div>
      <div class="flex items-center space-x-2">
        <Button variant="outline" size="sm" @click="goToPage(promotionStore.currentPage - 1)"
          :disabled="promotionStore.currentPage === 1" class="text-gray-700 hover:bg-gray-100 disabled:opacity-50">
          <ChevronLeftIcon class="h-4 w-4" />
        </Button>
        <Button v-for="page in pageNumbers" :key="page" variant="outline" size="sm"
          :class="{ 'bg-blue-500 text-white': page === promotionStore.currentPage, 'text-gray-700 hover:bg-gray-100': page !== promotionStore.currentPage }"
          @click="typeof page === 'number' ? goToPage(page) : null" :disabled="typeof page !== 'number'">
          {{ page }}
        </Button>
        <Button variant="outline" size="sm" @click="goToPage(promotionStore.currentPage + 1)"
          :disabled="promotionStore.currentPage === promotionStore.totalPages"
          class="text-gray-700 hover:bg-gray-100 disabled:opacity-50">
          <ChevronRightIcon class="h-4 w-4" />
        </Button>
      </div>
    </div>

    <!-- Add Promotion Modal -->
    <Dialog v-model:open="isAddPromotionModalOpen">

      <DialogContent class="h-full max-h-[660px]">
        <ScrollArea class="h-full ">
          <DialogHeader>
            <DialogTitle>Thêm Khuyến Mãi</DialogTitle>
            <DialogDescription>
              Nhập thông tin dưới đây để thêm khuyến mãi.
            </DialogDescription>
          </DialogHeader>
          <form @submit.prevent="addPromotion" class="space-y-4">
            <div class="space-y-2">
              <Label for="name">Tên Khuyến Mãi</Label>
              <Input id="name" v-model="newPromotion.promotionName" required />
            </div>
            <div class="space-y-2">
              <Label for="description">Mô tả</Label>
              <Input id="description" v-model="newPromotion.promotionDescription" />
            </div>
            <div class="space-y-2">
              <Label for="discount">Tỷ Lệ Giảm (%)</Label>
              <Input id="discount" type="number" v-model="newPromotion.discount" required />
            </div>
            <div class="space-y-2">
              <Label for="minimumSpend">Hóa Đơn Tối Thiểu (VND)</Label>
              <Input id="minimumSpend" type="number" v-model="newPromotion.minimumSpend" />
            </div>
            <div class="space-y-2">
              <Label for="promotionLimit">Số Tiền Khuyến Mãi Tối Đa (VND)</Label>
              <Input id="promotionLimit" type="number" v-model="newPromotion.promotionLimit" />
            </div>
            <div class="space-y-2">
              <Label for="startDate">Ngày Bắt Đầu</Label>
              <Input id="startDate" type="date" v-model="newPromotion.startDate" required />
            </div>
            <div class="space-y-2">
              <Label for="endDate">Ngày Kết Thúc</Label>
              <Input id="endDate" type="date" v-model="newPromotion.endDate" required />
            </div>
            <DialogFooter>
              <Button type="submit" class="bg-blue-500 hover:bg-blue-600 text-white">Thêm Khuyến Mãi</Button>
            </DialogFooter>
          </form>
        </ScrollArea>
      </DialogContent>

    </Dialog>

    <!-- Add Promotion For Dish Modal -->
    <Dialog v-model:open="isAddPromotionForDishModalOpen">
      <DialogContent class="h-full max-h-[660px]">
        <ScrollArea class="h-full">
          <DialogHeader>
            <DialogTitle>Thêm Khuyến Mãi Cho Món Ăn</DialogTitle>
            <DialogDescription>
              Nhập các thông tin dưới đây để thêm khuyến mãi cho món ăn.
            </DialogDescription>
          </DialogHeader>
          <form @submit.prevent="addPromotionForDish" class="space-y-4 dialog-content-scroll">
            <div class="space-y-2">
              <Label for="name">Tên Khuyến Mãi</Label>
              <Input id="name" v-model="newPromotion.promotionName" required />
            </div>
            <div class="space-y-2">
              <Label for="description">Mô Tả</Label>
              <Input id="description" v-model="newPromotion.promotionDescription" />
            </div>
            <div class="space-y-2">
              <Label for="discount">Tỷ Lệ Giảm Giá (%)</Label>
              <Input id="discount" type="number" v-model="newPromotion.discount" required />
            </div>
            <div class="space-y-2">
              <Label for="startDate">Ngày Bắt Đầu</Label>
              <Input id="startDate" type="date" v-model="newPromotion.startDate" required />
            </div>
            <div class="space-y-2">
              <Label for="endDate">Ngày Kết Thúc</Label>
              <Input id="endDate" type="date" v-model="newPromotion.endDate" required />
            </div>
            <div class="space-y-2">
              <Label>Chọn Món Khuyến Mãi</Label>
              <Input v-model="searchQuery" placeholder="Search dishes..." />
              <ScrollArea class="h-[200px] w-full rounded-md border">
                <div class="p-4">
                  <div v-for="dish in filteredDishes" :key="dish.id" class="flex items-center space-x-2 py-2">
                    <Checkbox :id="dish.id" v-model="selectedDishes" :value="dish.id" />
                    <Label :for="dish.id" class="flex-grow">{{ dish.name }}</Label>
                  </div>
                </div>
              </ScrollArea>
            </div>
            <DialogFooter>
              <Button type="submit" class="bg-blue-500 hover:bg-blue-600 text-white">Add Promotion For Dish</Button>
            </DialogFooter>
          </form>
        </ScrollArea>
      </DialogContent>
    </Dialog>

    <!-- Edit Promotion Modal -->
    <Dialog v-model:open="isEditPromotionModalOpen">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Chỉnh Sửa Khuyến Mãi</DialogTitle>
          <DialogDescription>
            Cập nhật thông tin cho khuyến mãi dưới đây.
          </DialogDescription>
        </DialogHeader>
        <form @submit.prevent="editPromotion" class="space-y-4">
          <div class="space-y-2">
            <Label for="edit-name">Tên Khuyến Mãi</Label>
            <Input id="edit-name" v-model="currentPromotion.promotionName" required />
          </div>
          <div class="space-y-2">
            <Label for="edit-description">Mô Tả</Label>
            <Input id="edit-description" v-model="currentPromotion.promotionDescription" />
          </div>
          <div class="space-y-2">
            <Label for="edit-discount">Tỷ Lệ Giảm Giá (%)</Label>
            <Input id="edit-discount" type="number" v-model="currentPromotion.discount" required />
          </div>
          <div class="space-y-2">
            <Label for="edit-startDate">Ngày Bắt Đầu</Label>
            <Input id="edit-startDate" type="date" v-model="currentPromotion.startDate" required />
          </div>
          <div class="space-y-2">
            <Label for="edit-endDate">Ngày Kết Thúc</Label>
            <Input id="edit-endDate" type="date" v-model="currentPromotion.endDate" required />
          </div>
          <DialogFooter>
            <Button type="submit" class="bg-blue-500 hover:bg-blue-600 text-white">Lưu Thay Đổi</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>

    <!-- Promotion Info Modal -->
    <Dialog v-model:open="isInfoModalOpen">
      <DialogContent class="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle class="text-2xl font-bold">{{ currentPromotion.promotionName }}</DialogTitle>
          <DialogDescription>{{ currentPromotion.promotionDescription || 'No description available' }}
          </DialogDescription>
        </DialogHeader>
        <div class="mt-6 space-y-6">
          <div class="flex justify-between items-center">
            <div>
              <p class="text-sm text-gray-500">Tỷ Lệ Giảm Giá</p>
              <p class="text-3xl font-bold text-green-600">{{ currentPromotion.discount }}%</p>
            </div>
            <Badge class="text-lg px-3 py-1" :variant="getBadgeVariant(currentPromotion.promotionType.type)">
              {{ toVietnamese(currentPromotion.promotionType.type) }}
            </Badge>
          </div>

          <Separator />

          <div class="grid grid-cols-2 gap-4">
            <div>
              <Label class="text-sm text-gray-500">Ngày Bắt Đầu</Label>
              <p class="font-medium">{{ formatDate(currentPromotion.startDate) }}</p>
            </div>
            <div>
              <Label class="text-sm text-gray-500">Ngày Kết Thúc</Label>
              <p class="font-medium">{{ formatDate(currentPromotion.endDate) }}</p>
            </div>
          </div>

          <Separator />

          <div v-if="currentPromotion.promotionType.type === 'invoice'">
            <h3 class="text-lg font-semibold mb-2">Chi tiết hóa đơn</h3>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <Label class="text-sm text-gray-500">Chi tiêu thấp nhất để được áp dụng</Label>
                <p class="font-medium">{{ formatCurrency(currentPromotion.promotionType.details.minimumSpend) }}</p>
              </div>
              <div>
                <Label class="text-sm text-gray-500">Giới hạn số tiền khuyến mãi</Label>
                <p class="font-medium">
                  {{ currentPromotion.promotionType.details.promotionLimit
                    ? formatCurrency(currentPromotion.promotionType.details.promotionLimit)
                    : 'Unlimited' }}
                </p>
              </div>
            </div>
          </div>

          <div v-if="currentPromotion.promotionType.type === 'dish'">
            <h3 class="text-lg font-semibold mb-2">Món Ăn Áp Dụng</h3>
            <ScrollArea class="h-[200px] w-full rounded-md border">
              <div class="p-4">
                <ul class="grid grid-cols-2 gap-2">
                  <li v-for="dish in currentPromotion.promotionType.details.dishes" :key="dish"
                    class="flex items-center space-x-2 bg-gray-100 rounded-md p-2">
                    <UtensilsCrossed class="h-4 w-4 text-gray-500" />
                    <span class="text-sm">{{ dish.name }}</span>
                  </li>
                </ul>
              </div>
            </ScrollArea>
          </div>
        </div>
        <DialogFooter>
          <Button @click="isInfoModalOpen = false" variant="outline">Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>


    <Dialog v-model:open="isDeleteDialogOpen">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Xác nhận xóa khuyến mãi này?</DialogTitle>
          <DialogDescription>
            Bạn có chắc chắn muốn xóa khuyến mãi này. Hành động này không thể hoàn tác trừ
            khi liên hệ với kỹ
            thuật viên.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button @click="isDeleteDialogOpen = false"> Hủy </Button>
          <Button @click="deletePromotion" class="bg-red-400 hover:bg-red-500 text-white">Xóa</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>
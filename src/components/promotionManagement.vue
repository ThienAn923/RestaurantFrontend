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

const addPromotion = async () => {
  newPromotion.value.startDate = new Date(newPromotion.value.startDate).toISOString()
  newPromotion.value.endDate = new Date(newPromotion.value.endDate).toISOString()
  await promotionStore.addPromotion(newPromotion.value)
  isAddPromotionModalOpen.value = false
  newPromotion.value = { promotionName: '', promotionDescription: '', discount: 0, startDate: '', endDate: '', promotionType: 'invoice', minimumSpend: 0, promotionLimit: null }
}

const addPromotionForDish = async () => {
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

const deletePromotion = async (id: string) => {
  await promotionStore.deletePromotion(id)
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
  return promotionStore.dishes.filter(dish => 
    dish.name.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})
</script>

<template>
  <div class="h-full w-full bg-gray-50 overflow-auto p-6">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold">Promotions</h1>
      <div class="space-x-2">
        <Button @click="isAddPromotionModalOpen = true" size="sm">
          <PlusIcon class="mr-2 h-4 w-4" /> Add Promotion For Invoice
        </Button>
        <Button @click="isAddPromotionForDishModalOpen = true" size="sm">
          <PlusIcon class="mr-2 h-4 w-4" /> Add Promotion For Dish
        </Button>
      </div>
    </div>

    <div class="bg-white shadow-md rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead @click="sortTable('promotionName')" class="cursor-pointer">
              <div class="flex items-center justify-between">
                <span>Name</span>
                <component :is="getSortIcon('promotionName') || 'div'" class="w-4 h-4 ml-2" />
              </div>
            </TableHead>
            <TableHead @click="sortTable('discount')" class="cursor-pointer">
              <div class="flex items-center justify-between">
                <span>Discount</span>
                <component :is="getSortIcon('discount') || 'div'" class="w-4 h-4 ml-2" />
              </div>
            </TableHead>
            <TableHead @click="sortTable('startDate')" class="cursor-pointer">
              <div class="flex items-center justify-between">
                <span>Start Date</span>
                <component :is="getSortIcon('startDate') || 'div'" class="w-4 h-4 ml-2" />
              </div>
            </TableHead>
            <TableHead @click="sortTable('endDate')" class="cursor-pointer">
              <div class="flex items-center justify-between">
                <span>End Date</span>
                <component :is="getSortIcon('endDate') || 'div'" class="w-4 h-4 ml-2" />
              </div>
            </TableHead>
            <TableHead>Type</TableHead>
            <TableHead class="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-for="promotion in promotionStore.promotions" :key="promotion.id">
            <TableCell class="font-medium">{{ promotion.promotionName }}</TableCell>
            <TableCell>{{ promotion.discount }}%</TableCell>
            <TableCell>{{ new Date(promotion.startDate).toLocaleDateString() }}</TableCell>
            <TableCell>{{ new Date(promotion.endDate).toLocaleDateString() }}</TableCell>
            <TableCell>{{ promotion.promotionType.type }}</TableCell>
            <TableCell class="text-right">
              <Button variant="ghost" size="icon" @click="openInfoModal(promotion)">
                <InfoIcon class="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" @click="openEditModal(promotion)">
                <PencilIcon class="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" @click="deletePromotion(promotion.id)">
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
        Showing {{ (promotionStore.currentPage - 1) * 5 + 1 }} to {{ Math.min(promotionStore.currentPage * 5, promotionStore.totalItems) }} of {{ promotionStore.totalItems }} entries
      </div>
      <div class="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          @click="goToPage(promotionStore.currentPage - 1)"
          :disabled="promotionStore.currentPage === 1"
        >
          <ChevronLeftIcon class="h-4 w-4" />
        </Button>
        <Button
          v-for="page in pageNumbers"
          :key="page"
          variant="outline"
          size="sm"
          :class="{ 'bg-primary text-primary-foreground': page === promotionStore.currentPage }"
          @click="typeof page === 'number' ? goToPage(page) : null"
          :disabled="typeof page !== 'number'"
        >
          {{ page }}
        </Button>
        <Button
          variant="outline"
          size="sm"
          @click="goToPage(promotionStore.currentPage + 1)"
          :disabled="promotionStore.currentPage === promotionStore.totalPages"
        >
          <ChevronRightIcon class="h-4 w-4" />
        </Button>
      </div>
    </div>

    <!-- Add Promotion Modal -->
    <Dialog v-model:open="isAddPromotionModalOpen">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Promotion for Invoice</DialogTitle>
          <DialogDescription>
            Enter the details for the new promotion.
          </DialogDescription>
        </DialogHeader>
        <form @submit.prevent="addPromotion" class="space-y-4">
          <div class="space-y-2">
            <Label for="name">Name</Label>
            <Input id="name" v-model="newPromotion.promotionName" required />
          </div>
          <div class="space-y-2">
            <Label for="description">Description</Label>
            <Input id="description" v-model="newPromotion.promotionDescription" />
          </div>
          <div class="space-y-2">
            <Label for="discount">Discount (%)</Label>
            <Input id="discount" type="number" v-model="newPromotion.discount" required />
          </div>
          <div class="space-y-2">
            <Label for="minimumSpend">Minimum Spend (VND)</Label>
            <Input id="minimumSpend" type="number" v-model="newPromotion.minimumSpend" />
          </div>
          <div class="space-y-2">
            <Label for="promotionLimit">Promotion Limit (VND)</Label>
            <Input id="promotionLimit" type="number" v-model="newPromotion.promotionLimit" />
          </div>
          <div class="space-y-2">
            <Label for="startDate">Start Date</Label>
            <Input id="startDate" type="date" v-model="newPromotion.startDate" required />
          </div>
          <div class="space-y-2">
            <Label for="endDate">End Date</Label>
            <Input id="endDate" type="date" v-model="newPromotion.endDate" required />
          </div>
          <DialogFooter>
            <Button type="submit">Add Promotion</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>

    <!-- Add Promotion For Dish Modal -->
    <Dialog v-model:open="isAddPromotionForDishModalOpen">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Promotion For Dish</DialogTitle>
          <DialogDescription>
            Enter the details for the new promotion for dish.
          </DialogDescription>
        </DialogHeader>
        <form @submit.prevent="addPromotionForDish" class="space-y-4">
          <div class="space-y-2">
            <Label for="name">Name</Label>
            <Input id="name" v-model="newPromotion.promotionName" required />
          </div>
          <div class="space-y-2">
            <Label for="description">Description</Label>
            <Input id="description" v-model="newPromotion.promotionDescription" />
          </div>
          <div class="space-y-2">
            <Label for="discount">Discount (%)</Label>
            <Input id="discount" type="number" v-model="newPromotion.discount" required />
          </div>
          <div class="space-y-2">
            <Label for="startDate">Start Date</Label>
            <Input id="startDate" type="date" v-model="newPromotion.startDate" required />
          </div>
          <div class="space-y-2">
            <Label for="endDate">End Date</Label>
            <Input id="endDate" type="date" v-model="newPromotion.endDate" required />
          </div>
          <div class="space-y-2">
            <Label>Select Dishes</Label>
            <Input v-model="searchQuery" placeholder="Search dishes..." />
            <div class="max-h-60 overflow-y-auto mt-2">
              <div v-for="dish in filteredDishes" :key="dish.id" class="flex items-center space-x-2">
                <Checkbox :id="dish.id" v-model="selectedDishes" :value="dish.id" />
                <Label :for="dish.id">{{ dish.name }}</Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">Add Promotion For Dish</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>

    <!-- Edit Promotion Modal -->
    <Dialog v-model:open="isEditPromotionModalOpen">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Promotion</DialogTitle>
          <DialogDescription>
            Update the details for the promotion.
          </DialogDescription>
        </DialogHeader>
        <form @submit.prevent="editPromotion" class="space-y-4">
          <div class="space-y-2">
            <Label for="edit-name">Name</Label>
            <Input id="edit-name" v-model="currentPromotion.promotionName" required />
          </div>
          <div class="space-y-2">
            <Label for="edit-description">Description</Label>
            <Input id="edit-description" v-model="currentPromotion.promotionDescription" />
          </div>
          <div class="space-y-2">
            <Label for="edit-discount">Discount (%)</Label>
            <Input id="edit-discount" type="number" v-model="currentPromotion.discount" required />
          </div>
          <div class="space-y-2">
            <Label for="edit-startDate">Start Date</Label>
            <Input id="edit-startDate" type="date" v-model="currentPromotion.startDate" required />
          </div>
          <div class="space-y-2">
            <Label for="edit-endDate">End Date</Label>
            <Input id="edit-endDate" type="date" v-model="currentPromotion.endDate" required />
          </div>
          <DialogFooter>
            <Button type="submit">Save Changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>

    <!-- Promotion Info Modal -->
    <Dialog v-model:open="isInfoModalOpen">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Promotion Information</DialogTitle>
        </DialogHeader>
        <div class="space-y-4">
          <div>
            <Label class="font-bold">Name:</Label>
            <p>{{ currentPromotion.promotionName }}</p>
          </div>
          <div>
            <Label class="font-bold">Description:</Label>
            <p>{{ currentPromotion.promotionDescription || 'N/A' }}</p>
          </div>
          <div>
            <Label class="font-bold">Discount:</Label>
            <p>{{ currentPromotion.discount }}%</p>
          </div>
          <div>
            <Label class="font-bold">Start Date:</Label>
            <p>{{ new Date(currentPromotion.startDate).toLocaleString() }}</p>
          </div>
          <div>
            <Label class="font-bold">End Date:</Label>
            <p>{{ new Date(currentPromotion.endDate).toLocaleString() }}</p>
          </div>
          <div>
            <Label class="font-bold">Type:</Label>
            <p>{{ currentPromotion.promotionType.type }}</p>
          </div>
          <div v-if="currentPromotion.promotionType.type === 'invoice'">
            <Label class="font-bold">Minimum Spend:</Label>
            <p>{{ currentPromotion.promotionType.details.minimumSpend ? `${currentPromotion.promotionType.details.minimumSpend.toLocaleString()} VND` : 'N/A' }}</p>
          </div>
          <div v-if="currentPromotion.promotionType.type === 'invoice'">
            <Label class="font-bold">Promotion Limit:</Label>
            <p>{{ currentPromotion.promotionType.details.promotionLimit ? `${currentPromotion.promotionType.details.promotionLimit.toLocaleString()} VND` : 'Unlimited' }}</p>
          </div>
        </div>
        <DialogFooter>
          <Button @click="isInfoModalOpen = false">Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>
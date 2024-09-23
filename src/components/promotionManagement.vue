<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { PlusIcon, PencilIcon, Trash2Icon, ChevronLeftIcon, ChevronRightIcon } from 'lucide-vue-next'
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
const isEditPromotionModalOpen = ref(false)
const currentPromotion = ref({ id: '', promotionName: '', promotionDescription: '', discount: 0, startDate: '', endDate: '', isAfterDish: false, dishes: [] })
const newPromotion = ref({ promotionName: '', promotionDescription: '', discount: 0, startDate: '', endDate: '', isAfterDish: false, dishes: [] })

onMounted(async () => {
  await promotionStore.fetchPromotions(1)
  await promotionStore.fetchDishes()
})

const addPromotion = async () => {
  await promotionStore.addPromotion(newPromotion.value)
  isAddPromotionModalOpen.value = false
  newPromotion.value = { promotionName: '', promotionDescription: '', discount: 0, startDate: '', endDate: '', isAfterDish: false, dishes: [] }
}

const openEditModal = (promotion: any) => {
  currentPromotion.value = { ...promotion }
  isEditPromotionModalOpen.value = true
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
</script>

<template>
  <div class="h-full w-full bg-gray-50 overflow-auto p-6">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold">Promotions</h1>
      <div class="space-x-2">
        <Button @click="isAddPromotionModalOpen = true" size="sm">
          <PlusIcon class="mr-2 h-4 w-4" /> Add Promotion
        </Button>
      </div>
    </div>

    <div class="bg-white shadow-md rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Discount</TableHead>
            <TableHead>Start Date</TableHead>
            <TableHead>End Date</TableHead>
            <TableHead>Type</TableHead>
            <TableHead class="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-for="promotion in promotionStore.promotions" :key="promotion.id">
            <TableCell class="font-medium">{{ promotion.promotionName }}</TableCell>
            <TableCell>{{ promotion.promotionDescription }}</TableCell>
            <TableCell>{{ promotion.discount }}%</TableCell>
            <TableCell>{{ new Date(promotion.startDate).toLocaleDateString() }}</TableCell>
            <TableCell>{{ new Date(promotion.endDate).toLocaleDateString() }}</TableCell>
            <TableCell>{{ promotion.isAfterDish ? 'After Dish' : 'After Invoice' }}</TableCell>
            <TableCell class="text-right">
              <Button
                variant="ghost"
                size="icon"
                @click="openEditModal(promotion)"
              >
                <PencilIcon class="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                @click="deletePromotion(promotion.id)"
              >
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
          <DialogTitle>Add New Promotion</DialogTitle>
          <DialogDescription>
            Enter the details for the new promotion.
          </DialogDescription>
        </DialogHeader>
        <form @submit.prevent="addPromotion" class="space-y-4">
          <div class="space-y-2">
            <Label for="name">Name</Label>
            <Input
              id="name"
              v-model="newPromotion.promotionName"
              required
            />
          </div>
          <div class="space-y-2">
            <Label for="description">Description</Label>
            <Input
              id="description"
              v-model="newPromotion.promotionDescription"
            />
          </div>
          <div class="space-y-2">
            <Label for="discount">Discount (%)</Label>
            <Input
              id="discount"
              type="number"
              v-model="newPromotion.discount"
              required
            />
          </div>
          <div class="space-y-2">
            <Label for="startDate">Start Date</Label>
            <Input
              id="startDate"
              type="date"
              v-model="newPromotion.startDate"
              required
            />
          </div>
          <div class="space-y-2">
            <Label for="endDate">End Date</Label>
            <Input
              id="endDate"
              type="date"
              v-model="newPromotion.endDate"
              required
            />
          </div>
          <div class="flex items-center space-x-2">
            <Checkbox id="isAfterDish" v-model="newPromotion.isAfterDish" />
            <Label for="isAfterDish">Promotion After Dish</Label>
          </div>
          <div v-if="newPromotion.isAfterDish" class="space-y-2">
            <Label for="dishes">Select Dishes</Label>
            <Select v-model="newPromotion.dishes" multiple>
              <SelectTrigger>
                <SelectValue placeholder="Select dishes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem v-for="dish in promotionStore.dishes" :key="dish.id" :value="dish.id">
                  {{ dish.name }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button type="submit">Add Promotion</Button>
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
            Make changes to the promotion.
          </DialogDescription>
        </DialogHeader>
        <form @submit.prevent="editPromotion" class="space-y-4">
          <div class="space-y-2">
            <Label for="edit-name">Name</Label>
            <Input
              id="edit-name"
              v-model="currentPromotion.promotionName"
              required
            />
          </div>
          <div class="space-y-2">
            <Label for="edit-description">Description</Label>
            <Input
              id="edit-description"
              v-model="currentPromotion.promotionDescription"
            />
          </div>
          <div class="space-y-2">
            <Label for="edit-discount">Discount (%)</Label>
            <Input
              id="edit-discount"
              type="number"
              v-model="currentPromotion.discount"
              required
            />
          </div>
          <div class="space-y-2">
            <Label for="edit-startDate">Start Date</Label>
            <Input
              id="edit-startDate"
              type="date"
              v-model="currentPromotion.startDate"
              required
            />
          </div>
          <div class="space-y-2">
            <Label for="edit-endDate">End Date</Label>
            <Input
              id="edit-endDate"
              type="date"
              v-model="currentPromotion.endDate"
              required
            />
          </div>
          <div class="flex items-center space-x-2">
            <Checkbox id="edit-isAfterDish" v-model="currentPromotion.isAfterDish" />
            <Label for="edit-isAfterDish">Promotion After Dish</Label>
          </div>
          <div v-if="currentPromotion.isAfterDish" class="space-y-2">
            <Label for="edit-dishes">Select Dishes</Label>
            <Select v-model="currentPromotion.dishes" multiple>
              <SelectTrigger>
                <SelectValue placeholder="Select dishes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem v-for="dish in promotionStore.dishes" :key="dish.id" :value="dish.id">
                  {{ dish.name }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button type="submit">Save Changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  </div>
</template>
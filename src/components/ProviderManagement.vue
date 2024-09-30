<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { PlusIcon, PencilIcon, Trash2Icon, ChevronLeftIcon, ChevronRightIcon, InfoIcon, ChevronUpIcon, ChevronDownIcon } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useProviderStore } from './pinia/provider.store'

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
  { value: 'Potential', label: 'Potential', color: 'bg-blue-100 text-blue-800' },
  { value: 'Normal', label: 'Normal', color: 'bg-gray-100 text-gray-800' },
  { value: 'Important', label: 'Important', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'Very Important', label: 'Very Important', color: 'bg-red-100 text-red-800' },
  { value: 'Custom', label: 'Custom', color: 'bg-purple-100 text-purple-800' },
]

  onMounted(() => {
    providerStore.fetchProviders(1)
  })

// const addProvider = async () => {
//   const providerData = { ...newProvider.value }
//   // if (providerData.providerStatus === 'Custom') {
//   //   providerData.providerStatus = providerData.customStatus
//   // }
//   await providerStore.addProvider(providerData)
//   isAddModalOpen.value = false
//   newProvider.value = {
//     providerName: '',
//     providerDescription: '',
//     providerPhoneNumber: '',
//     providerEmail: '',
//     providerAddress: '',
//     providerStatus: '',
//     // customStatus: '',
//   }
// }
  const customStatus = ref('')
  const addProvider = async () => {
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
  const providerData = { ...currentProvider.value }
  if (providerData.providerStatus === 'Custom') {
    providerData.providerStatus = providerData.customStatus
  }
  await providerStore.updateProvider(providerData)
  isEditModalOpen.value = false
}

const deleteProvider = async (id: string) => {
  await providerStore.deleteProvider(id)
}

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

// watch(() => newProvider.value.providerStatus, (newStatus) => {
//   if (newStatus !== 'Custom') {
//     newProvider.value.customStatus = ''
//   }
// })

// watch(() => currentProvider.value.providerStatus, (newStatus) => {
//   if (newStatus !== 'Custom') {
//     currentProvider.value.customStatus = ''
//   }
// })
</script>

<template>
  <div class="h-full w-full bg-gray-50 overflow-auto p-6">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold">Providers</h1>
      <Button @click="isAddModalOpen = true" size="sm">
        <PlusIcon class="mr-2 h-4 w-4" /> Add Provider
      </Button>
    </div>

    <div class="bg-white shadow-md rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead @click="sortTable('providerName')" class="cursor-pointer">
              <div class="flex items-center justify-between">
                <span>Name</span>
                <component 
                  :is="getSortIcon('providerName') || 'div'" 
                  class="w-4 h-4 ml-2"
                  :class="{'text-transparent': !getSortIcon('providerName')}"
                />
              </div>
            </TableHead>
            <TableHead @click="sortTable('providerEmail')" class="cursor-pointer">
              <div class="flex items-center justify-between">
                <span>Email</span>
                <component 
                  :is="getSortIcon('providerEmail') || 'div'" 
                  class="w-4 h-4 ml-2"
                  :class="{'text-transparent': !getSortIcon('providerEmail')}"
                />
              </div>
            </TableHead>
            <TableHead @click="sortTable('providerPhoneNumber')" class="cursor-pointer">
              <div class="flex items-center justify-between">
                <span>Phone Number</span>
                <component 
                  :is="getSortIcon('providerPhoneNumber') || 'div'" 
                  class="w-4 h-4 ml-2"
                  :class="{'text-transparent': !getSortIcon('providerPhoneNumber')}"
                />
              </div>
            </TableHead>
            <TableHead @click="sortTable('providerStatus')" class="cursor-pointer">
              <div class="flex items-center justify-between">
                <span>Status</span>
                <component 
                  :is="getSortIcon('providerStatus') || 'div'" 
                  class="w-4 h-4 ml-2"
                  :class="{'text-transparent': !getSortIcon('providerStatus')}"
                />
              </div>
            </TableHead>
            <TableHead @click="sortTable('createAt')" class="cursor-pointer">
              <div class="flex items-center justify-between">
                <span>Created At</span>
                <component 
                  :is="getSortIcon('createAt') || 'div'" 
                  class="w-4 h-4 ml-2"
                  :class="{'text-transparent': !getSortIcon('createAt')}"
                />
              </div>
            </TableHead>
            <TableHead class="text-right">Actions</TableHead>
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
              <Button
                variant="ghost"
                size="icon"
                @click="openInfoModal(provider)"
              >
                <InfoIcon class="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                @click="openEditModal(provider)"
              >
                <PencilIcon class="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                @click="deleteProvider(provider.id)"
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
        Showing {{ (providerStore.currentPage - 1) * 5 + 1 }} to {{ Math.min(providerStore.currentPage * 5, providerStore.totalItems) }} of {{ providerStore.totalItems }} entries
      </div>
      <div class="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          @click="goToPage(providerStore.currentPage - 1)"
          :disabled="providerStore.currentPage === 1"
        >
          <ChevronLeftIcon class="h-4 w-4" />
        </Button>
        <Button
          v-for="page in pageNumbers"
          :key="page"
          variant="outline"
          size="sm"
          :class="{ 'bg-primary text-primary-foreground': page === providerStore.currentPage }"
          @click="typeof page === 'number' ? goToPage(page) : null"
          :disabled="typeof page !== 'number'"
        >
          {{ page }}
        </Button>
        <Button
          variant="outline"
          size="sm"
          @click="goToPage(providerStore.currentPage + 1)"
          :disabled="providerStore.currentPage === providerStore.totalPages"
        >
          <ChevronRightIcon class="h-4 w-4" />
        </Button>
      </div>
    </div>

    <!-- Add Provider Modal -->
    <Dialog v-model:open="isAddModalOpen">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Provider</DialogTitle>
          <DialogDescription>
            Enter the details for the new provider.
          </DialogDescription>
        </DialogHeader>
        <form @submit.prevent="addProvider" class="space-y-4">
          <div class="space-y-2">
            <Label for="name">Name</Label>
            <Input
              id="name"
              v-model="newProvider.providerName"
              required
            />
          </div>
          <div class="space-y-2">
            <Label for="email">Email</Label>
            <Input
              id="email"
              type="email"
              v-model="newProvider.providerEmail"
              required
            />
          </div>
          <div class="space-y-2">
            <Label for="phoneNumber">Phone Number</Label>
            <Input
              id="phoneNumber"
              v-model="newProvider.providerPhoneNumber"
              required
            />
          </div>
          <div class="space-y-2">
            <Label for="address">Address</Label>
            <Textarea
              id="address"
              v-model="newProvider.providerAddress"
            />
          </div>
          <div class="space-y-2">
          <Label for="status">Status</Label>
          <Select v-model="newProvider.providerStatus">
            <SelectTrigger>
              <SelectValue placeholder="Select provider status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem v-for="option in statusOptions" :key="option.value" :value="option.value">
                {{ option.label }}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div v-if="newProvider.providerStatus === 'Custom'" class="space-y-2">
          <Label for="customStatus">Custom Status</Label>
          <Input
            id="customStatus"
            v-model="customStatus"
            required
          />
        </div>
          <div class="space-y-2">
            <Label for="description">Description</Label>
            <Textarea
              id="description"
              v-model="newProvider.providerDescription"
            />
          </div>
          <DialogFooter>
            <Button type="submit">Add Provider</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>

    <!-- Edit Provider Modal -->
    <Dialog v-model:open="isEditModalOpen">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Provider</DialogTitle>
          <DialogDescription>
            Make changes to the provider.
          </DialogDescription>
        </DialogHeader>
        <form @submit.prevent="editProvider" class="space-y-4">
          <div class="space-y-2">
            <Label for="edit-name">Name</Label>
            <Input
              id="edit-name"
              v-model="currentProvider.providerName"
              required
            />
          </div>
          <div class="space-y-2">
            <Label for="edit-email">Email</Label>
            <Input
              id="edit-email"
              type="email"
              v-model="currentProvider.providerEmail"
              required
            />
          </div>
          <div class="space-y-2">
            <Label for="edit-phoneNumber">Phone Number</Label>
            <Input
              id="edit-phoneNumber"
              v-model="currentProvider.providerPhoneNumber"
              required
            />
          </div>
          <div class="space-y-2">
            <Label for="edit-address">Address</Label>
            <Textarea
              id="edit-address"
              v-model="currentProvider.providerAddress"
            />
          </div>
          <div class="space-y-2">
            <Label for="edit-status">Status</Label>
            <Select v-model="currentProvider.providerStatus">
              <SelectTrigger>
                <SelectValue placeholder="Select provider status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem v-for="option in statusOptions" :key="option.value" :value="option.value">
                  {{ option.label }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div v-if="!statusOptions.some(option => option.value === currentProvider.providerStatus) || currentProvider.providerStatus === 'Custom'" class="space-y-2">
            <Label for="edit-customStatus">Custom Status</Label>
            <Input
              id="edit-customStatus"
              v-model="currentProvider.providerStatus"
              required
            />
          </div>
          <div class="space-y-2">
            <Label for="edit-description">Description</Label>
            <Textarea
              id="edit-description"
              v-model="currentProvider.providerDescription"
            />
          </div>
          <DialogFooter>
            <Button type="submit">Save Changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>

    <!-- Provider Info Modal -->
    <Dialog v-model:open="isInfoModalOpen">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Provider Information</DialogTitle>
        </DialogHeader>
        <div class="space-y-4">
          <div>
            <Label class="font-bold">Name:</Label>
            <p>{{ currentProvider.providerName }}</p>
          </div>
          <div>
            <Label class="font-bold">Email:</Label>
            <p>{{ currentProvider.providerEmail }}</p>
          </div>
          <div>
            <Label class="font-bold">Phone Number:</Label>
            <p>{{ currentProvider.providerPhoneNumber }}</p>
          </div>
          <div>
            <Label class="font-bold">Address:</Label>
            <p>{{ currentProvider.providerAddress || 'N/A' }}</p>
          </div>
          <div>
            <Label class="font-bold">Status:</Label>
            <p>{{ currentProvider.providerStatus }}</p>
          </div>
          <div>
            <Label class="font-bold">Description:</Label>
            <p>{{ currentProvider.providerDescription || 'N/A' }}</p>
          </div>
          <div>
            <Label class="font-bold">Created At:</Label>
            <p>{{ new Date(currentProvider.createAt).toLocaleString() }}</p>
          </div>
          <div>
            <Label class="font-bold">Updated At:</Label>
            <p>{{ new Date(currentProvider.updateAt).toLocaleString() }}</p>
          </div>
        </div>
        <DialogFooter>
          <Button @click="isInfoModalOpen = false">Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>
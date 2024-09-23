<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { PlusIcon, PencilIcon, Trash2Icon, ChevronLeftIcon, ChevronRightIcon } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useProviderStore } from './pinia/provider.store'

const ProviderStore = useProviderStore()

const isAddModalOpen = ref(false)
const isEditModalOpen = ref(false)
const currentProvider = ref({ id: '', providerName: '', providerDescription: '' })
const newProvider = ref({ providerName: '', providerDescription: '' })

onMounted(() => {
  ProviderStore.fetchProviders(1)
})

const addProvider = async () => {
  await ProviderStore.addProvider(newProvider.value)
  isAddModalOpen.value = false
  newProvider.value = { providerName: '', providerDescription: '' }
}

const openEditModal = (provider: { id: string; providerName: string; providerDescription: string }) => {
  currentProvider.value = { ...provider }
  isEditModalOpen.value = true
}

const editProvider = async () => {
  await ProviderStore.updateProvider(currentProvider.value)
  isEditModalOpen.value = false
}

const deleteProvider = async (id: string) => {
  await ProviderStore.deleteProvider(id)
}

const pageNumbers = computed(() => {
  const totalPages = ProviderStore.totalPages
  const currentPage = ProviderStore.currentPage
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
  ProviderStore.fetchProviders(page)
}
</script>

<template>
  <div class="h-full w-full bg-gray-50 overflow-auto p-6">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold">Provider</h1>
      <Button @click="isAddModalOpen = true" size="sm">
        <PlusIcon class="mr-2 h-4 w-4" /> Add Provider
      </Button>
    </div>

    <div class="bg-white shadow-md rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Description</TableHead>
            <TableHead class="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-for="provider in ProviderStore.providers" :key="provider.id">
            <TableCell class="font-medium">{{ provider.providerName }}</TableCell>
            <TableCell>{{ provider.providerDescription }}</TableCell>
            <TableCell class="text-right">
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
        Showing {{ (ProviderStore.currentPage - 1) * 5 + 1 }} to {{ Math.min(ProviderStore.currentPage * 5, ProviderStore.totalItems) }} of {{ ProviderStore.totalItems }} entries
      </div>
      <div class="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          @click="goToPage(ProviderStore.currentPage - 1)"
          :disabled="ProviderStore.currentPage === 1"
        >
          <ChevronLeftIcon class="h-4 w-4" />
        </Button>
        <Button
          v-for="page in pageNumbers"
          :key="page"
          variant="outline"
          size="sm"
          :class="{ 'bg-primary text-primary-foreground': page === ProviderStore.currentPage }"
          @click="typeof page === 'number' ? goToPage(page) : null"
          :disabled="typeof page !== 'number'"
        >
          {{ page }}
        </Button>
        <Button
          variant="outline"
          size="sm"
          @click="goToPage(ProviderStore.currentPage + 1)"
          :disabled="ProviderStore.currentPage === ProviderStore.totalPages"
        >
          <ChevronRightIcon class="h-4 w-4" />
        </Button>
      </div>
    </div>

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
            <Label for="description">Description</Label>
            <Textarea
              id="description"
              v-model="newProvider.providerDescription"
              required
            />
          </div>
          <DialogFooter>
            <Button type="submit">Add Provider</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>

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
            <Label for="edit-description">Description</Label>
            <Textarea
              id="edit-description"
              v-model="currentProvider.providerDescription"
              required
            />
          </div>
          <DialogFooter>
            <Button type="submit">Save Changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  </div>
</template>
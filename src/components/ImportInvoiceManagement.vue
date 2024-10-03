<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { PlusIcon, PencilIcon, Trash2Icon, ChevronLeftIcon, ChevronRightIcon, InfoIcon, ChevronUpIcon, ChevronDownIcon } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useImportInvoiceStore } from './pinia/importInvoice.store'

const importInvoiceStore = useImportInvoiceStore()

const isAddModalOpen = ref(false)
const isInfoModalOpen = ref(false)
const currentImportInvoice = ref<any>(null)
const newImportInvoice = ref({
  providerId: '',
  employeeId: '',
  importInvoiceDetails: [{ ingredientId: '', quantity: 0, price: 0, total: 0 }]
})

const sortColumn = ref('importDate')
const sortOrder = ref<'asc' | 'desc'>('desc')

onMounted(async () => {
  await importInvoiceStore.fetchEmployees()
  await importInvoiceStore.fetchProviders()
  await importInvoiceStore.fetchIngredients()
  await importInvoiceStore.fetchImportInvoices(1)
})

const employeeNames = computed(() => {
  console.log("I loaded")
  console.log(importInvoiceStore.employees)
  return importInvoiceStore.employees.map(employee => ({
    id: employee.id,
    name: employee.person.name
  }))
})

const addImportInvoice = async () => {
  const invoiceData = {
    providerId: newImportInvoice.value.providerId,
    employeeId: newImportInvoice.value.employeeId,
    importInvoiceDetails: newImportInvoice.value.importInvoiceDetails.map(detail => ({
      ingredientId: detail.ingredientId,
      quantity: detail.quantity,
      price: detail.price,
      total: detail.total
    }))
  };
  await importInvoiceStore.addImportInvoice(invoiceData);
  isAddModalOpen.value = false
  resetNewImportInvoice()
}

const openInfoModal = (importInvoice: any) => {
  currentImportInvoice.value = importInvoice
  isInfoModalOpen.value = true
}

const deleteImportInvoice = async (id: string) => {
  await importInvoiceStore.deleteImportInvoice(id)
}

const resetNewImportInvoice = () => {
  newImportInvoice.value = {
    providerId: '',
    employeeId: '',
    importInvoiceDetails: [{ ingredientId: '', quantity: 0, price: 0, total: 0 }]
  }
}

const addLineItem = () => {
  newImportInvoice.value.importInvoiceDetails.push({ ingredientId: '', quantity: 0, price: 0, total: 0 })
}

const removeLineItem = (index: number) => {
  newImportInvoice.value.importInvoiceDetails.splice(index, 1)
}

const updateLineItemTotal = (index: number) => {
  const item = newImportInvoice.value.importInvoiceDetails[index]
  item.total = item.quantity * item.price
}

const invoiceTotal = computed(() => {
  return newImportInvoice.value.importInvoiceDetails.reduce((acc, item) => acc + item.total, 0).toFixed(2)
})

const pageNumbers = computed(() => {
  const totalPages = importInvoiceStore.totalPages
  const currentPage = importInvoiceStore.currentPage
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
  importInvoiceStore.fetchImportInvoices(page)
}

const sortTable = (column: string) => {
  if (sortColumn.value === column) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortColumn.value = column
    sortOrder.value = 'asc'
  }
  importInvoiceStore.fetchImportInvoices(1, sortColumn.value, sortOrder.value)
}

const getSortIcon = (column: string) => {
  if (sortColumn.value !== column) return null
  return sortOrder.value === 'asc' ? ChevronUpIcon : ChevronDownIcon
}
</script>

<template>
  <div class="h-full w-full bg-gray-50 overflow-auto p-6">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold">Import Invoices</h1>
      <Button @click="isAddModalOpen = true" size="sm">
        <PlusIcon class="mr-2 h-4 w-4" /> Add Import Invoice
      </Button>
    </div>

    <div class="bg-white shadow-md rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead @click="sortTable('importDate')" class="cursor-pointer">
              <div class="flex items-center justify-between">
                <span>Date</span>
                <component 
                  :is="getSortIcon('importDate') || 'div'" 
                  class="w-4 h-4 ml-2"
                  :class="{'text-transparent': !getSortIcon('importDate')}"
                />
              </div>
            </TableHead>
            <TableHead @click="sortTable('Provider.providerName')" class="cursor-pointer">
              <div class="flex items-center justify-between">
                <span>Provider</span>
                <component 
                  :is="getSortIcon('Provider.providerName') || 'div'" 
                  class="w-4 h-4 ml-2"
                  :class="{'text-transparent': !getSortIcon('Provider.providerName')}"
                />
              </div>
            </TableHead>
            <TableHead @click="sortTable('totalExpense')" class="cursor-pointer">
              <div class="flex items-center justify-between">
                <span>Total</span>
                <component 
                  :is="getSortIcon('totalExpense') || 'div'" 
                  class="w-4 h-4 ml-2"
                  :class="{'text-transparent': !getSortIcon('totalExpense')}"
                />
              </div>
            </TableHead>
            <TableHead class="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-for="invoice in importInvoiceStore.importInvoices" :key="invoice.id">
            <TableCell>{{ new Date(invoice.importDate).toLocaleDateString() }}</TableCell>
            <TableCell>{{ invoice.Provider.providerName }}</TableCell>
            <TableCell>${{ invoice.totalExpense.toFixed(2) }}</TableCell>
            <TableCell class="text-right">
              <Button
                variant="ghost"
                size="icon"
                @click="openInfoModal(invoice)"
              >
                <InfoIcon class="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                @click="deleteImportInvoice(invoice.id)"
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
        Showing {{ (importInvoiceStore.currentPage - 1) * 5 + 1 }} to {{ Math.min(importInvoiceStore.currentPage * 5, importInvoiceStore.totalItems) }} of {{ importInvoiceStore.totalItems }} entries
      </div>
      <div class="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          @click="goToPage(importInvoiceStore.currentPage - 1)"
          :disabled="importInvoiceStore.currentPage === 1"
        >
          <ChevronLeftIcon class="h-4 w-4" />
        </Button>
        <Button
          v-for="page in pageNumbers"
          :key="page"
          variant="outline"
          size="sm"
          :class="{ 'bg-primary text-primary-foreground': page === importInvoiceStore.currentPage }"
          @click="typeof page === 'number' ? goToPage(page) : null"
          :disabled="typeof page !== 'number'"
        >
          {{ page }}
        </Button>
        <Button
          variant="outline"
          size="sm"
          @click="goToPage(importInvoiceStore.currentPage + 1)"
          :disabled="importInvoiceStore.currentPage === importInvoiceStore.totalPages"
        >
          <ChevronRightIcon class="h-4 w-4" />
        </Button>
      </div>
    </div>

    <!-- Add Import Invoice Modal -->
    <Dialog v-model:open="isAddModalOpen">
      <DialogContent class="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>Add Import Invoice</DialogTitle>
          <DialogDescription>Enter the details for the new import invoice.</DialogDescription>
        </DialogHeader>
        <form @submit.prevent="addImportInvoice" class="space-y-4">
          <div class="grid grid-cols-2 gap-6">
            <div>
              <Label for="provider">Provider</Label>
              <Select v-model="newImportInvoice.providerId">
                <SelectTrigger>
                  <SelectValue placeholder="Select provider" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem v-for="provider in importInvoiceStore.providers" :key="provider.id" :value="provider.id">
                    {{ provider.providerName }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label for="employee">Employee</Label>
              <Select v-model="newImportInvoice.employeeId">
                <SelectTrigger>
                  <SelectValue placeholder="Select employee" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem 
                    v-for="employee in employeeNames" 
                    :key="employee.id" 
                    :value="employee.id"
                  >
                    {{ employee.name }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <!-- Scrollable Line items list -->
          <div class="max-h-[300px] overflow-y-auto border rounded-md">
            <Table>
              <TableHeader class="sticky top-0 bg-white z-10">
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Unit Price</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead class="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow v-for="(item, index) in newImportInvoice.importInvoiceDetails" :key="index">
                  <TableCell>
                    <Select v-model="item.ingredientId">
                      <SelectTrigger>
                        <SelectValue placeholder="Select ingredient" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem v-for="ingredient in importInvoiceStore.ingredients" :key="ingredient.id" :value="ingredient.id">
                          {{ ingredient.ingredientName }}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Input type="number" v-model="item.quantity" @input="updateLineItemTotal(index)" />
                  </TableCell>
                  <TableCell>
                    <Input type="number" v-model="item.price" @input="updateLineItemTotal(index)" />
                  </TableCell>
                  <TableCell>${{ item.total.toFixed(2) }}</TableCell>
                  <TableCell class="text-right">
                    <Button variant="outline" size="icon" @click.prevent="removeLineItem(index)">
                      <Trash2Icon class="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
          <div class="flex justify-between items-center">
            <Button @click.prevent="addLineItem">
              <PlusIcon class="h-4 w-4 mr-2" />
              Add Item
            </Button>
            <div class="text-right">
              <span class="font-bold">Total: ${{ invoiceTotal }}</span>
            </div>
          </div>

          <DialogFooter>
            <Button type="submit">Submit</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>

    <!-- Import Invoice Info Modal -->
    <Dialog v-model:open="isInfoModalOpen">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Import Invoice Information</DialogTitle>
        </DialogHeader>
        <div v-if="currentImportInvoice" class="space-y-4">
          <div>
            <Label class="font-bold">Date:</Label>
            <p>{{ new Date(currentImportInvoice.importDate).toLocaleString() }}</p>
          </div>
          <div>
            <Label class="font-bold">Provider:</Label>
            <p>{{ currentImportInvoice.Provider.providerName }}</p>
          </div>
          <div>
            <Label class="font-bold">Employee:</Label>
            <p>{{ currentImportInvoice.Employee.person.name }}</p>
          </div>
          <div>
            <Label class="font-bold">Total Expense:</Label>
            <p>${{ currentImportInvoice.totalExpense.toFixed(2) }}</p>
          </div>
          <div>
            <Label class="font-bold">Imported Ingredients:</Label>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ingredient</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Total Expense</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow v-for="detail in currentImportInvoice.importInvoiceDetail" :key="detail.id">
                  <TableCell>{{ detail.ingredient.ingredientName }}</TableCell>
                  <TableCell>{{ detail.quantity }}</TableCell>
                  <TableCell>${{ detail.totalExpense.toFixed(2) }}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </div>
        <DialogFooter>
          <Button @click="isInfoModalOpen = false">Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>
<template>
  <div class="w-full max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
    <div class="mb-6 flex justify-between items-center">
      <h1 class="text-2xl font-bold">Import Invoices</h1>
      <Button @click="openDialog">Add Import Invoice</Button>
    </div>

    <!-- Display list of import invoices -->
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>ID</TableHead>
          <TableHead>Provider</TableHead>
          <TableHead>Employee</TableHead>
          <TableHead>Total</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow v-for="invoice in invoices" :key="invoice.id">
          <TableCell>{{ invoice.id }}</TableCell>
          <TableCell>{{ invoice.provider }}</TableCell>
          <TableCell>{{ invoice.employee }}</TableCell>
          <TableCell>${{ invoice.total.toFixed(2) }}</TableCell>
        </TableRow>
      </TableBody>
    </Table>

    <!-- Import Invoice Dialog -->
    <Dialog :open="isDialogOpen" @update:open="isDialogOpen = $event">
      <DialogContent class="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>Add Import Invoice</DialogTitle>
          <DialogDescription>Enter the details for the new import invoice.</DialogDescription>
        </DialogHeader>
        <Button variant="ghost" class="absolute top-2 right-2" @click.prevent="closeDialog">
        </Button>

        <!-- Import invoice form -->
        <div class="space-y-4">
          <form @submit.prevent="addImportInvoice" class="space-y-4">
          <div class="grid grid-cols-2 gap-6">
            <div>
              <Label for="provider">Provider</Label>
              <Select v-model="newImportInvoice.providerId">
                <SelectTrigger>
                  <SelectValue placeholder="Select provider" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem v-for="provider in ImportInvoiceStore.providers" :key="provider.id" :value="provider.id">
                  {{ provider.providerName}}
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
                  <SelectItem v-for="employee in ImportInvoiceStore.employees" :key="employee.id" :value="employee.id">
                  {{ employee.id}}
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
                <TableRow v-for="(item, index) in newImportInvoice  .importInvoiceDetails" :key="index">
                <TableCell>
                <Select v-model="item.ingredientId">
                  <SelectTrigger>
                  <SelectValue placeholder="Select ingredient" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem v-for="ingredient in ImportInvoiceStore.ingredients" :key="ingredient.id" :value="ingredient.id">
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
      <TrashIcon class="h-4 w-4" />
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

          <div class="mt-8 flex justify-end">
            <Button type="submit">Submit</Button>
          </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Import, PlusIcon, TrashIcon, XIcon } from 'lucide-vue-next'
import { useImportInvoiceStore } from './pinia/importInvoice.store'
const ImportInvoiceStore = useImportInvoiceStore()
const isDialogOpen = ref(false)
const newImportInvoice= ref({
  providerId: '',
  employeeId: '',
  importInvoiceDetails: [{ ingredientId: '', quantity: 0, price: 0, total: 0 }]


})
onMounted(async () => {
  try {
    await ImportInvoiceStore.fetchEmployees()
    await ImportInvoiceStore.fetchProviders()
    await ImportInvoiceStore.fetchIngredients()
    await ImportInvoiceStore.fetchImportInvoices(1)
    console.log(ImportInvoiceStore.importInvoices)
  } catch (error) {
    console.error('Error in mounted hook:', error)
  }
})
const openDialog = () => {
  isDialogOpen.value = true
}

const closeDialog = () => {
  isDialogOpen.value = false
  resetNewImportInvoice()
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

const removeLineItem = (index) => {
  newImportInvoice.value.importInvoiceDetails.splice(index, 1)
}

const updateLineItemTotal = (index) => {
  const item = newImportInvoice.value.importInvoiceDetails[index]
  item.total = item.quantity * item.price
}

const invoiceTotal = computed(() => {
  return newImportInvoice.value.importInvoiceDetails.reduce((acc, item) => acc + item.total, 0).toFixed(2)
})

const addImportInvoice = async () => {
  console.log(newImportInvoice.value)
  const result = await ImportInvoiceStore.addImportInvoice(newImportInvoice.value)
  isDialogOpen.value=false
  }
</script>
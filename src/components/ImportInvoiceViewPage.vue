<template>
    <Dialog :open="isOpen" @update:open="isOpen = $event">
      <DialogTrigger as-child>
        <Button variant="outline">Import Invoice</Button>
      </DialogTrigger>
      <DialogContent class="sm:max-w-[800px]">
        <DialogHeader>
          <div class="flex justify-between items-center">
            <DialogTitle>Import Invoice</DialogTitle>
            <div class="flex space-x-2">
              <Button variant="outline" size="icon" @click="handleEdit">
                <Edit v-if="!isEditing" class="h-4 w-4" />
                <Check v-else class="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon">
                <Trash2 class="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon">
                <Printer class="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>
        <div class="grid gap-4 py-4">
          <div class="grid grid-cols-4 items-center gap-4">
            <Label for="provider" class="text-right">Provider</Label>
            <Input id="provider" v-model="provider" :disabled="!isEditing" class="col-span-3" />
          </div>
          <div class="grid grid-cols-4 items-center gap-4">
            <Label for="employee" class="text-right">Employee</Label>
            <Input id="employee" v-model="employee" :disabled="!isEditing" class="col-span-3" />
          </div>
        </div>
        <div v-if="isEditing" class="mb-4">
          <Button @click="showNewIngredientForm = true">
            <Plus class="h-4 w-4 mr-2" /> Add New Ingredient
          </Button>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ingredient</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Price</TableHead>
              <TableHead v-if="isEditing">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-for="ingredient in ingredients" :key="ingredient.id">
              <TableCell>
                <Input v-if="isEditing" v-model="ingredient.name" />
                <span v-else>{{ ingredient.name }}</span>
              </TableCell>
              <TableCell>
                <Input v-if="isEditing" v-model="ingredient.quantity" />
                <span v-else>{{ ingredient.quantity }}</span>
              </TableCell>
              <TableCell>
                <Input v-if="isEditing" v-model="ingredient.price" />
                <span v-else>{{ ingredient.price }}</span>
              </TableCell>
              <TableCell v-if="isEditing">
                <Button variant="ghost" size="sm" @click="deleteIngredient(ingredient.id)">
                  <X class="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
            <TableRow v-if="showNewIngredientForm && isEditing">
              <TableCell>
                <Input v-model="newIngredient.name" placeholder="New ingredient" />
              </TableCell>
              <TableCell>
                <Input v-model="newIngredient.quantity" placeholder="Quantity" />
              </TableCell>
              <TableCell>
                <Input v-model="newIngredient.price" placeholder="Price" />
              </TableCell>
              <TableCell>
                <Button variant="ghost" size="sm" @click="addIngredient">
                  <Plus class="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
        <div v-if="isEditing" class="mt-4 flex justify-end">
          <Button @click="handleSave">Save Changes</Button>
        </div>
      </DialogContent>
    </Dialog>
  </template>
  
  <script setup>
  import { ref, reactive } from 'vue'
  import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
  import { Button } from '@/components/ui/button'
  import { Input } from '@/components/ui/input'
  import { Label } from '@/components/ui/label'
  import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
  import { Edit, Trash2, Printer, Plus, Check, X } from 'lucide-vue-next'
  
  const isOpen = ref(false)
  const isEditing = ref(false)
  const showNewIngredientForm = ref(false)
  const provider = ref('')
  const employee = ref('')
  const ingredients = ref([
    { id: 1, name: "Flour", quantity: "2 kg", price: "$4.00" },
    { id: 2, name: "Sugar", quantity: "1 kg", price: "$2.50" },
    { id: 3, name: "Eggs", quantity: "12", price: "$3.00" },
  ])
  const newIngredient = reactive({ name: "", quantity: "", price: "" })
  
  const handleEdit = () => {
    isEditing.value = !isEditing.value
    if (!isEditing.value) {
      showNewIngredientForm.value = false
    }
  }
  
  const handleSave = () => {
    isEditing.value = false
    showNewIngredientForm.value = false
    // Here you would typically save the changes to your backend
  }
  
  const addIngredient = () => {
    if (newIngredient.name && newIngredient.quantity && newIngredient.price) {
      ingredients.value.push({
        id: Date.now(),
        name: newIngredient.name,
        quantity: newIngredient.quantity,
        price: newIngredient.price
      })
      newIngredient.name = ""
      newIngredient.quantity = ""
      newIngredient.price = ""
      showNewIngredientForm.value = false
    }
  }
  
  const deleteIngredient = (id) => {
    ingredients.value = ingredients.value.filter(ingredient => ingredient.id !== id)
  }
  </script>
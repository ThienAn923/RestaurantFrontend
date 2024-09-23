<template>
  <div class="p-4 space-y-4">
    <Input
      v-model="searchTerm"
      placeholder="Search users..."
      class="max-w-sm mb-4"
    />
    <div class="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead class="w-[100px]">
              <Button variant="ghost" @click="changeSort('id')">
                UserID <ChevronsUpDown class="ml-2 h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead>
              <Button variant="ghost" @click="changeSort('name')">
                Name <ChevronsUpDown class="ml-2 h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead>
              <Button variant="ghost" @click="changeSort('address')">
                Address <ChevronsUpDown class="ml-2 h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead>
              <Button variant="ghost" @click="changeSort('email')">
                Email <ChevronsUpDown class="ml-2 h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead>
              <Button variant="ghost" @click="changeSort('role')">
                Role <ChevronsUpDown class="ml-2 h-4 w-4" />
              </Button>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-for="user in paginatedData" :key="user.id">
            <TableCell class="font-medium">{{ user.id }}</TableCell>
            <TableCell>{{ user.name }}</TableCell>
            <TableCell>{{ user.address }}</TableCell>
            <TableCell>{{ user.email }}</TableCell>
            <TableCell>{{ user.role }}</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
    <div class="flex items-center justify-end space-x-2 py-4">
      <Button
        variant="outline"
        size="sm"
        @click="prevPage"
        :disabled="currentPage === 1"
      >
        <ChevronLeft class="h-4 w-4" />
        Previous
      </Button>
      <Button
        variant="outline"
        size="sm"
        @click="nextPage"
        :disabled="currentPage === totalPages"
      >
        Next
        <ChevronRight class="h-4 w-4" />
      </Button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ChevronLeft, ChevronRight, ChevronsUpDown } from 'lucide-vue-next'

interface User {
  id: number
  name: string
  address: string
  email: string
  role: string
}

// Mock data for demonstration
const users: User[] = [
  { id: 1, name: "John Doe", address: "123 Main St, City, Country", email: "john@example.com", role: "Admin" },
  { id: 2, name: "Jane Smith", address: "456 Elm St, Town, Country", email: "jane@example.com", role: "User" },
  { id: 3, name: "Bob Johnson", address: "789 Oak St, Village, Country", email: "bob@example.com", role: "Manager" },
  { id: 4, name: "Alice Brown", address: "101 Pine St, Hamlet, Country", email: "alice@example.com", role: "User" },
  { id: 5, name: "Charlie Davis", address: "202 Maple St, Borough, Country", email: "charlie@example.com", role: "User" },
]

const sortKey = ref<keyof User>('id')
const sortOrder = ref<'asc' | 'desc'>('asc')
const searchTerm = ref('')
const currentPage = ref(1)
const itemsPerPage = 3

const sortedData = computed(() => {
  return [...users].sort((a, b) => {
    if (a[sortKey.value] < b[sortKey.value]) return sortOrder.value === 'asc' ? -1 : 1
    if (a[sortKey.value] > b[sortKey.value]) return sortOrder.value === 'asc' ? 1 : -1
    return 0
  })
})

const filteredData = computed(() => {
  return sortedData.value.filter(user => 
    Object.values(user).some(value => 
      value.toString().toLowerCase().includes(searchTerm.value.toLowerCase())
    )
  )
})

const totalPages = computed(() => Math.ceil(filteredData.value.length / itemsPerPage))

const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return filteredData.value.slice(start, end)
})

function changeSort(key: keyof User) {
  if (sortKey.value === key) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortKey.value = key
    sortOrder.value = 'asc'
  }
}

function prevPage() {
  if (currentPage.value > 1) {
    currentPage.value--
  }
}

function nextPage() {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
  }
}
</script>
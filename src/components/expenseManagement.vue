<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { PlusIcon, PencilIcon, Trash2Icon, ChevronLeftIcon, ChevronRightIcon, ChevronUpIcon, ChevronDownIcon, SearchIcon } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useExpenseStore } from './pinia/expense.store'
import { formatCurrency } from '@/lib/formatMoney'
import { format } from 'path'

const expenseStore = useExpenseStore()

interface Expense {
    id: string
    expenseName: string
    expenseDescription: string
    expenseMoney: number
    createAt: Date
    updateAt?: Date
}
interface ExpenseWithoutMetaData {
    expenseName: string
    expenseDescription: string
    expenseMoney: number
}

const isAddModalOpen = ref(false)
const isEditModalOpen = ref(false)
const currentExpense = ref<Expense>({ id: '', expenseName: '', expenseDescription: '', expenseMoney: 0, createAt: new Date(), updateAt: new Date() })
const newExpense = ref<ExpenseWithoutMetaData>({ expenseName: '', expenseDescription: '', expenseMoney: 0 })
const sortColumn = ref('createAt')
const sortOrder = ref<'asc' | 'desc'>('asc')
const searchQuery = ref('')

onMounted(() => {
    expenseStore.fetchExpenses(1)
})

const addExpense = async () => {
    await expenseStore.createExpense(newExpense.value)
    isAddModalOpen.value = false
    newExpense.value = { expenseName: '', expenseDescription: '', expenseMoney: 0 } //reset
}

const openEditModal = (Expense: { id: string, expenseName: string, expenseDescription: string | undefined, expenseMoney: number, createAt: Date }) => {
    currentExpense.value = { ...Expense }
    isEditModalOpen.value = true
}

const editExpense = async () => {
    const { id, createAt, ...expense } = currentExpense.value //because it only need as below
    await expenseStore.updateExpense(id, expense)

    //update the currentExpense in the store without fetching the data again
    const index = expenseStore.expenses.findIndex(e => e.id === id);
    if (index !== -1) {
        expenseStore.expenses[index] = { ...expense, id, createAt, updateAt: new Date() };
    }
    isEditModalOpen.value = false
}

const deleteExpense = async (id: string) => {
    await expenseStore.deleteExpense(id);
    // Remove the deleted expense from the local state
    expenseStore.expenses = expenseStore.expenses.filter(e => e.id !== id);
}

const pageNumbers = computed(() => {
    const totalPages = expenseStore.totalPages
    const currentPage = expenseStore.currentPage
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

const sortTable = (column: string) => {
    if (sortColumn.value === column) {
        sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
    } else {
        sortColumn.value = column
        sortOrder.value = 'asc'
    }
    expenseStore.setSorting(sortColumn.value, sortOrder.value)
    expenseStore.fetchExpenses(1)
}

const getSortIcon = (column: string) => {
    if (sortColumn.value !== column) return null
    return sortOrder.value === 'asc' ? ChevronUpIcon : ChevronDownIcon
}

const resetFilters = () => {
    searchQuery.value = ''
}

watch([searchQuery], () => {
    // alert(searchQuery.value)
    console.log("Running testing watch from expenseManagement.vue");
    expenseStore.setSearch(searchQuery.value);
    expenseStore.fetchExpenses(1)
})

const goToPage = (page: number) => {
    expenseStore.fetchExpenses(page)
}

// const formatInputCurrency = (event: Event) => {
//     const input = event.target as HTMLInputElement;
//     const selectionStart = input.selectionStart;
//     const value = parseFloat(input.value.replace(/\./g, '').replace(' vnđ', ''));
//     if (!isNaN(value)) {
//         currentExpense.value.expenseMoney = value;
//         input.value = formatCurrency(value);
//         if (selectionStart !== null) {
//             input.setSelectionRange(selectionStart, selectionStart);
//         }
//     } else {
//         input.value = '';
//     }
// };

</script>

<template>
    <div class="h-full w-full bg-gray-50 overflow-auto p-6">
        <div class="flex justify-between items-center mb-6">
            <h1 class="text-3xl font-bold">Quản Lý Chi Tiêu</h1>
            <Button @click="isAddModalOpen = true" size="sm" class="bg-blue-500 hover:bg-blue-600 text-white">
                <PlusIcon class="mr-2 h-4 w-4" /> Thêm Chi Tiêu
            </Button>
        </div>

        <div class="mb-4 flex space-x-4">
            <div class="relative flex-grow">
                <Input v-model="searchQuery" placeholder="Tìm kiếm theo tên" class="pl-10" />
                <SearchIcon class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            </div>
            <Button @click="resetFilters" variant="outline">Reset Bộ Lọc</Button>
        </div>

        <div class="bg-white shadow-md rounded-lg overflow-hidden">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead @click="sortTable('expenseName')" class="cursor-pointer">
                            <div class="flex items-center justify-between">
                                <span>Chi Tiêu</span>
                                <component :is="getSortIcon('expenseName') || 'div'" class="w-4 h-4 ml-2"
                                    :class="{ 'text-transparent': !getSortIcon('expenseName') }" />
                            </div>
                        </TableHead>
                        <TableHead @click="sortTable('expenseDescription')" class="cursor-pointer">
                            <div class="flex items-center justify-between">
                                <span>Mô Tả Chi Tiết</span>
                                <component :is="getSortIcon('expenseDescription') || 'div'" class="w-4 h-4 ml-2"
                                    :class="{ 'text-transparent': !getSortIcon('expenseDescription') }" />
                            </div>
                        </TableHead>
                        <TableHead @click="sortTable('expenseMoney')" class="cursor-pointer">
                            <div class="flex items-center justify-end">
                                <span>Số Tiền</span>
                                <component :is="getSortIcon('expenseMoney') || 'div'" class="w-4 h-4 ml-2"
                                    :class="{ 'text-transparent': !getSortIcon('expenseMoney') }" />
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
                    <TableRow v-for="expense in expenseStore.expenses" :key="expense.id">
                        <TableCell class="font-medium">{{ expense.expenseName }}</TableCell>
                        <TableCell class="w-3/6">{{ expense.expenseDescription }}</TableCell>
                        <TableCell class="text-right">{{ formatCurrency(expense.expenseMoney) }}</TableCell>
                        <TableCell>{{ new Date(expense.createAt).toLocaleString() }}</TableCell>
                        <TableCell class="text-right">
                            <Button variant="ghost" size="icon" @click="openEditModal(expense)"
                                class="text-blue-600 hover:text-blue-600 hover:bg-blue-100">
                                <PencilIcon class="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" @click="deleteExpense(expense.id)"
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
                Đang xem từ {{ (expenseStore.currentPage - 1) * 5 + 1 }} đến {{
                    Math.min(expenseStore.currentPage * 5,
                        expenseStore.totalItems) }} trong tổng số {{ expenseStore.totalItems }} chi tiêu
            </div>
            <div class="flex items-center space-x-2">
                <Button variant="outline" size="sm" @click="goToPage(expenseStore.currentPage - 1)"
                    :disabled="expenseStore.currentPage === 1"
                    class="text-gray-700 hover:bg-gray-100 disabled:opacity-50">
                    <ChevronLeftIcon class="h-4 w-4" />
                </Button>
                <Button v-for="page in pageNumbers" :key="page" variant="outline" size="sm"
                    :class="{ 'bg-blue-500 text-white': page === expenseStore.currentPage, 'text-gray-700 hover:bg-gray-100': page !== expenseStore.currentPage }"
                    @click="typeof page === 'number' ? goToPage(page) : null" :disabled="typeof page !== 'number'">
                    {{ page }}
                </Button>
                <Button variant="outline" size="sm" @click="goToPage(expenseStore.currentPage + 1)"
                    :disabled="expenseStore.currentPage === expenseStore.totalPages"
                    class="text-gray-700 hover:bg-gray-100 disabled:opacity-50">
                    <ChevronRightIcon class="h-4 w-4" />
                </Button>
            </div>
        </div>

        <Dialog v-model:open="isAddModalOpen">
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Thêm Chi Tiêu Mới</DialogTitle>
                    <DialogDescription>
                        Nhập thông tin cho chi tiêu mới.
                    </DialogDescription>
                </DialogHeader>
                <form @submit.prevent="addExpense" class="space-y-4">
                    <div class="space-y-2">
                        <Label for="name">Tên Chi Tiêu</Label>
                        <Input id="name" v-model="newExpense.expenseName" required />
                    </div>
                    <div class="space-y-2">
                        <Label for="description">Mô Tả Chi Tiết</Label>
                        <Textarea id="description" v-model="newExpense.expenseDescription" required />
                    </div>
                    <div class="space-y-2">
                        <Label for="money">Số tiền</Label>
                        <Input id="money" v-model="newExpense.expenseMoney" type="text" required
                            @input="formatInputCurrency" />
                    </div>
                    <DialogFooter>
                        <Button type="submit" class="bg-blue-500 hover:bg-blue-600 text-white">Thêm</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>

        <Dialog v-model:open="isEditModalOpen">
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Chỉnh Sửa Chi Tiêu</DialogTitle>
                    <DialogDescription>
                        Chỉnh sửa thông tin chi tiêu.
                    </DialogDescription>
                </DialogHeader>
                <form @submit.prevent="editExpense" class="space-y-4">
                    <div class="space-y-2">
                        <Label for="edit-name">Tên Chi Tiêu</Label>
                        <Input id="edit-name" v-model="currentExpense.expenseName" required />
                    </div>
                    <div class="space-y-2">
                        <Label for="edit-description">Mô Tả Chi Tiết</Label>
                        <Textarea id="edit-description" v-model="currentExpense.expenseDescription" required />
                    </div>
                    <div class="space-y-2">
                        <Label for="money">Số tiền</Label>
                        <Input id="money" v-model="currentExpense.expenseMoney" type="number" required
                            @input="formatCurrency" />
                    </div>
                    <DialogFooter>
                        <Button type="submit">Lưu</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    </div>
</template>
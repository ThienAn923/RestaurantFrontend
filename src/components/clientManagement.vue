<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { ChevronLeftIcon, ChevronRightIcon, ChevronUpIcon, ChevronDownIcon, SearchIcon, LockIcon, UnlockIcon } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useClientStore } from './pinia/client.store'
import { useToast } from 'vue-toastification'




const { toast } = useToast()
const clientStore = useClientStore();
interface Account {
    id: string;
    accountUsername: string;
    accountPassword: string;
    AccountAuthority: number;
    AccountAvatar: string | null;
    personId: string;
    isDeleted: boolean;
    updateAt: string;
    createAt: string;
    isVerified: boolean;
    verificationToken: string;
    tokenExpiresAt: string;
}

interface Person {
    id: string;
    name: string;
    profilePicture: string;
    isDeleted: boolean;
    updateAt: string;
    createAt: string;
    employeeId: string | null;
    clientId: string;
    account: Account[];
}

interface Client {
    id: string;
    point: number;
    personId: string;
    email: string;
    phoneNumber: string | null;
    gender: boolean;
    isDeleted: boolean;
    updateAt: string;
    createAt: string;
    person: Person;
}

const sortColumn = ref('createAt')
const sortOrder = ref<'asc' | 'desc'>('asc')
const searchQuery = ref('')

onMounted(async () => {
    await clientStore.fetchClients(1, 5);
})

const toVietnamese = (status: boolean) => {
    if (status === false) return 'Chưa Khóa'
    if (status === true) return 'Đã Khóa'
    return 'Không Xác Định'
}

const reason = ref('');
const banAccount = async (id: string) => {
    console.log(id);
    await clientStore.banAccount(id, reason.value)
    isDialogOpen.value = false;
    toast({
        title: 'Thành công',
        description: 'Đã ban tài khoản',
    });
}

const unban = async (id: string) => {
    await clientStore.unbanAccount(id)
}



const pageNumbers = computed(() => {
    const totalPages = clientStore.totalPages
    const currentPage = clientStore.currentPage
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
    clientStore.setSorting(sortColumn.value, sortOrder.value)
    clientStore.fetchClients(1, 5)
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
    clientStore.setSearch(searchQuery.value);
    clientStore.fetchClients(1, 5)
})

const goToPage = (page: number) => {
    clientStore.fetchClients(page, 5)
}


const isDialogOpen = ref(false);
const selectedClient = ref<Client | null>(null);
const openDialog = async (id: string) => {
    isDialogOpen.value = true;
    selectedClient.value = await clientStore.fetchClientById(id);
}

// watch(selectedClient, () => {
//     console.log(reason.value);
//     console.log(JSON.stringify(selectedClient.value));
// }, { immediate: true })


</script>

<template>
    <div class="h-full w-full bg-gray-50 overflow-auto p-6">
        <div class="flex justify-between items-center mb-6">
            <h1 class="text-3xl font-bold">Quản Lý Khách hàng</h1>
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
                        <TableHead @click="sortTable('clientName')" class="cursor-pointer">
                            <div class="flex items-center justify-between">
                                <span>Tên Khách Hàng</span>
                                <component :is="getSortIcon('clientName') || 'div'" class="w-4 h-4 ml-2"
                                    :class="{ 'text-transparent': !getSortIcon('clientName') }" />
                            </div>
                        </TableHead>
                        <TableHead @click="sortTable('createAt')" class="cursor-pointer">
                            <div class="flex items-center justify-between">
                                <span>Ngày Đăng Ký</span>
                                <component :is="getSortIcon('createAt') || 'div'" class="w-4 h-4 ml-2"
                                    :class="{ 'text-transparent': !getSortIcon('createAt') }" />
                            </div>
                        </TableHead>
                        <TableHead @click="sortTable('point')" class="cursor-pointer">
                            <div class="flex items-center justify-end">
                                <span>Số Điểm</span>
                                <component :is="getSortIcon('point') || 'div'" class="w-4 h-4 ml-2"
                                    :class="{ 'text-transparent': !getSortIcon('point') }" />
                            </div>
                        </TableHead>
                        <TableHead @click="sortTable('isLocked')" class="cursor-pointer">
                            <div class="flex items-center justify-between">
                                <span>Bị Khóa?</span>
                                <component :is="getSortIcon('isLocked') || 'div'" class="w-4 h-4 ml-2"
                                    :class="{ 'text-transparent': !getSortIcon('isLocked') }" />
                            </div>
                        </TableHead>
                        <TableHead class="cursor-pointer">
                            <div class="flex items-center justify-between">
                                <span>Lý Do Khóa:</span>

                            </div>
                        </TableHead>
                        <TableHead class="text-right"></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    <TableRow v-for="client in clientStore.clients" :key="client.id"
                        :class="{ 'bg-red-100': client.person.account[0]?.accountIsLocked }">
                        <TableCell class="font-medium">{{ client.person.name }}</TableCell>
                        <TableCell class="w-3/6">{{ client.createAt }}</TableCell>
                        <TableCell class="">{{ client.point }}</TableCell>
                        <TableCell>{{ toVietnamese(client.person.account[0]?.accountIsLocked) }}</TableCell>
                        <TableCell>{{ client.person.account[0]?.accountLockReason || "" }}</TableCell>
                        <TableCell class="text-right">
                            <Button v-if="client.person.account[0]?.accountIsLocked" @click="unban(client.id)"
                                variant="ghost" class="text-blue-500 hover:text-white hover:bg-blue-600">
                                <UnlockIcon class="h-4 w-4" />
                            </Button>
                            <Button v-else variant="ghost" size="icon" @click="openDialog(client.id)"
                                class="text-red-500 hover:text-white hover:bg-red-600">
                                <LockIcon class="h-4 w-4" />
                            </Button>
                        </TableCell>
                    </TableRow>
                </TableBody>
            </Table>
        </div>

        <!-- Pagination -->
        <div class="mt-4 flex items-center justify-between">
            <div class="text-sm text-gray-700">
                Đang xem từ {{ (clientStore.currentPage - 1) * 5 + 1 }} đến {{
                    Math.min(clientStore.currentPage * 5,
                        clientStore.totalItems) }} trong tổng số {{ clientStore.totalItems }} chi tiêu
            </div>
            <div class="flex items-center space-x-2">
                <Button variant="outline" size="sm" @click="goToPage(clientStore.currentPage - 1)"
                    :disabled="clientStore.currentPage === 1"
                    class="text-gray-700 hover:bg-gray-100 disabled:opacity-50">
                    <ChevronLeftIcon class="h-4 w-4" />
                </Button>
                <Button v-for="page in pageNumbers" :key="page" variant="outline" size="sm"
                    :class="{ 'bg-blue-500 text-white': page === clientStore.currentPage, 'text-gray-700 hover:bg-gray-100': page !== clientStore.currentPage }"
                    @click="typeof page === 'number' ? goToPage(page) : null" :disabled="typeof page !== 'number'">
                    {{ page }}
                </Button>
                <Button variant="outline" size="sm" @click="goToPage(clientStore.currentPage + 1)"
                    :disabled="clientStore.currentPage === clientStore.totalPages"
                    class="text-gray-700 hover:bg-gray-100 disabled:opacity-50">
                    <ChevronRightIcon class="h-4 w-4" />
                </Button>
            </div>
        </div>


        <Dialog v-model:open="isDialogOpen">
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Department Information</DialogTitle>
                </DialogHeader>
                <div class="space-y-4">
                    <div>
                        <Label class="font-bold">Lý Do Khóa Tài Khoản</Label>
                        <Textarea v-model="reason" />
                    </div>
                </div>
                <DialogFooter>
                    <Button @click="banAccount(selectedClient?.id)" class="bg-red-400 hover:bg-red-500 text-white">Khóa
                        Tài Khoản</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    </div>
</template>
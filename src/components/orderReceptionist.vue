<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { cn } from '@/utils/cn'; // Adjust the import path as necessary
import { ClockIcon, Check } from 'lucide-vue-next';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useOrderStore } from './pinia/order.store';
import { useInvoiceStore } from './pinia/invoice.store';
import socket from '../socket';
import { toVietnamese } from '@/lib/toVietnamese';
import { Search, Edit, Trash } from 'lucide-vue-next'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { CheckCircle, AlertCircle } from 'lucide-vue-next'
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover'
import { Command, CommandInput, CommandEmpty, CommandList, CommandGroup, CommandItem } from '@/components/ui/command'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'

import { useClientTemporaryStore } from './pinia/clientTemporary.store';
import { useClientStore } from './pinia/client.store';
import { useToast } from './ui/toast';
import Toast from './ui/toast/Toast.vue';



const { toast } = useToast()
const orderStore = useOrderStore();
const clientStore = useClientStore();
const clientTemporaryStore = useClientTemporaryStore();
const invoiceStore = useInvoiceStore();
const isDialogOpen = ref(false);
const selectedOrder = ref<string | undefined>(new Date().toISOString()); //aint no way this is null, don't let it be null/undefined lol

interface ClientTemporary {
    id: string;
    name: string;
    phoneNumber: string;
    point: number;
    createAt: Date;
    updateAt: Date;
}
interface Order {
    id: string;
    orderStatus: string;
    employeeID: string;
    orderNote: string;
    tableID: string;
    updateAt: string;
    createAt: string;
    forDate: Date
    Table: {
        tableNumber: number;
    };
    OrderDetail: Array<{
        id: string;
        dishId: string;
        quantity: number;
        orderID: string;
        updateAt: string;
        createAt: string;
        orderDetailStatus: string;
        Dish: {
            name: string;
            timeToCook: number;
            costs: Array<{
                id: string;
                dishId: string;
                cost: number;
                createAt: string;
            }>;
        };
    }>;
    Employee: {
        person: {
            name: string;
        };
    };
}

onMounted(() => {
    socket.connect();
    socket.on("orderUpdated", (order) => {
        orderStore.orders.push(order);
    });

    socket.on("orderDeleted", (id) => {
        const orderIndex = orderStore.orders.findIndex(order => order.id === id);

        if (orderIndex !== -1) {
            orderStore.orders.splice(orderIndex, 1); // Xóa đơn hàng khỏi mảng orderStore.orders
            console.log('Order deleted:', id); // log để kiểm tra
        } else {
            console.log('Order not found for deletion:', id);
        }
    });
    orderStore.fetchOrders(1);
    orderStore.fetchOrderDetails();

    loadDataClientTemporary(1);
    loadDataClients(1);
});

const finishedOrders = computed(() => {
    console.log('Finished orders:', finishedOrders.value);
    return orderStore.orders.filter(order => order.orderStatus === 'finished');

});

const formatTime = (date: string) => {
    const dateTime = new Date(date);
    return dateTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const openDialog = async (order) => {
    try {
        // console.log("Fetching order data...");
        const fetchedOrder = await orderStore.fetchOrderByID(order.id);
        // console.log("YOOOOOOOOOOOO", JSON.stringify(fetchedOrder));
        selectedOrder.value = fetchedOrder; // Lấy thông tin đơn hàng theo id
        // console.log(JSON.stringify(selectedOrder.value));
        orderStore.selectedOrderDetails = orderStore.orderDetails.filter(detail => detail.orderID === order.id);
        isDialogOpen.value = true;
    }
    catch (err) {
        console.log(err);
    }
};

const closeDialog = () => {
    isDialogOpen.value = false;
};

const handlePayment = async () => {
    // Logic for payment will be implemented later
    // console.log("SelectedClient id from orderReceptionist: ", selectedCustomer.value?.id);
    invoiceStore.createInvoice(selectedOrder.value?.id, selectedCustomer.value?.id);
    await orderStore.fetchOrders(1);
    finishedOrders.value = orderStore.orders.filter(order => order.orderStatus === 'finished');

    // console.log('Order:', JSON.stringify(selectedOrder.value));
    // console.log('Payment for order:', selectedOrder.value?.id);
    closeDialog();
};








interface Account {
    id: string;
    accountUsername: string;
    accountPassword: string;
    AccountAuthority: number;
    AccountAvatar: string | null;
    personId: string;
    isDeleted: boolean;
    updateAt: Date;
    createAt: Date;
    isVerified: boolean;
    verificationToken: string;
    tokenExpiresAt: Date;
}

interface Person {
    id: string;
    name: string;
    profilePicture: string | null;
    isDeleted: boolean;
    updateAt: Date;
    createAt: Date;
    employeeId: string | null;
    clientId: string | null;
    account: Account[];
}

interface Client {
    id: string;
    point: number;
    email: string;
    phoneNumber: string | null;
    gender: boolean | null;
    isDeleted: boolean;
    updateAt: Date;
    createAt: Date;
    person: Person;
}


const clients = ref<Client[]>([]); // Define as an array of Client
const searchQuery = ref('')
const clientTemporaryID = ref('noCustomer')
const clientsTemporary = ref<ClientTemporary[]>([]); // Define as an array of ClientTemporary

const selectedCustomer = ref<ClientTemporary | Client | null>(null); // Allow both ClientTemporary and Client
setInitialValueForSelectedClientTemporary();

const shouldShowCustomerDiv = computed(() => {
    return selectedCustomer.value?.id !== 'noCustomer';
});


//for load data for client and clientTeporary
const loadDataClientTemporary = async (page: number) => {
    await clientTemporaryStore.fetchClientTemporary(page);
    clientsTemporary.value = clientTemporaryStore.clientsTemporary;
}

const loadDataClients = async (page: number) => {
    await clientStore.fetchClients(page);
    clients.value = clientStore.clients; //mismatched interface here and in the store. Do not woooooorry bout this. This is the real data, the one in the store is a simplified version of it. "Why write 2 interface? Interface is not supposed to be use like that!!" Yeah, i freaking know. Not that im writing both code lmao, i only wrote this. You might wonder "Why i get so much data for client then just use 3, it will slow down the server!" Well yeah... caused im lazy... format it in backend is crazy work for me (right now). Not that i can't do that, just it related to many files and i don't want to mess up the whole project. So, i just get all data and use it. I will fix it later. I promise (or not lol)
    console.log("Printing from loadDataClients", clients.value);
};



const handleCustomerSelect = (customerId: string) => {
    clientTemporaryID.value = customerId;
    if (clientTemporaryID.value !== 'noCustomer') {
        selectedCustomer.value =
            clientsTemporary.value.find((c) => c.id === clientTemporaryID.value) ||
            clients.value.find((c) => c.id === clientTemporaryID.value) ||
            null;
    } else {
        setInitialValueForSelectedClientTemporary();
    }
    console.log(clientTemporaryID.value);
    console.log(selectedCustomer.value);
};

const openEditModel = () => {
    isEditModalOpen.value = true;
}



function setInitialValueForSelectedClientTemporary() {
    selectedCustomer.value = {
        id: 'noCustomer',
        name: '',
        phoneNumber: '',
        point: 0,
        createAt: new Date(),
        updateAt: new Date(),
    } as ClientTemporary; //because it can be either ClientTemporary or Client
}

watch(selectedCustomer, (newVal) => {
    console.log("Catch from watch: selectedCustomer update value:", newVal);
})

const combinedClients = computed(() => {
    return [
        ...clientsTemporary.value.map(client => ({
            id: client.id,
            name: client.name,
            phoneNumber: client.phoneNumber,
            point: client.point,
        })),
        ...clients.value.map(client => ({
            id: client.id,
            name: client.person.name,
            phoneNumber: client.phoneNumber,
            point: client.point,
            status: 'verifiedAccount', // not the correct choice of words. So i will explain.
            //This is the real account, that used for lotta things, the other one is just for store point
            //This field is a temporary field only exist in this component. To distinguish between client and clientTemporary
        })),
    ];
});

//i should have just freaking add "name" to client interface (duplicate field from person, i know, i know) than writing this shit
//as selectedCustomer.name does not always return the name (real account have name in client.person.name)
//This will serve as a const for v-model to bind to
const selectedCustomerName = computed({
    get() {
        if (selectedCustomer.value) {
            return 'person' in selectedCustomer.value ? selectedCustomer.value.person.name : selectedCustomer.value.name;
        }
        return '';
    },
    set(value: string) {
        if (selectedCustomer.value) {
            if ('person' in selectedCustomer.value) {
                selectedCustomer.value.person.name = value;
            } else {
                selectedCustomer.value.name = value;
            }
        }
    }
});

const handleSearch = async () => {
    try {
        console.log("At least i do run");
        clientStore.setSearch(searchQuery.value)
        clientTemporaryStore.setSearch(searchQuery.value)
        await clientTemporaryStore.fetchClientTemporary(1)
        await clientStore.fetchClients(1);
        clients.value = clientStore.clients;
        clientsTemporary.value = clientTemporaryStore.clientsTemporary;
    } catch (error) {
        error.message
    }
}



const isEditModalOpen = ref(false);

const handleEdit = async () => {
    try {
        //first condition is clear, second is to check if it's a client that do not want to add or use point
        //third is to check IF THE CLIENT IS NOT A  REAL CLIENT as i only allow the receptionist to 
        //edit the client that is not a real client (clientTemporary)
        //so if the client is a real client, it will have a person field, and i will not allow the receptionist to edit it
        //person is just a flag, not really importaint, just to distinguish between client and clientTemporary

        if (selectedCustomer.value && !('noCustomer' in selectedCustomer.value) && !('person' in selectedCustomer.value)) {
            await clientTemporaryStore.updateClientTemporary(selectedCustomer.value);
            isEditModalOpen.value = false;
        }
        else {
            toast({
                title: 'Chỉnh sửa khách hàng không thành công',
                description: 'Có lỗi khi xảy ra khi chỉnh sửa khách hàng. Hãy đảm bảo khách hàng được chọn không phải là khách hàng thực sự (được xác định bằng dấu ! khi chọn khách hàng ).',
            });
        }
    } catch (error) {
        toast({
            title: 'Chỉnh sửa khách hàng không thành công',
            description: 'Có lỗi khi xảy ra khi chỉnh sửa khách hàng. Hãy đảm bảo khách hàng được chọn không phải là khách hàng thực sự (được xác định bằng dấu ! khi chọn khách hàng ).',
        });
    }
}

const isDeleteConfirmationModelOpen = ref(false)
const deleteCustomer = () => {
    if (selectedCustomer.value && !('noCustomer' in selectedCustomer.value) && !('person' in selectedCustomer.value)) {
        isDeleteConfirmationModelOpen.value = true;
        console.log("isDeleteConfirmationModelOpen", isDeleteConfirmationModelOpen.value);
    } else {
        toast({
            title: 'Xóa khách hàng không thành công',
            description: 'Có lỗi khi xảy ra khi xóa khách hàng. Hãy đảm bảo khách hàng được chọn không phải là khách hàng thực sự (được xác định bằng dấu ! khi chọn khách hàng ).',
        });
    }
};

const confirmDelete = async () => {
    if (selectedCustomer.value) {
        clientTemporaryStore.deleteClientTemporary(selectedCustomer.value.id);

        setInitialValueForSelectedClientTemporary();
        await clientStore.fetchClients(1);
        await clientTemporaryStore.fetchClientTemporary(1);
        clients.value = clientStore.clients;
        clientsTemporary.value = clientTemporaryStore.clientsTemporary;
    }
    isDeleteConfirmationModelOpen.value = false;
};

const cancelDelete = () => {
    isDeleteConfirmationModelOpen.value = false;
};


watch(clientsTemporary, (newVal) => {
    console.log("clientsTemporary update value:", newVal);
})











</script>

<template>
    <div class="min-h-screen bg-gray-100 p-4">
        <div class="w-full mx-auto">
            <h1 class="text-3xl md:text-4xl font-bold mb-6 text-gray-900">Đơn Đã Hoàn Thành</h1>

            <div class="grid grid-cols-1 lg:grid-cols-4 xl:grid-cols-4 gap-6">
                <Card v-for="(order, index) in finishedOrders" :key="order.id"
                    class="bg-white rounded-lg shadow-md overflow-hidden transition-shadow hover:shadow-lg">
                    <CardHeader>
                        <div class="flex justify-between items-center gap-x-6">
                            <CardTitle>Đơn Món #{{ index + 1 }}</CardTitle>
                            <Badge class="bg-green-400 text-white">
                                {{ toVietnamese(order.orderStatus) }}
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div class="flex justify-between items-center text-sm text-gray-600">
                            <span class="flex items-center">
                                <ClockIcon class="w-4 h-4 mr-1" />
                                {{ formatTime(order.createAt) }}
                            </span>
                            <span class="flex items-center">
                                Bàn số {{ order.tableID }}
                            </span>
                        </div>
                    </CardContent>
                    <CardFooter class="bg-gray-50 border-t border-gray-200 flex align-middle py-4">
                        <div class="flex align-middle justify-center items-center gap-2 w-full">
                            <Button @click="openDialog(order)" class="flex-1 bg-blue-500 hover:bg-blue-600 text-white">
                                <Check class="w-4 h-4 mr-2 text-white" />
                                Chờ thanh toán
                            </Button>
                        </div>
                    </CardFooter>
                </Card>
            </div>
        </div>

        <Dialog v-model:open="isDialogOpen">
            <DialogContent class="sm:max-w-[850px]">
                <DialogHeader>
                    <DialogTitle>Chi Tiết Đơn Món</DialogTitle>
                    <DialogDescription>
                        Order ID: {{ selectedOrder?.id }}
                    </DialogDescription>
                </DialogHeader>
                <div class="grid grid-cols-2 gap-4 py-4">
                    <div class="flex items-center gap-2">
                        <span class="font-medium">Trạng thái:</span>
                        <Badge :class="{
                            'bg-pink-500 text-white': selectedOrder?.orderStatus === 'new',
                            'bg-red-500 text-white': selectedOrder?.orderStatus === 'cooking',
                            'bg-green-500 text-white': selectedOrder?.orderStatus === 'finished',
                            'bg-gray-500 text-white': selectedOrder?.orderStatus !== 'new' && selectedOrder?.orderStatus !== 'cooking' && selectedOrder?.orderStatus !== 'finished'
                        }">
                            {{ toVietnamese(selectedOrder?.orderStatus) }}
                        </Badge>
                    </div>
                    <div class="flex items-center gap-2">
                        <span class="font-medium">Bàn số:</span>
                        <span>{{ selectedOrder?.Table.tableNumber }}</span>
                    </div>
                    <div class="flex items-center gap-2">
                        <span class="font-medium">Nhân viên tạo:</span>
                        <span>{{ selectedOrder?.Employee.person.name }}</span>
                    </div>
                    <div class="flex items-center gap-2">
                        <span class="font-medium">Thời gian đặt đơn:</span>
                        <span>{{ formatTime(selectedOrder?.createAt) }}</span>
                    </div>
                </div>
                <ScrollArea class="h-[300px] w-full rounded-md border overflow-auto">
                    <div class="p-4">
                        <div class="grid grid-cols-12 gap-4 font-medium mb-2">
                            <div class="col-span-1">STT</div>
                            <div class="col-span-4">Món ăn</div>
                            <div class="col-span-1 text-center">SL</div>
                            <div class="col-span-2 text-center">Thời gian</div>
                            <div class="col-span-2 text-center">Trạng thái</div>
                        </div>
                        <div class="space-y-2">
                            <div v-for="(item, index) in selectedOrder?.OrderDetail" :key="item.id"
                                class="grid grid-cols-12 gap-4 py-2 border-t first:border-t-0 items-center">
                                <div class="col-span-1">{{ index + 1 }}</div>
                                <div class="col-span-4 truncate">{{ item.Dish.name }}</div>
                                <div class="col-span-1 text-center">{{ item.quantity }}</div>
                                <div class="col-span-2 text-center">{{ item.Dish.timeToCook }} phút</div>
                                <div class="col-span-2 text-center">
                                    <Badge :class="{
                                        'bg-pink-500 text-white': item.orderDetailStatus === 'new',
                                        'bg-red-500 text-white': item.orderDetailStatus === 'cooking',
                                        'bg-green-500 text-white': item.orderDetailStatus === 'finished'
                                    }">
                                        {{ toVietnamese(item.orderDetailStatus) }}
                                    </Badge>
                                </div>
                            </div>
                        </div>
                    </div>
                </ScrollArea>
                <div class="space-y-4 mt-4">
                    <Select v-model="clientTemporaryID" default-value="noCustomer"
                        @update:modelValue="handleCustomerSelect">
                        <SelectTrigger class="w-full">
                            <SelectValue placeholder="Khách vãng lai" />
                        </SelectTrigger>
                        <SelectContent>
                            <div class="relative mb-2">
                                <Input v-model="searchQuery" @input="handleSearch"
                                    placeholder=" Tìm theo tên hoặc số điện thoại" class="pl-10" />
                                <Search
                                    class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                            </div>
                            <SelectItem value="noCustomer">Khách vãng lai</SelectItem>
                            <SelectItem v-for="customer in combinedClients" :key="customer.id" :value="customer.id">
                                <div class="flex items-center">
                                    <span>{{ customer.name }} - {{ customer.phoneNumber }}</span>
                                    <CheckCircle v-if="customer.status" class="ml-2 text-green-500 h-4 w-4" />
                                    <AlertCircle v-else class="ml-2 text-yellow-500 h-4 w-4" />
                                </div>
                            </SelectItem>
                        </SelectContent>
                    </Select>
                    <transition name="fade">
                        <div v-if="shouldShowCustomerDiv" class="bg-gray-100 p-4 rounded-md space-y-2">
                            <div class="flex justify-between items-center">
                                <h3 class="text-lg font-semibold">Thông tin khách hàng</h3>
                                <div class="space-x-2">
                                    <Button size="sm" variant="outline" @click="openEditModel">
                                        <Edit class="w-4 h-4 mr-1" /> Sửa
                                    </Button>
                                    <Button size="sm" variant="outline" class="text-red-500 hover:text-red-700"
                                        @click="deleteCustomer">
                                        <Trash class="w-4 h-4 mr-1" /> Xóa
                                    </Button>
                                </div>
                            </div>
                            <div>
                                <Label>Tên:</Label>
                                <Input v-model="selectedCustomerName" readonly class="mt-1" />
                            </div>
                            <div>
                                <Label>Số điện thoại:</Label>
                                <Input v-model="selectedCustomer!.phoneNumber" readonly class="mt-1" />
                            </div>
                            <div>
                                <Label>Điểm tích lũy:</Label>
                                <Input v-model="selectedCustomer!.point" readonly class="mt-1" />
                            </div>
                        </div>
                    </transition>
                </div>
                <DialogFooter>
                    <Button @click="handlePayment" class="bg-blue-500 hover:bg-blue-600 text-white">Thanh toán</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>


        <Dialog v-model:open="isEditModalOpen">
            <DialogContent class="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Edit Client</DialogTitle>
                    <DialogDescription>
                        Edit the details of the client below.
                    </DialogDescription>
                </DialogHeader>
                <form @submit.prevent="handleEdit">
                    <div class="grid gap-4 py-4">
                        <div class="grid grid-cols-4 items-center gap-4">
                            <Label for="name" class="text-right">Name</Label>
                            <Input id="name" v-model="selectedCustomer!.name" class="col-span-3" required />
                        </div>
                        <div class="grid grid-cols-4 items-center gap-4">
                            <Label for="phone" class="text-right">Phone Number</Label>
                            <Input id="phone" v-model="selectedCustomer!.phoneNumber" class="col-span-3" required />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit">Save changes</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>

        <Dialog v-model:open="isDeleteConfirmationModelOpen">
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Confirm Deletion</DialogTitle>
                    <DialogDescription>
                        Are you sure you want to delete this client?
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button @click="confirmDelete">Confirm</Button>
                    <Button @click="cancelDelete">Cancel</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>

    </div>
</template>
<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Plus, Edit, Trash2 } from 'lucide-vue-next'
import { Badge } from '@/components/ui/badge'
import socket from '../socket';
import { useAuthStore } from './pinia/auth'
import { hasPermission, ROLES } from './utils/permission'
import { useToast } from "./ui/toast"
const { toast } = useToast();
const authStore = useAuthStore()


//At first, you will confuse why there is 2 table interface
//And i am as confused as you lmao.
//Just kidding, The first interface was written by me, 2 month later, then the second one was written by me, 2 month ago (which was when i have no idea what even is javascript and how to console.log lmao, and, this page was kinda build on this interface)
interface Table {
  id: string;
  tableNumber: number;
  numberOfSeats: number;
  tableStatus: boolean;
}
interface Table2 {
  id: string;
  tableNumber: number;
  numberOfSeats: number;
  status: boolean;
}

function checkPermission() {
  const requiredRoles = [ROLES.ADMIN]; // Define the roles required to add a dish type
  console.log(authStore.userRole, requiredRoles);
  if (!hasPermission(authStore.userRole, requiredRoles)) {
    toast({
      title: 'Bị cấm',
      description: 'Tài khoản của bạn không thể thực hiện thao tác này',
    });
    return false;
  }
  return true;
}


onMounted(async () => {
  // Connect socket
  socket.connect()

  // Listen for table additions
  socket.on("tableAdd", (table) => {
    tables.value.push(table)
  })

  socket.on("tableUpdate", (updatedTable) => {
    console.log("Checking the updatedTable at Table.vue: ", updatedTable);
    const index = tables.value.findIndex(t => t.id === updatedTable.id)
    if (index !== -1) {
      tables.value[index] = {
        ...updatedTable,
        numberOfSeats: updatedTable.seatNumber // Ensure numberOfSeats is updated correctly
      };
    }
    // console.log("Yooo, i got the /tableUpdate/ signal, im running at table.vue");
    // console.log("Printing tables at Table.vue: ", JSON.stringify(tables.value));
  })

  try {
    // Fetch tables
    const tablesResponse = await fetch('http://localhost:3000/api/table')
    const tablesData = await tablesResponse.json()
    tables.value = tablesData.map((table) => ({
      id: table.id,
      tableNumber: table.tableNumber,
      numberOfSeats: table.seatNumber,
      status: table.tableStatus,
    }))
  } catch (error) {
    console.error('Error fetching table data:', error)
  }
})

const tables = ref<Table2[]>([]);
const isAddTableModalOpen = ref(false);
const isEditTableModalOpen = ref(false);
const newTable = ref<Omit<Table2, 'id'>>({
  tableNumber: 0,
  numberOfSeats: 0,
  status: true
});

const editingTable = ref<Table | null>(null);

const openAddTableModal = () => {
  if (!checkPermission()) return;
  isAddTableModalOpen.value = true;
};

const closeAddTableModal = () => {
  isAddTableModalOpen.value = false;
  resetNewTableForm();
};

const openEditTableModal = (table: Table2) => {
  if (!checkPermission()) return;
  //Lmao trust me on this one, it DOES exist!!!!!!!!!! (status)
  //i get the status out of the table object and put it in the tableStatus property (dont blame me, i write this code at 3am)
  const { status, ...tableWithoutStatus } = table;
  const tableWithStatus = {
    ...tableWithoutStatus,
    tableStatus: status
  };
  editingTable.value = { ...tableWithStatus };
  isEditTableModalOpen.value = true;
};

const closeEditTableModal = () => {
  isEditTableModalOpen.value = false;
  editingTable.value = null;
};

const submitTable = async () => {
  try {
    if (!checkPermission()) return;
    if (!validateNewTable()) return;
    //i use AI tui build this and it revolve around the newTable.value, sooo
    //i gotta map the newTable.value to the table object so it can be use with backend
    //Please don't hurt me T.T

    //Hello, i am back after 2 month, i am sorry for the confusion, i am here to help you
    //I still got no idea what my past self was doing lmao. Only god knows
    const table = {
      tableNumber: newTable.value.tableNumber,
      seatNumber: newTable.value.numberOfSeats,
      tableStatus: newTable.value.status,
      isDeleted: false
    };

    const response = await fetch('http://localhost:3000/api/table', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(table),
    });
    console.log(1);
    const responseData = await response.json();
    // console.log(response.json(), response.status);
    console.log(2);
    if (response.status === 201) {
      // console.log(response.body);
      const addedTable = responseData;
      console.log("addedTable: ", addedTable);
      //attemp1
      // tables.value.push(responseData);
      //attempt2
      // tables.value.push({
      //   id: addedTable.id,
      //   tableNumber: addedTable.tableNum ber,
      //   numberOfSeats: addedTable.seatNumber,
      //   status: addedTable.tableStatus
      // });
      // tables.value = await fetchTables();
      //attemp3
      //The thing is the upper 2 attemps are not working, so i gotta re-fetch the tables from the backend
      //There's not enough time to debug this, so i gotta do this
      const tablesResponse = await fetch('http://localhost:3000/api/table')
      const tablesData = await tablesResponse.json()
      tables.value = tablesData.map((table) => ({
        id: table.id,
        tableNumber: table.tableNumber,
        numberOfSeats: table.seatNumber,
        status: table.tableStatus,
      }))

      closeAddTableModal();
    } else {
      console.error('Failed to add table');
    }
  } catch (error) {
    console.log('Error adding table:', error.message);
  }
};

const updateTable = async () => {
  if (!checkPermission()) return;
  if (!editingTable.value) return;
  if (!validateEditingTable()) return;

  try {
    const { id, ...tableWithoutID } = editingTable.value;
    const updatedTableData = {
      tableNumber: tableWithoutID.tableNumber,
      seatNumber: tableWithoutID.numberOfSeats,
      tableStatus: tableWithoutID.tableStatus,
    };

    console.log('Sending update:', JSON.stringify(updatedTableData));

    const response = await fetch(`http://localhost:3000/api/table/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedTableData),
    });

    if (response.ok) {
      const updatedTable = await response.json();
      console.log('Received updated table:', JSON.stringify(updatedTable));

      const index = tables.value.findIndex(t => t.id === updatedTable.id);
      if (index !== -1) {
        tables.value[index] = {
          id: updatedTable.id,
          tableNumber: updatedTable.tableNumber,
          numberOfSeats: updatedTable.seatNumber,
          status: updatedTable.tableStatus, // Update this line
        };
      }
      closeEditTableModal();
    } else {
      console.error('Failed to update table');
    }
  } catch (error) {
    console.error('Error updating table:', error);
  }
};


const handleCheckedNewTable = () => {
  // console.log("all table:", JSON.stringify(tables.value));
  newTable.value.status = !newTable.value.status;
};


const resetNewTableForm = () => {
  newTable.value = {
    tableNumber: 0,
    numberOfSeats: 0,
    status: true
  };
};

function validateNewTable() {
  if (newTable.value.tableNumber < 1 || newTable.value.tableNumber === null) {
    toast({
      title: 'Lỗi',
      description: 'Số bàn phải lớn hơn 0 và không được để trống',
    });
    return false;
  }
  if (newTable.value.numberOfSeats < 1 || newTable.value.numberOfSeats === null) {
    toast({
      title: 'Lỗi',
      description: 'Số chỗ ngồi phải lớn hơn 0 và không được để trống',
    });
    return false;
  }
  return true;
}

function validateEditingTable() {
  if (editingTable.value!.tableNumber < 1 || editingTable.value!.tableNumber === null) {
    toast({
      title: 'Lỗi',
      description: 'Số bàn phải lớn hơn 0 và không được để trống',
    });
    return false;
  }
  if (editingTable.value!.numberOfSeats < 1 || editingTable.value!.numberOfSeats === null) {
    toast({
      title: 'Lỗi',
      description: 'Số chỗ ngồi phải lớn hơn 0 và không được để trống',
    });
    return false;
  }
  return true;
}

const isDeleteDialogOpen = ref(false);
const tableIDOfAboutToBeDeletedTable = ref('');
const openDeleteConfirmDialog = (tableID: string) => {
  console.log("tableID:", tableID);
  tableIDOfAboutToBeDeletedTable.value = tableID;
  isDeleteDialogOpen.value = true;
}

// const deleteTable = async () => {
//   if (!checkPermission()) { return; }
//   await deleteTable(tableIDOfAboutToBeDeletedDish.value);
//   isDeleteDialogOpen.value = false;
// }

const deleteTable = async () => {
  try {
    if (!checkPermission()) return;
    const response = await fetch(`http://localhost:3000/api/table/${tableIDOfAboutToBeDeletedTable.value}`, {
      method: 'DELETE',
    });

    if (response.ok) {
      tables.value = tables.value.filter(t => t.id !== tableIDOfAboutToBeDeletedTable.value);
    } else {
      console.error('Failed to delete table');
    }
    isDeleteDialogOpen.value = false;
  } catch (error) {
    console.error('Error deleting table:', error);
  }
};
</script>

<template>
  <div class="h-full w-full bg-gray-50">
    <div class="p-6">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-3xl font-bold">Quản Lý Bàn</h1>
        <Button @click="openAddTableModal" class="bg-blue-500 hover:bg-blue-600 text-white">
          <Plus class="w-4 h-4 mr-2" />
          Thêm Bàn

        </Button>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card v-for="table in tables" :key="table.id" class="overflow-hidden">
          <CardContent class="p-4">
            <div class="flex justify-between items-start mb-4">
              <h2 class="text-xl font-semibold">Bàn {{ table.tableNumber }}</h2>
              <Badge :variant="table.status ? 'default' : 'secondary'">
                {{ table.status ? 'Còn Trống' : 'Hết Chỗ' }}
              </Badge>
            </div>
            <p class="text-gray-600 mb-4">Số chỗ ngồi: {{ table.numberOfSeats }}</p>
            <div class="flex justify-end space-x-2">
              <Button variant="outline" size="sm" @click="openEditTableModal(table)">
                <Edit class="w-4 h-4 mr-2" />
                Chỉnh Sửa
              </Button>
              <Button variant="destructive" size="sm" @click="openDeleteConfirmDialog(table.id)">
                <Trash2 class="w-4 h-4 mr-2" />
                Xóa Bàn
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>

    <!-- Add Table Modal -->
    <Dialog v-model:open="isAddTableModalOpen">
      <DialogContent class="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Thêm Bàn Mới</DialogTitle>
          <DialogDescription>
            Nhập thông tin bàn mới dưới đây, sau đó nhấn lưu.
          </DialogDescription>
        </DialogHeader>
        <form @submit.prevent="submitTable" class="space-y-4">
          <div>
            <Label for="tableNumber">Bàn Số</Label>
            <Input id="tableNumber" v-model="newTable.tableNumber" type="number" required />
          </div>

          <div>
            <Label for="numberOfSeats">Số chỗ ngồi</Label>
            <Input id="numberOfSeats" v-model="newTable.numberOfSeats" type="number" required />
          </div>

          <div class="flex items-center space-x-2">
            <Switch id="status" :checked="newTable.status" @update:checked="handleCheckedNewTable" />
            <Label for="status">Còn trống?</Label>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" @click="closeAddTableModal">Hủy</Button>
            <Button type="submit" class="bg-blue-500 hover:bg-blue-600 text-white">Lưu bàn</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>

    <!-- Edit Table Modal -->
    <Dialog v-model:open="isEditTableModalOpen">
      <DialogContent class="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Chỉnh sửa bàn</DialogTitle>
          <DialogDescription>
            Thay đổi thông tin bàn, sau đó nhấn lưu thay đổi.
          </DialogDescription>
        </DialogHeader>
        <form v-if="editingTable" @submit.prevent="updateTable" class="space-y-4">
          <div>
            <Label for="editTableNumber">Bàn:</Label>
            <Input id="editTableNumber" v-model="editingTable.tableNumber" type="number" required disabled />
          </div>

          <div>
            <Label for="editNumberOfSeats">Số Chỗ Ngồi</Label>
            <Input id="editNumberOfSeats" v-model="editingTable.numberOfSeats" type="number" required />
          </div>

          <div class="flex items-center space-x-2">
            <Switch id="editStatus" v-model:checked="editingTable.tableStatus" />
            <Label for="editStatus">{{ editingTable.tableStatus ? 'Còn trống' : 'Hết Chỗ' }}</Label>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" @click="closeEditTableModal">Hủy </Button>
            <Button type="submit" class="bg-blue-500 hover:bg-blue-600 text-white">Lưu thông tin</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>


    <Dialog v-model:open="isDeleteDialogOpen">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Xác nhận xóa bàn này?</DialogTitle>
          <DialogDescription>
            Bạn có chắc chắn muốn xóa bàn này không? Hành động này không thể hoàn tác trừ khi liên hệ với kỹ thuật viên.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button @click="isDeleteDialogOpen = false"> Hủy </Button>
          <Button @click="deleteTable" class="bg-red-400 hover:bg-red-500 text-white">Xóa</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>
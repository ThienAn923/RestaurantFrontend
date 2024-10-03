<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Plus, Edit, Trash2 } from 'lucide-vue-next'
import { Badge } from '@/components/ui/badge'

interface Table {
    id: string;
    tableNumber: number;
    numberOfSeats: number;
    status: boolean;
}

const tables = ref<Table[]>([]);
const isAddTableModalOpen = ref(false);
const isEditTableModalOpen = ref(false);
const newTable = ref<Omit<Table, 'id'>>({
    tableNumber: 0,
    numberOfSeats: 0,
    status: true
});
const editingTable = ref<Table | null>(null);

onMounted(async () => {
    const tablesResponse = await fetch('http://localhost:3000/api/table');
    const tablesData = await tablesResponse.json();
//   tables.value = tablesData;
    tables.value = tablesData.map((table: any) => ({
        id: table.id,
        tableNumber: table.tableNumber,
        numberOfSeats: table.seatNumber,
        status: table.tableStatus,
    }));
});

const openAddTableModal = () => {
    isAddTableModalOpen.value = true;
};

const closeAddTableModal = () => {
    isAddTableModalOpen.value = false;
    resetNewTableForm();
};

const openEditTableModal = (table: Table) => {
    editingTable.value = { ...table };
    isEditTableModalOpen.value = true;
};

const closeEditTableModal = () => {
    isEditTableModalOpen.value = false;
    editingTable.value = null;
};

const submitTable = async () => {
    try {
        //i use AI tui build this and it revolve around the newTable.value, sooo
        //i gotta map the newTable.value to the table object so it can be use with backend
        //Please don't hurt me T.T
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

        if (response.ok) {
        const addedTable = await response.json();
        tables.value.push(addedTable);
        closeAddTableModal();
        } else {
        console.error('Failed to add table');
        }
    } catch (error) {
        console.error('Error adding table:', error);
    }
};

const updateTable = async () => {
    if (!editingTable.value) return;

    try {
        console.log(JSON.stringify(editingTable.value));
        const { id, ...tableWithoutID } = editingTable.value;
        const response = await fetch(`http://localhost:3000/api/table/${editingTable.value.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tableWithoutID),
        });

        if (response.ok) {
        const updatedTable = await response.json();
        const index = tables.value.findIndex(t => t.id === updatedTable.id);
        if (index !== -1) {
            tables.value[index] = updatedTable;
        }
        closeEditTableModal();
        } else {
        console.error('Failed to update table');
        }
    } catch (error) {
        console.error('Error updating table:', error);
    }
};

const deleteTable = async (id: string) => {
    try {
        const response = await fetch(`http://localhost:3000/api/table/${id}`, {
        method: 'DELETE',
        });

        if (response.ok) {
        tables.value = tables.value.filter(t => t.id !== id);
        } else {
        console.error('Failed to delete table');
        }
    } catch (error) {
        console.error('Error deleting table:', error);
    }
    };

    const resetNewTableForm = () => {
    newTable.value = {
        tableNumber: 0,
        numberOfSeats: 0,
        status: true
    };
};
</script>

<template>
  <div class="h-full w-full bg-gray-50">
    <div class="p-6">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-3xl font-bold">Tables</h1>
        <Button @click="openAddTableModal">
          <Plus class="w-4 h-4 mr-2" />
          Add Table
        </Button>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card v-for="table in tables" :key="table.id" class="overflow-hidden">
          <CardContent class="p-4">
            <div class="flex justify-between items-start mb-4">
              <h2 class="text-xl font-semibold">Table {{ table.tableNumber }}</h2>
              <Badge :variant="table.status ? 'default' : 'secondary'">
                {{ table.status ? 'Available' : 'Occupied' }}
              </Badge>
            </div>
            <p class="text-gray-600 mb-4">Seats: {{ table.numberOfSeats }}</p>
            <div class="flex justify-end space-x-2">
              <Button variant="outline" size="sm" @click="openEditTableModal(table)">
                <Edit class="w-4 h-4 mr-2" />
                Edit
              </Button>
              <Button variant="destructive" size="sm" @click="deleteTable(table.id)">
                <Trash2 class="w-4 h-4 mr-2" />
                Delete
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
          <DialogTitle>Add New Table</DialogTitle>
          <DialogDescription>
            Enter the details of the new table below. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <form @submit.prevent="submitTable" class="space-y-4">
          <div>
            <Label for="tableNumber">Table Number</Label>
            <Input id="tableNumber" v-model="newTable.tableNumber" type="number" required />
          </div>

          <div>
            <Label for="numberOfSeats">Number of Seats</Label>
            <Input id="numberOfSeats" v-model="newTable.numberOfSeats" type="number" required />
          </div>

          <div class="flex items-center space-x-2">
            <Switch id="status" v-model="newTable.status" />
            <Label for="status">Available</Label>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" @click="closeAddTableModal">Cancel</Button>
            <Button type="submit">Save Table</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>

    <!-- Edit Table Modal -->
    <Dialog v-model:open="isEditTableModalOpen">
      <DialogContent class="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Table</DialogTitle>
          <DialogDescription>
            Make changes to the table details below. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <form v-if="editingTable" @submit.prevent="updateTable" class="space-y-4">
          <div>
            <Label for="editTableNumber">Table Number</Label>
            <Input id="editTableNumber" v-model="editingTable.tableNumber" type="number" required />
          </div>

          <div>
            <Label for="editNumberOfSeats">Number of Seats</Label>
            <Input id="editNumberOfSeats" v-model="editingTable.numberOfSeats" type="number" required />
          </div>

          <div class="flex items-center space-x-2">
            <Switch id="editStatus" v-model="editingTable.status" />
            <Label for="editStatus">Available</Label>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" @click="closeEditTableModal">Cancel</Button>
            <Button type="submit">Save Changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  </div>
</template>
<template>
  <div class="flex w-screen h-screen bg-background">
    <!-- Sidebar with client list -->
    <aside class="w-full sm:w-64 bg-card border-r border-border h-full">
      <div class="p-4 border-b border-border">
        <h2 class="text-lg font-semibold text-foreground">Tin nhắn</h2>
      </div>
      <div class="h-[calc(100vh-64px)] overflow-y-auto">
        <nav class="space-y-1 p-2">
          <button
            v-for="client in clientStore.clients"
            :key="client.email"
            @click="selectUser(client)"
            :class="{
              'bg-accent text-accent-foreground': selectedUser?.id === client.id,
              'hover:bg-accent/50': selectedUser?.id !== client.id
            }"
            class="w-full flex items-center space-x-3 p-2 rounded-lg transition-colors"
          >
            <span>{{ client.initials }}</span>
            <span class="text-sm font-medium">{{ client.email }}</span>
          </button>
        </nav>
      </div>
    </aside>

    <!-- Main content with chat screen -->
    <main class="flex-1 flex flex-col h-full">
      <header class="p-4 border-b border-border flex items-center space-x-4">
        <h2 v-if="selectedUser" class="text-lg font-semibold text-foreground">{{ selectedUser.email }}</h2>
        <h2 v-else class="text-lg font-semibold text-foreground">Chọn người dùng để bắt đầu chat</h2>
      </header>
      <div class="flex-1 p-4 overflow-y-auto">
        <div class="space-y-4">
          <div
            v-for="message in messageStore.messages"
            :key="message.id"
            :class="{
              'flex justify-end': message.senderType === true,   
              'flex justify-start': message.senderType === false,    
          }"
          >
            <div
              :class="{
                'bg-primary text-primary-foreground': message.senderType === false,
                'bg-muted': message.senderType === true,
              }"
              class="rounded-lg px-4 py-2 max-w-sm"
            >
              <p>{{ message.text }}</p>
              <p class="text-xs text-muted-foreground mt-1">{{ new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }}</p>
            </div>
          </div>
        </div>
      </div>
      <footer class="p-4 border-t border-border">
        <form @submit.prevent="handleSendMessage" class="flex space-x-2">
          <input
            v-model="newMessage"
            type="text"
            placeholder="Nhập tin nhắn..."
            class="flex-1 p-2 border border-border rounded-lg"
          />
          <button type="submit" class="bg-primary text-white p-2 rounded-lg flex items-center">
            <span>Gửi</span>
          </button>
        </form>
      </footer>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useClientStore } from '../components/pinia/client.store';
import { useMessageStore } from '../components/pinia/message.store';
import socket from '../socket';

const clientStore = useClientStore();
const messageStore = useMessageStore();
const clients = ref([]);
const selectedUser = ref(null);
const newMessage = ref('');

// Fetch clients when the component is mounted
onMounted(async () => {
  await clientStore.fetchClients(1,999999);
  clients.value = clientStore.clients;
});

// Lắng nghe sự kiện khi có tin nhắn mới đến
socket.on('messageCreated', (message) => {
  messageStore.messages.push(message); // Add incoming message to message store
});

// Xử lý gửi tin nhắn
const handleSendMessage = () => {
  if (newMessage.value.trim() && selectedUser.value) {
    console.log(selectedUser.value.roomId);
    messageStore.sendMessage(selectedUser.value.id, selectedUser.value.roomId, newMessage.value);
    newMessage.value = ''; // Clear the input field
  }
};

// Chọn người dùng và lấy thông tin phòng
const selectUser = async (user) => {
  selectedUser.value = user;
  const rooms = await messageStore.fetchRoomWithClientId(selectedUser.value.id);
  selectedUser.value.roomId = rooms.id;
  messageStore.fetchMessageWithRoomId(rooms.id);
};
</script>

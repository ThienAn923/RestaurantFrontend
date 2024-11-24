// message.store.ts
import { defineStore } from 'pinia';
import { ref } from 'vue';

interface Message {
  id: string;          // MongoDB-generated unique ID for the message
  senderId: string;    // ID of the sender
  text: string;        // Message content
  roomId: string;      // ID of the chat room
  createdAt: Date;     // Message creation timestamp
  senderType: boolean; // Indicates the sender type
}

interface Room {
  id: string;          // MongoDB-generated unique ID for the room
  roomKey: string;
  clientId: string;
  employeeId: string;
  createdAt: Date;
  updatedAt: Date;
}

export const useMessageStore = defineStore('message', () => {
  const messages = ref<Message[]>([]);
  const rooms = ref<Room[]>([]);

  const fetchMessageWithRoomId = async (roomId: string) => {
    try {
      const response = await fetch(`http://localhost:3000/api/messageChat/room/${roomId}`);
      if (!response.ok) {
        throw new Error(`Error fetching messages: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Fetched messages:', data);
      messages.value = data.map((msg: any) => ({
        id: msg._id,
        senderId: msg.senderId,
        text: msg.text,
        roomId: msg.roomId,
        createdAt: new Date(msg.createdAt),
        senderType: msg.senderType,
      }));
    } catch (error) {
      console.error("Failed to fetch messages:", error);
    }
  };

  const fetchRoomWithRoomId = async () => {
    try {
      const response = await fetch(`http://localhost:3000/api/roomChat/`);
      if (!response.ok) {
        throw new Error(`Error fetching room: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log(data);
      const roomItem: Room[] = data.map((roomData: any) => ({
        id: roomData.id,
        roomKey: roomData.roomKey,
        clientId: roomData.clientId,
        employeeId: roomData.employeeId,
        createdAt: new Date(roomData.createdAt),
        updatedAt: new Date(roomData.updatedAt),
      }));
      
      return roomItem[0];
    } catch (error) {
      console.error("Failed to fetch room:", error);
    }
  };

  const sendMessage = async (clientId: string, roomId: string, text: string, senderId = 'me', senderType = true) => {
    const newMessage: Message = {
      id: new Date().toISOString(),
      senderId,
      text,
      roomId,
      createdAt: new Date(),
      senderType,
    };

    try {
      const response = await fetch(`http://localhost:3000/api/messageChat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          clientId,
          senderId: newMessage.senderId,
          text: newMessage.text,
          roomId: newMessage.roomId,
          senderType: newMessage.senderType,
        }),
      });

      if (!response.ok) {
        throw new Error(`Error sending message: ${response.statusText}`);
      }

      const savedMessage = await response.json();
      newMessage.id = savedMessage._id; // Update the message ID with the one from the server
      messages.value.push(newMessage);
      console.log(`Message sent to client ${clientId} in room ${roomId}: ${text}`);
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  return {
    messages,
    rooms,
    fetchMessageWithRoomId,
    fetchRoomWithRoomId,
    sendMessage,
  };
});

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
      console.log(roomId);
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
  const fetchRoomWithClientId = async (clientId: string) =>{
    try {
      const response = await fetch(`http://localhost:3000/api/roomChat/client/${clientId}`);
      
      console.log( `clientId ${clientId}`);
      const roomData = await response.json();
      console.log('Fetched room data:', roomData);
  
      // Mapping dữ liệu nhận được thành kiểu `Room`
      const room: Room = {
        id: roomData.id,
        roomKey: roomData.roomKey,
        clientId: roomData.clientId,
        employeeId: roomData.employeeId,
        createdAt: new Date(roomData.createdAt),
        updatedAt: new Date(roomData.updatedAt),
      };
  
      return room; // Trả về phòng đã tìm thấy
    } catch (error) {
      console.error('Error fetching room with clientId:', error);
      return null; // Trả về null nếu xảy ra lỗi
    }
  };
  
  const sendMessage = async (senderId: string, roomId: string, text: string) => {
    const newMessage: Message = {
      id: new Date().toISOString(),
      senderId,
      text,
      roomId,
      createdAt: new Date(),
      senderType:false,
    };
    try {
      const response = await fetch(`http://localhost:3000/api/messageChat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          senderId: newMessage.senderId,
          text: newMessage.text,
          roomId: newMessage.roomId,
          senderType: newMessage.senderType,
        }),
      });

      console.log(response.body);
      const savedMessage = await response.json();
      newMessage.id = savedMessage._id; // Update the message ID with the one from the server
      messages.value.push(newMessage);
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  return {
    messages,
    rooms,
    fetchRoomWithClientId,
    fetchMessageWithRoomId,
    fetchRoomWithRoomId,
    sendMessage,
  };
});

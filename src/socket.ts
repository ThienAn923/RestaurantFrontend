import { io, Socket } from 'socket.io-client';

// Khởi tạo socket với kiểu dữ liệu
const socket: Socket = io('http://localhost:3000', {
    "transports": ["websocket"]
 });

// Xuất socket để sử dụng ở các file khác
export default socket;

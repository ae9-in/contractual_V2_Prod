import { io } from "socket.io-client";
import { API_URL } from "./api";

const fallbackApiUrl = "https://contractual-v2-prod.onrender.com";
const socketUrl = (process.env.EXPO_PUBLIC_SOCKET_URL?.trim() || process.env.EXPO_PUBLIC_API_URL?.trim() || fallbackApiUrl).replace(/\/+$/, "");

const socket = io(socketUrl, {
  autoConnect: false,
  transports: ["websocket"],
});

export const connectSocket = (token: string) => {
  if (!socket.connected) {
    socket.auth = { token };
    socket.connect();
  }
};

export const disconnectSocket = () => {
  if (socket.connected) {
    socket.disconnect();
  }
};

export default socket;

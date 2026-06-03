import { io } from "socket.io-client";
import { SOCKET_BASE_URL } from "../lib/backend-url";

const socket = io(SOCKET_BASE_URL, {
  transports: ["websocket"],
  withCredentials: true,
  auth: {
    token: localStorage.getItem("token"),
  },
});

export const syncSocketAuth = (token?: string) => {
  const nextToken = token || localStorage.getItem("token") || "";

  socket.auth = nextToken ? { token: nextToken } : {};

  if (!socket.connected) {
    socket.connect();
    return;
  }

  socket.disconnect();
  socket.connect();
};

export default socket;
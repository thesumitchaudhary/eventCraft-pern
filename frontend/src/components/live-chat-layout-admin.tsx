"use client";

import { useEffect, useRef, useState } from "react";
import { Circle, Send } from "lucide-react";

import socket from "@/socket-connection/socket";

const API_URL = import.meta.env.VITE_BACKEND_URL;

type ChatMessage = {
  _id?: string;
  createdAt?: string;
  senderId?: string;
  senderRole?: string;
  message?: string;
  text?: string;
  time?: string;
};

const normalizeMessageList = (payload: unknown): ChatMessage[] => {
  if (Array.isArray(payload)) return payload as ChatMessage[];

  if (
    payload &&
    typeof payload === "object" &&
    "data" in payload &&
    Array.isArray((payload as { data?: unknown }).data)
  ) {
    return (payload as { data: ChatMessage[] }).data;
  }

  return [];
};

export default function LiveChatLayoutAdmin() {
  const [isOnline, setIsOnline] = useState(socket.connected);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [ticketId, setTicketId] = useState("");
  const [loading, setLoading] = useState(false);

  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleConnect = () => setIsOnline(true);
    const handleDisconnect = () => setIsOnline(false);

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
    };
  }, []);

  useEffect(() => {
    const handleAdminNotification = (data: { ticketId?: string }) => {
      if (!data?.ticketId) return;

      setTicketId(data.ticketId);
      socket.emit("join_ticket", { ticketId: data.ticketId });
    };

    socket.on("admin_notification", handleAdminNotification);

    return () => {
      socket.off("admin_notification", handleAdminNotification);
    };
  }, []);

  useEffect(() => {
    if (!ticketId) {
      setMessages([]);
      return;
    }

    const fetchMessages = async () => {
      try {
        setLoading(true);

        const res = await fetch(`${API_URL}/index/messages/${ticketId}`, {
          credentials: "include",
        });

        const data = await res.json();
        setMessages(normalizeMessageList(data));
      } catch (err) {
        console.error("Failed to fetch messages", err);
        setMessages([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [ticketId]);

  useEffect(() => {
    const handleReceiveMessage = (data: ChatMessage) => {
      setMessages((prev) => {
        if (!data || typeof data !== "object") {
          return prev;
        }

        const exists = prev.find((msg) => msg._id && msg._id === data._id);
        if (exists) return prev;

        return [...prev, data];
      });
    };

    socket.on("receive_message", handleReceiveMessage);

    return () => {
      socket.off("receive_message", handleReceiveMessage);
    };
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (!message.trim() || !ticketId) return;

    socket.emit("send_message", {
      ticketId,
      message,
    });

    setMessage("");
  };

  return (
    <div className="flex h-[70vh] min-h-96 flex-col rounded-lg border bg-background">
      <div className="border-b p-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-base font-semibold">Admin Support Panel</h2>
          <div className="flex items-center gap-2 text-sm">
            <Circle
              className={`h-3 w-3 ${
                isOnline
                  ? "fill-green-500 text-green-500"
                  : "fill-red-500 text-red-500"
              }`}
            />
            <span className={isOnline ? "text-green-600" : "text-red-500"}>
              {isOnline ? "Online" : "Offline"}
            </span>
          </div>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          {ticketId
            ? `Connected to Ticket: ${ticketId}`
            : "Waiting for escalated tickets..."}
        </p>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {loading && <div className="text-sm text-gray-500">Loading messages...</div>}

        {!loading && !ticketId && (
          <div className="text-sm text-gray-400">No escalated tickets yet...</div>
        )}

        {!loading && ticketId && messages.length === 0 && (
          <div className="text-sm text-gray-400">
            No messages yet. Start this conversation.
          </div>
        )}

        {messages.map((msg, index) => (
          <div
            key={
              msg._id ||
              `${msg.createdAt || "no-time"}-${msg.senderId || "no-sender"}-${index}`
            }
            className={`flex max-w-max flex-col rounded-2xl p-2 ${
              msg.senderRole === "admin"
                ? "ml-auto bg-blue-400 text-white"
                : "bg-gray-200"
            }`}
          >
            <span>{msg.message || msg.text || ""}</span>
            <span className="text-end text-[10px] text-gray-600">
              {msg.createdAt
                ? new Date(msg.createdAt).toLocaleTimeString()
                : msg.time || ""}
            </span>
          </div>
        ))}

        <div ref={bottomRef} />
      </div>

      <div className="flex gap-3 border-t p-4">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              sendMessage();
            }
          }}
          placeholder={ticketId ? "Reply to escalated ticket..." : "Waiting for ticket..."}
          className="flex-1 rounded-md bg-gray-100 px-3 py-2 outline-none"
          disabled={!ticketId}
        />
        <button
          type="button"
          onClick={sendMessage}
          className="rounded-md bg-black p-3 text-white"
          disabled={!ticketId}
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
}
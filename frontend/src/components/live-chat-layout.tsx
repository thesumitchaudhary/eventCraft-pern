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

type LiveChatLayoutProps = {
  ticketId?: string;
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

export default function LiveChatLayout({
  ticketId,
}: LiveChatLayoutProps) {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isOnline, setIsOnline] = useState(socket.connected);
  const [loading, setLoading] = useState(false);
  const [resolvedTicketId, setResolvedTicketId] = useState(ticketId || "");

  const activeTicketId = ticketId || resolvedTicketId;
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (ticketId) return;

    const resolveTicket = async () => {
      try {
        const res = await fetch(`${API_URL}/index/support-ticket`, {
          credentials: "include",
        });

        const data = await res.json();

        if (res.ok && data?.ticketId) {
          setResolvedTicketId(data.ticketId);
        }
      } catch (err) {
        console.error("Failed to resolve ticket", err);
      }
    };

    resolveTicket();
  }, [ticketId]);

  useEffect(() => {
    if (!activeTicketId) return;

    socket.emit("join_ticket", { ticketId: activeTicketId });

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

    const fetchMessages = async () => {
      try {
        setLoading(true);

        const res = await fetch(`${API_URL}/index/messages/${activeTicketId}`, {
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

    return () => {
      socket.off("receive_message", handleReceiveMessage);
    };
  }, [activeTicketId]);

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
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (!message.trim() || !activeTicketId) return;

    socket.emit("send_message", {
      ticketId: activeTicketId,
      message,
    });

    setMessage("");
  };

  return (
    <div className="mt-4 flex h-[70vh] min-h-105 flex-col rounded-lg border bg-background">
      <div className="border-b p-4">
        <div className="flex items-center gap-2 text-sm">
          <Circle
            className={`h-3 ${
              isOnline
                ? "fill-green-500 text-green-500"
                : "fill-red-500 text-red-500"
            }`}
          />
          <span className={isOnline ? "text-green-600" : "text-red-500"}>
            {isOnline ? "Support online" : "Support offline"}
          </span>
        </div>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {loading && (
          <div className="text-sm text-gray-500">Loading messages...</div>
        )}

        {!loading && messages.length === 0 && (
          <div className="text-sm text-gray-400">
            No messages yet. Start conversation.
          </div>
        )}

        {messages.map((msg, index) => (
          <div
            key={
              msg._id ||
              `${msg.createdAt || "no-time"}-${msg.senderId || "no-sender"}-${index}`
            }
            className={`flex max-w-max flex-col rounded-2xl p-2 ${
              msg.senderRole === "customer"
                ? "ml-auto bg-blue-400"
                : "bg-gray-200"
            }`}
          >
            <span>{msg.message || msg.text || ""}</span>
            <span className="text-end text-[10px] text-gray-500">
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
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              sendMessage();
            }
          }}
          placeholder="Type a message..."
          className="flex-1 rounded-md bg-gray-100 px-3 py-2 outline-none"
        />
        <button
          onClick={sendMessage}
          className="rounded-md bg-black p-3 text-white"
          type="button"
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
}
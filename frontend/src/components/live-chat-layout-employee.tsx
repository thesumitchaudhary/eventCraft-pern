"use client";

import { useEffect, useRef, useState } from "react";
import { AlertTriangle, Circle, Send } from "lucide-react";

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

type TicketResponse = {
  ticketId?: string;
  message?: string;
};

type EmployeeLiveChatLayoutProps = {
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

export default function LiveChatLayoutEmployee({
  ticketId,
}: EmployeeLiveChatLayoutProps) {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isOnline, setIsOnline] = useState(socket.connected);
  const [loading, setLoading] = useState(false);
  const [ticketError, setTicketError] = useState("");
  const [resolvedTicketId, setResolvedTicketId] = useState(ticketId || "");

  const activeTicketId = ticketId || resolvedTicketId;
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const authToken = localStorage.getItem("token") || "";

  const resolveTicket = async (): Promise<string> => {
    try {
      const res = await fetch(`${API_URL}/index/support-ticket`, {
        credentials: "include",
        headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
      });

      const data = (await res.json()) as TicketResponse;

      if (res.ok && data?.ticketId) {
        setTicketError("");
        setResolvedTicketId(data.ticketId);
        return data.ticketId;
      }

      setResolvedTicketId("");
      setTicketError(data?.message || "No support ticket assigned right now.");
      return "";
    } catch (err) {
      console.error("Failed to resolve ticket", err);
      setResolvedTicketId("");
      setTicketError("Unable to load support ticket.");
      return "";
    }
  };

  useEffect(() => {
    if (ticketId) return;

    resolveTicket();
  }, [ticketId]);

  useEffect(() => {
    if (!activeTicketId) return;

    socket.emit("join_ticket", { ticketId: activeTicketId });

    const handleReceiveMessage = (data: ChatMessage) => {
      setMessages((prev) => {
        const prevMessages = Array.isArray(prev) ? prev : [];

        if (!data || typeof data !== "object") {
          return prevMessages;
        }

        const exists = prevMessages.find((msg) => msg._id && msg._id === data._id);
        if (exists) return prevMessages;

        return [...prevMessages, data];
      });
    };

    socket.on("receive_message", handleReceiveMessage);

    const fetchMessages = async () => {
      try {
        setLoading(true);

        const res = await fetch(`${API_URL}/index/messages/${activeTicketId}`, {
          credentials: "include",
          headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
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
  }, [activeTicketId, authToken]);

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

  const sendMessage = async () => {
    if (!message.trim()) return;

    let ticketForAction = activeTicketId;

    if (!ticketForAction) {
      ticketForAction = await resolveTicket();
    }

    if (!ticketForAction) {
      setTicketError((prev) => prev || "No active ticket assigned, message not sent.");
      return;
    }

    socket.emit("send_message", {
      ticketId: ticketForAction,
      message,
    });

    setMessage("");
  };

  const handleEscalate = async () => {
    let ticketForAction = activeTicketId;

    if (!ticketForAction) {
      ticketForAction = await resolveTicket();
    }

    if (!ticketForAction) {
      setTicketError((prev) => prev || "No active ticket assigned, escalation unavailable.");
      return;
    }

    socket.emit("escalate", { ticketId: ticketForAction });
  };

  return (
    <div className="mt-4 flex h-[70vh] min-h-105 flex-col rounded-lg border bg-background">
      <div className="border-b p-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-sm">
            <Circle
              className={`h-3 ${
                isOnline
                  ? "fill-green-500 text-green-500"
                  : "fill-red-500 text-red-500"
              }`}
            />
            <span className={isOnline ? "text-green-600" : "text-red-500"}>
              {isOnline ? "Online" : "Offline"}
            </span>
          </div>

          <button
            type="button"
            onClick={handleEscalate}
            className="inline-flex items-center gap-1 rounded-md bg-red-500 px-3 py-1 text-xs text-white hover:bg-red-600"
          >
            <AlertTriangle size={14} />
            Escalate
          </button>
        </div>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {loading && (
          <div className="text-sm text-gray-500">Loading messages...</div>
        )}

        {!loading && ticketError && (
          <div className="text-sm text-amber-600">{ticketError}</div>
        )}

        {!loading && !ticketError && messages.length === 0 && (
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
              msg.senderRole === "employee"
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
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              sendMessage();
            }
          }}
          placeholder="Reply to customer..."
          className="flex-1 rounded-md bg-gray-100 px-3 py-2 outline-none"
        />
        <button
          type="button"
          onClick={sendMessage}
          className="rounded-md bg-black p-3 text-white"
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
}

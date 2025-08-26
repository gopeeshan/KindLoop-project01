import axios from "axios";

const BASE = "http://localhost/KindLoop-project01/Backend";

const client = axios.create({
  baseURL: BASE,
  withCredentials: true, // send session cookie
  headers: { "Content-Type": "application/json" },
});

export interface ChatMessage {
  messageID: number;
  senderID: number;
  receiverID: number;
  donationID: number | null;
  message: string;
  timestamp: string;
  is_read: number;
  senderName?: string;
  receiverName?: string;
}

export interface ConversationItem {
  otherUserID: number;
  otherUserName: string;
  donationID: number | null;
  last_message: string;
  last_timestamp: string;
  unread: number;
}

export async function sendMessage(payload: {
  receiverID: number;
  donationID?: number | null;
  message: string;
}) {
  const res = await client.post(`/messages.php?action=send`, payload);
  return res.data as {
    success: boolean;
    message: string;
    data?: ChatMessage;
  };
}

export async function getHistory(params: {
  peerId: number;
  donationId?: number | null;
}) {
  const q = new URLSearchParams();
  q.set("peerId", String(params.peerId));
  if (params.donationId !== undefined && params.donationId !== null) {
    q.set("donationId", String(params.donationId));
  }
  const res = await client.get(`/messages.php?action=history&${q.toString()}`);
  return res.data as {
    success: boolean;
    data?: {
      messages: ChatMessage[];
      participants: { userID: number; fullName: string }[];
      viewerID: number;
      unread: number;
    };
  };
}

export async function markRead(payload: {
  peerId: number;
  donationId?: number | null;
}) {
  const res = await client.post(`/messages.php?action=mark-read`, payload);
  return res.data as {
    success: boolean;
    updated?: number;
  };
}

export async function getConversations() {
  const res = await client.get(`/messages.php?action=conversations`);
  return res.data as {
    success: boolean;
    data: ConversationItem[];
  };
}
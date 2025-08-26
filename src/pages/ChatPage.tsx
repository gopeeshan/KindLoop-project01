import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import UserList from "./UserList";
import ChatWindow from "./ChatWindow";
import MessageInput from "./MessageInput";

interface User {
  userID: number;
  fullName: string;
  email?: string;
  avatar?: string | null;
}

interface Message {
  id: number;
  sender_id: number;
  receiver_id: number;
  content: string;
  timestamp: string;
}

const ChatPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pollingRef = useRef<number | null>(null);

  const currentUserId = parseInt(localStorage.getItem("userID") || "0");

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (selectedUser) {
      fetchMessages();
      startPolling();
    } else {
      stopPolling();
    }

    return () => stopPolling();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedUser]);

  const fetchUsers = async () => {
    try {
      const res = await axios.get(
        `http://localhost/KindLoop-project01/Backend/get_users.php?currentUser=${currentUserId}`
      );
      setUsers(res.data.users || []);
    } catch (err) {
      console.error("Error fetching users", err);
      setError("Failed to load users");
    }
  };

  const fetchMessages = async () => {
    if (!selectedUser) return;
    setLoading(true);
    try {
      const res = await axios.get(
        `http://localhost/KindLoop-project01/Backend/get_messages.php?sender_id=${currentUserId}&receiver_id=${selectedUser.userID}`
      );
      setMessages(res.data.messages || []);
    } catch (err) {
      console.error("Error fetching messages", err);
      setError("Failed to load messages");
    }
    setLoading(false);
  };

  const startPolling = () => {
    stopPolling();
    // poll every 2 seconds
    pollingRef.current = window.setInterval(() => {
      fetchMessages();
    }, 2000);
  };

  const stopPolling = () => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  };

  const handleSelectUser = (user: User) => {
    setSelectedUser(user);
    setMessages([]);
  };

  const handleSendMessage = async (content: string) => {
    if (!selectedUser) return;
    try {
      const res = await axios.post(
        `http://localhost/KindLoop-project01/Backend/send_message.php`,
        {
          sender_id: currentUserId,
          receiver_id: selectedUser.userID,
          content,
        }
      );

      if (res.data.success) {
        // Append returned message (if available) or refetch
        if (res.data.message) {
          setMessages((m) => [...m, res.data.message]);
        } else {
          fetchMessages();
        }
      }
    } catch (err) {
      console.error("Error sending message", err);
      setError("Failed to send message");
    }
  };

  return (
    <div className="flex h-full">
      <div className="w-1/4 border-r">
        <UserList
          users={users}
          selectedUserId={selectedUser?.userID || null}
          onSelect={handleSelectUser}
        />
      </div>

      <div className="flex-1 flex flex-col">
        <ChatWindow
          messages={messages}
          currentUserId={currentUserId}
          loading={loading}
          selectedUser={selectedUser}
        />

        <div className="border-t p-4">
          <MessageInput onSend={handleSendMessage} disabled={!selectedUser} />
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
import React, { useEffect, useState, useRef } from "react";
import { useLocation } from "react-router-dom";
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
  const location = useLocation();
  const currentUserId = parseInt(localStorage.getItem("userID") || "0");

  // Parse ?user=... query param (donor user id)
  const urlParams = new URLSearchParams(location.search);
  const preselectUserId = parseInt(urlParams.get("user") || "0");

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // When users are fetched, try to auto-select the preselected user if present
  useEffect(() => {
    if (preselectUserId && users.length > 0) {
      const found = users.find((u) => u.userID === preselectUserId);
      if (found) {
        handleSelectUser(found);
      } else {
        // fallback: try fetching the user details by id
        fetchUserById(preselectUserId).then((user) => {
          if (user) {
            handleSelectUser(user);
          } else {
            // fallback minimal selection so chat can still use ID
            setSelectedUser({ userID: preselectUserId, fullName: "User", avatar: null });
          }
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [users, preselectUserId]);

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

  // fetch a single user's details by ID
  const fetchUserById = async (id: number): Promise<User | null> => {
    try {
      const res = await axios.get(
        `http://localhost/KindLoop-project01/Backend/get_user_by_id.php?userID=${id}`
      );
      if (res.data && res.data.success) {
        return res.data.user as User;
      }
    } catch (err) {
      // ignore
    }
    return null;
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
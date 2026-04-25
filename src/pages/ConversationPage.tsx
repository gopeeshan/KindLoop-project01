import React, { useState, useEffect } from "react";
import axios from "axios";

interface Message {
  messageID: number;
  senderID: number;
  receiverID: number;
  donationID?: number | null;
  message: string;
  timestamp: string;
  is_read: number;
  senderName: string;
}

const ConversationPage: React.FC = () => {
  const [userA, setUserA] = useState<string>("");
  const [userB, setUserB] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (userA && userB) {
      setLoading(true);
      axios
        .get("http://localhost/KindLoop-project01/Backend/getMessages.php", {
          params: { userA, userB },
          withCredentials: true,
        })
        .then((res) => {
          if (res.data.success && Array.isArray(res.data.messages)) {
            setMessages(res.data.messages);
          } else {
            setMessages([]);
          }
        })
        .catch((err) => {
          console.error("Error fetching messages", err);
          setMessages([]);
        })
        .finally(() => setLoading(false));
    }
  }, [userA, userB]);

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h2 className="text-xl font-bold mb-4">Search Conversation</h2>

      {/* Search Form */}
      <div className="flex gap-2 mb-4">
        <input
          type="number"
          placeholder="User A ID"
          value={userA}
          onChange={(e) => setUserA(e.target.value)}
          className="border p-2 rounded w-1/2"
        />
        <input
          type="number"
          placeholder="User B ID"
          value={userB}
          onChange={(e) => setUserB(e.target.value)}
          className="border p-2 rounded w-1/2"
        />
      </div>

      {/* Chat Box */}
      {loading ? (
        <p>Loading messages...</p>
      ) : (
        <div className="border p-4 rounded bg-gray-50 min-h-[300px]">
          {messages.length > 0 ? (
            messages.map((msg) => (
              <div
                key={msg.messageID}
                className={`p-2 mb-2 rounded max-w-xs ${
                  msg.senderID.toString() === userA
                    ? "bg-green-100 ml-auto text-right"
                    : "bg-red-100 mr-auto text-left"
                }`}
              >
                <strong>{msg.senderName}:</strong> {msg.message}
                <div className="text-xs text-gray-500">{msg.timestamp}</div>
              </div>
            ))
          ) : (
            <p>No messages found</p>
          )}
        </div>
      )}
    </div>
  );
};

export default ConversationPage;

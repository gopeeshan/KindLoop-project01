import React, { useEffect, useRef } from "react";

interface Message {
  id: number;
  sender_id: number;
  receiver_id: number;
  content: string;
  timestamp: string;
}

interface User {
  userID: number;
  fullName: string;
  avatar?: string | null;
}

interface Props {
  messages: Message[];
  currentUserId: number;
  loading: boolean;
  selectedUser: User | null;
}

const ChatWindow: React.FC<Props> = ({ messages, currentUserId, loading, selectedUser }) => {
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex-1 p-4 overflow-y-auto">
      <div className="mb-4 font-semibold">{selectedUser ? selectedUser.fullName : "Select a chat"}</div>

      {loading && <div>Loading...</div>}
      <div>
        {messages.map((m) => {
          const mine = m.sender_id === currentUserId;
          return (
            <div key={m.id} className={`mb-2 flex ${mine ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[70%] p-2 rounded ${mine ? "bg-blue-500 text-white" : "bg-slate-200"}`}>
                <div className="whitespace-pre-wrap">{m.content}</div>
                <div className="text-xs mt-1 text-right opacity-60">{new Date(m.timestamp).toLocaleTimeString()}</div>
              </div>
            </div>
          );
        })}
        <div ref={endRef} />
      </div>
    </div>
  );
};

export default ChatWindow;
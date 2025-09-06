import React, { useEffect, useState } from "react";
import axios from "axios";

interface Conversation {
  userID: number;
  username: string;
  profilePic: string;
  last_message: string;
  last_message_time: string;
  unread_count: number;
}

const ConversationList: React.FC<{ userID: number; onSelect: (id: number) => void }> = ({ userID, onSelect }) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);

  useEffect(() => {
    axios
      .get(`http://localhost/Chat-System/get-conversations.php?userID=${userID}`)
      .then((res) => {
        if (res.data.success) {
          setConversations(res.data.conversations);
        }
      })
      .catch((err) => console.error(err));
  }, [userID]);

  return (
    <div className="w-1/3 border-r h-screen overflow-y-auto">
      {conversations.map((c) => (
        <div
          key={c.userID}
          className="flex items-center p-3 border-b cursor-pointer hover:bg-gray-100"
          onClick={() => onSelect(c.userID)}
        >
          <img src={c.profilePic} alt={c.username} className="w-10 h-10 rounded-full mr-3" />
          <div className="flex-1">
            <div className="flex justify-between">
              <span className="font-semibold">{c.username}</span>
              <span className="text-xs text-gray-500">{new Date(c.last_message_time).toLocaleTimeString()}</span>
            </div>
            <div className="text-sm text-gray-600">{c.last_message}</div>
          </div>
          {c.unread_count > 0 && (
            <span className="ml-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
              {c.unread_count}
            </span>
          )}
        </div>
      ))}
    </div>
  );
};

export default ConversationList;

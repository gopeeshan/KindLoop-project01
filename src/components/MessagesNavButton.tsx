import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";

type Conversation = { unread: number };

const MessagesNavButton: React.FC = () => {
  const currentUserID = parseInt(localStorage.getItem("userID") || "0", 10);
  const [convos, setConvos] = useState<Conversation[]>([]);

  useEffect(() => {
    if (!currentUserID) return;

    const load = async () => {
      try {
        const res = await axios.get(
          `http://localhost/KindLoop-project01/Backend/Chat-System/get-conversations-list.php`,
          { params: { userID: currentUserID }, withCredentials: true }
        );
        if (res.data?.success && Array.isArray(res.data.conversations)) {
          setConvos(res.data.conversations);
        }
      } catch {
        // ignore
      }
    };

    load();
    const id = setInterval(load, 7000);
    return () => clearInterval(id);
  }, [currentUserID]);

  const totalUnread = useMemo(
    () => convos.reduce((sum, c) => sum + (Number(c.unread) || 0), 0),
    [convos]
  );

  return (
    <Link to="/messages" className="relative inline-flex items-center" aria-label="Messages">
      <MessageCircle className="h-5 w-5" />
      {totalUnread > 0 && (
        <span className="absolute -top-1 -right-2 min-w-5 h-5 px-1 rounded-full bg-blue-600 text-white text-[10px] font-semibold flex items-center justify-center">
          {totalUnread}
        </span>
      )}
    </Link>
  );
};

export default MessagesNavButton;
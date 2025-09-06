import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import ChatBox from "../components/ChatBox";

type Conversation = {
  messageID: number;
  senderID: number;
  receiverID: number;
  donationID: number | null;
  message: string;
  timestamp: string;
  is_read: number;
  otherUserID: number;
  otherUserName?: string;
  unread: number;
};

const MessagesPage: React.FC = () => {
  const currentUserID = parseInt(localStorage.getItem("userID") || "0", 10);
  const [loading, setLoading] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [error, setError] = useState<string>("");
  const [selectedPeer, setSelectedPeer] = useState<number | null>(null);
  const [selectedDonationId, setSelectedDonationId] = useState<number | null>(null);
  const [chatOpen, setChatOpen] = useState(false);

  useEffect(() => {
    if (!currentUserID) return;
    const load = async () => {
      setLoading(true);
      try {
        const res = await axios.get(
          `http://localhost/KindLoop-project01/Backend/Chat-System/get-conversations-list.php`,
          { params: { userID: currentUserID }, withCredentials: true }
        );
        if (res.data?.success && Array.isArray(res.data.conversations)) {
          setConversations(res.data.conversations);
          setError("");
        } else {
          setError(res.data?.message || "Failed to fetch conversations.");
        }
      } catch (e) {
        setError("Server error while fetching conversations.");
      } finally {
        setLoading(false);
      }
    };

    load();
    const id = setInterval(load, 5000);
    return () => clearInterval(id);
  }, [currentUserID]);

  const totalUnread = useMemo(
    () => conversations.reduce((sum, c) => sum + (Number(c.unread) || 0), 0),
    [conversations]
  );

  const openChat = (peerId: number, donationId: number | null) => {
    setSelectedPeer(peerId);
    // If you want the chat filtered by the last donation thread, keep donationId.
    // Or set to null to show the full history across donations with this peer.
    setSelectedDonationId(donationId);
    setChatOpen(true);
  };

  if (!currentUserID) {
    return <div className="p-4">Please sign in to view your messages.</div>;
  }

  return (
    <div className="max-w-5xl mx-auto p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Messages</h1>
        <div className="text-sm text-gray-500">
          Unread: <span className="font-medium">{totalUnread}</span>
        </div>
      </div>

      {loading && <div>Loading conversations…</div>}
      {error && !loading && <div className="text-red-600">{error}</div>}

      <div className="bg-white border rounded-lg divide-y">
        {conversations.length === 0 && !loading ? (
          <div className="p-4 text-gray-500">No conversations yet.</div>
        ) : (
          conversations.map((c) => {
            const name = c.otherUserName || `User ${c.otherUserID}`;
            const last = c.message || "";
            const ts = new Date(c.timestamp).toLocaleString();
            return (
              <button
                key={`${c.otherUserID}-${c.messageID}`}
                className="w-full text-left p-4 hover:bg-gray-50 flex items-center gap-3"
                onClick={() => openChat(c.otherUserID, c.donationID ?? null)}
                aria-label={`Open chat with ${name}`}
                title={`Open chat with ${name}`}
              >
                <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                  <span className="text-sm font-medium">
                    {name.substring(0, 1).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div className="font-medium truncate">{name}</div>
                    <div className="text-xs text-gray-500">{ts}</div>
                  </div>
                  <div className="text-sm text-gray-600 truncate">{last}</div>
                  {c.donationID ? (
                    <div className="mt-1 text-xs text-gray-500">
                      donationID: {c.donationID}
                    </div>
                  ) : null}
                </div>
                {c.unread > 0 ? (
                  <span className="ml-2 inline-flex items-center justify-center min-w-6 h-6 px-2 rounded-full bg-blue-600 text-white text-xs font-semibold">
                    {c.unread}
                  </span>
                ) : null}
              </button>
            );
          })
        )}
      </div>

      {selectedPeer !== null && (
        <ChatBox
          open={chatOpen}
          onClose={() => setChatOpen(false)}
          currentUserID={currentUserID}
          otherUserID={selectedPeer}
          donationID={selectedDonationId}
          otherUserName={conversations.find((c) => c.otherUserID === selectedPeer)?.otherUserName}
        />
      )}
    </div>
  );
};

export default MessagesPage;
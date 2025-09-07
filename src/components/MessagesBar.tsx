import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { MessageCircle, X } from "lucide-react";
import ChatBox from "@/components/ChatBox";
import { useNavigate } from "react-router-dom";

type ConversationItem = {
  otherUserID: number;
  otherUserName?: string;
  donationID?: number | null;
  message: string;
  timestamp: string;
  unread: number;
};

interface MessagesBarProps {
  currentUserID: number | undefined;
  className?: string;
  openAsPage?: boolean; // new
}

const MessagesBar: React.FC<MessagesBarProps> = ({
  currentUserID,
  className,
  openAsPage = false,
}) => {
  const navigate = useNavigate();

  const [openPanel, setOpenPanel] = useState(false);
  const [loading, setLoading] = useState(false);
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [error, setError] = useState<string>("");

  // ChatBox state (only used when not opening as a page)
  const [chatOpen, setChatOpen] = useState(false);
  const [selectedPeer, setSelectedPeer] = useState<number | null>(null);
  const [selectedDonationId, setSelectedDonationId] = useState<number | null>(null);
  const [selectedPeerName, setSelectedPeerName] = useState<string | undefined>(undefined);

  const totalUnread = useMemo(
    () => conversations.reduce((sum, c) => sum + (Number(c.unread) || 0), 0),
    [conversations]
  );

  useEffect(() => {
    if (!currentUserID) return;

    let cancelled = false;
    const load = async () => {
      try {
        setLoading(true);
        const res = await axios.get(
          `http://localhost/KindLoop-project01/Backend/Chat-System/get-conversations-list.php`,
          { params: { userID: currentUserID }, withCredentials: true }
        );
        if (!cancelled) {
          if (res.data?.success && Array.isArray(res.data.conversations)) {
            setConversations(res.data.conversations);
            setError("");
          } else {
            setError(res.data?.message || "Failed to fetch conversations.");
          }
        }
      } catch (e) {
        if (!cancelled) setError("Server error while fetching conversations.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    const id = setInterval(load, 8000); // refresh every 8s
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [currentUserID]);

  const openChat = async (peerId: number, donationId: number | null, peerName?: string) => {
    if (openAsPage) {
      const params = new URLSearchParams();
      params.set("peerId", String(peerId));
      if (donationId !== null) params.set("donationId", String(donationId));
      if (peerName) params.set("name", peerName);
      navigate(`/messages?${params.toString()}`);
      return;
    }

    setSelectedPeer(peerId);
    setSelectedDonationId(donationId);
    setSelectedPeerName(peerName);
    setChatOpen(true);

    // Best-effort mark-read
    try {
      await axios.post(
        `http://localhost/KindLoop-project01/Backend/Chat-System/mark-read.php`,
        { receiverID: currentUserID, senderID: peerId },
        { withCredentials: true }
      );
    } catch {
      // non-fatal
    }
  };

  if (!currentUserID) return null;

  return (
    <div className={`relative ${className || ""}`}>
      <button
        type="button"
        onClick={() => {
          if (openAsPage) {
            navigate("/messages");
          } else {
            setOpenPanel((o) => !o);
          }
        }}
        className="inline-flex items-center gap-2 px-3 py-2 rounded-md border border-gray-300 bg-white hover:bg-gray-50"
        aria-label="Open messages"
      >
        <MessageCircle className="h-4 w-4 text-primary" />
        <span className="text-sm font-medium">Messages</span>
        {totalUnread > 0 && (
          <span className="ml-1 text-xs px-2 py-0.5 rounded-full bg-violet-500 text-white">
            {totalUnread}
          </span>
        )}
      </button>

      {openPanel && !openAsPage && (
        <div className="absolute right-0 mt-2 w-96 max-w-[90vw] bg-white border border-gray-200 rounded-md shadow-lg overflow-hidden z-50">
          <div className="flex items-center justify-between px-3 py-2 border-b">
            <div className="text-sm font-semibold">Recent Conversations</div>
            <button
              type="button"
              onClick={() => setOpenPanel(false)}
              aria-label="Close"
              className="p-1 rounded hover:bg-gray-100"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {loading && (
            <div className="p-3 text-sm text-gray-500">Loading…</div>
          )}
          {error && !loading && (
            <div className="p-3 text-sm text-red-600">{error}</div>
          )}

          {!loading && !error && conversations.length === 0 && (
            <div className="p-3 text-sm text-gray-500">No conversations yet.</div>
          )}

          <div className="max-h-96 overflow-y-auto divide-y">
            {conversations.map((c, idx) => {
              const name = c.otherUserName || `User ${c.otherUserID}`;
              const last = c.message || "";
              const ts = c.timestamp ? new Date(c.timestamp).toLocaleString() : "";
              const unread = Number(c.unread) || 0;
              return (
                <button
                  key={`${c.otherUserID}-${idx}`}
                  className="w-full text-left px-3 py-2 hover:bg-gray-50 flex items-center gap-3"
                  onClick={() => openChat(c.otherUserID, c.donationID ?? null, c.otherUserName)}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <div className="truncate font-medium">{name}</div>
                      <div className="text-[11px] text-gray-500 shrink-0">{ts}</div>
                    </div>
                    <div className="text-xs text-gray-600 truncate">{last}</div>
                  </div>
                  {unread > 0 && (
                    <span className="ml-2 shrink-0 bg-violet-600 text-white text-[10px] px-2 py-0.5 rounded-full">
                      {unread}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {!openAsPage && (
        <ChatBox
          open={chatOpen}
          onClose={() => setChatOpen(false)}
          currentUserID={currentUserID}
          otherUserID={selectedPeer ?? 0}
          donationID={selectedDonationId ?? 0}
          otherUserName={selectedPeerName}
        />
      )}
    </div>
  );
};

export default MessagesBar;
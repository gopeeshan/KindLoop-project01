import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import ChatBox from "../components/ChatBox";
import { useSearchParams } from "react-router-dom";

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

  // Resolve donation titles for any donationIDs shown in conversations
  const [donationTitles, setDonationTitles] = useState<Record<number, string>>(
    {}
  );

  // Chat popup state
  const [selectedPeer, setSelectedPeer] = useState<number | null>(null);
  const [selectedDonationId, setSelectedDonationId] = useState<number | null>(
    null
  );
  const [chatOpen, setChatOpen] = useState(false);

  const [searchParams] = useSearchParams();

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
    // You can re-enable polling if needed:
    // const id = setInterval(load, 8000);
    // return () => clearInterval(id);
  }, [currentUserID]);

  // Auto-open chat from URL (?peerId=...&donationId=...)
  useEffect(() => {
    const peerId = searchParams.get("peerId");
    const donationId = searchParams.get("donationId");
    if (peerId) {
      setSelectedPeer(Number(peerId));
      setSelectedDonationId(donationId ? Number(donationId) : null);
      setChatOpen(true);
    }
  }, [searchParams]);

  // Resolve donation titles for conversations
  useEffect(() => {
    const ids = Array.from(
      new Set(
        conversations
          .map((c) => c.donationID)
          .filter((id): id is number => typeof id === "number")
      )
    ).filter((id) => donationTitles[id] === undefined);

    if (ids.length === 0) return;

    let cancelled = false;
    async function loadTitles() {
      try {
        const results = await Promise.all(
          ids.map(async (id) => {
            try {
              const res = await fetch(
                `http://localhost/KindLoop-project01/Backend/get-donation-by-id.php?DonationID=${id}`
              );
              const json = await res.json();
              const title =
                json?.status === "success" && json?.data?.title
                  ? json.data.title
                  : `Donation #${id}`;
              return [id, title] as const;
            } catch {
              return [id, `Donation #${id}`] as const;
            }
          })
        );
        if (!cancelled) {
          setDonationTitles((prev) => {
            const next = { ...prev };
            results.forEach(([id, title]) => {
              next[id] = title;
            });
            return next;
          });
        }
      } catch {
        // ignore; fallback titles will be used
      }
    }
    loadTitles();
    return () => {
      cancelled = true;
    };
  }, [conversations, donationTitles]);

  const totalUnread = useMemo(
    () => conversations.reduce((sum, c) => sum + (Number(c.unread) || 0), 0),
    [conversations]
  );

  const openChat = (peerId: number, donationId: number | null) => {
    setSelectedPeer(peerId);
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
            const ts = new Date(c.timestamp).toLocaleString();
            const last = c.message || "";
            const title =
              c.donationID != null
                ? donationTitles[c.donationID] ?? "…"
                : undefined;

            return (
              <button
                key={`${c.otherUserID}-${c.donationID ?? "none"}`}
                className="w-full p-3 flex items-center justify-between hover:bg-gray-50 text-left"
                onClick={() => openChat(c.otherUserID, c.donationID)}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div className="font-medium truncate">
                      {c.otherUserName || `User ${c.otherUserID}`}
                    </div>
                    <div className="text-xs text-gray-500">{ts}</div>
                  </div>
                  <div className="text-sm text-gray-600 truncate">{last}</div>
                  {title ? (
                    <div className="mt-1 text-xs text-gray-500">
                      About: {title}
                    </div>
                  ) : null}
                </div>
                {c.unread > 0 ? (
                  <span className="ml-2 inline-flex items-center justify-center min-w-6 h-6 px-2 rounded-full bg-violet-600 text-white text-xs font-semibold">
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
          otherUserName={
            conversations.find(
              (c) =>
                c.otherUserID === selectedPeer &&
                (selectedDonationId == null || c.donationID === selectedDonationId)
            )?.otherUserName
          }
        />
      )}
    </div>
  );
};

export default MessagesPage;
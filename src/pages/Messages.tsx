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

const BASE_DELAY_MS = 2000;
const MAX_DELAY_MS = 60000;

const MessagesPage: React.FC = () => {
  const currentUserID = parseInt(localStorage.getItem("userID") || "0", 10);
  const [loading, setLoading] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [error, setError] = useState<string>("");
  const [selectedPeer, setSelectedPeer] = useState<number | null>(null);
  const [selectedDonationId, setSelectedDonationId] = useState<number | null>(null);
  const [chatOpen, setChatOpen] = useState(false);

  const [searchParams] = useSearchParams();

  useEffect(() => {
    if (!currentUserID) return;

    let delay = BASE_DELAY_MS;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    let stopped = false;
    let firstRun = true;
    let controller: AbortController | null = null;

    const computeSignature = (items: Conversation[]) =>
      items.map((c) => `${c.otherUserID}:${c.messageID}:${c.unread}:${c.timestamp}`).join("|");

    let lastSig = computeSignature(conversations);

    const scheduleNext = () => {
      if (stopped) return;
      timeoutId = setTimeout(poll, delay);
    };

    const poll = async () => {
      if (stopped) return;

      if (controller) controller.abort();
      controller = new AbortController();

      if (firstRun) setLoading(true);

      try {
        const res = await axios.get(
          `http://localhost/KindLoop-project01/Backend/Chat-System/get-conversations-list.php`,
          {
            params: { userID: currentUserID },
            withCredentials: true,
            signal: controller.signal,
          }
        );

        if (res.data?.success && Array.isArray(res.data.conversations)) {
          const newItems: Conversation[] = res.data.conversations;
          const newSig = computeSignature(newItems);
          const hasChanged = newSig !== lastSig;

          if (hasChanged) {
            setConversations(newItems);
            lastSig = newSig;
            delay = BASE_DELAY_MS; // reset on new data
          } else {
            delay = Math.min(delay * 2, MAX_DELAY_MS); // backoff when no changes
          }
          setError("");
        } else {
          // Treat unexpected shape as a transient failure -> backoff
          setError(res.data?.message || "Failed to fetch conversations.");
          delay = Math.min(delay * 2, MAX_DELAY_MS);
        }
      } catch (e) {
        if ((e as any)?.name === "CanceledError") {
          // request was aborted during cleanup or next poll; don't adjust delay
        } else {
          setError("Server error while fetching conversations.");
          delay = Math.min(delay * 2, MAX_DELAY_MS);
        }
      } finally {
        if (firstRun) {
          setLoading(false);
          firstRun = false;
        }
        scheduleNext();
      }
    };

    // Kick off the loop
    poll();

    return () => {
      stopped = true;
      if (timeoutId) clearTimeout(timeoutId);
      if (controller) controller.abort();
    };
  }, [currentUserID]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const peerId = searchParams.get("peerId");
    const donationId = searchParams.get("donationId");
    if (peerId) {
      setSelectedPeer(Number(peerId));
      setSelectedDonationId(donationId ? Number(donationId) : null);
      setChatOpen(true);
    }
  }, [searchParams]);

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
          otherUserName={conversations.find((c) => c.otherUserID === selectedPeer)?.otherUserName}
        />
      )}
    </div>
  );
};

export default MessagesPage;
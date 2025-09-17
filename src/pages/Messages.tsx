import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import ChatBox from "@/components/ChatBox";
import { useToast } from "@/components/ui/use-toast";
import { useSearchParams } from "react-router-dom";

type Conversation = {
  otherUserID: number;
  otherUserName: string;
  donationID: number | null;
  message: string;
  timestamp: string;
  unread: number | string;
};

const BASE_DELAY_MS = 2000;
const MAX_DELAY_MS = 60000;

const Messages = () => {
  const { toast } = useToast();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [donationTitles, setDonationTitles] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedPeer, setSelectedPeer] = useState<number | null>(null);
  const [selectedDonationId, setSelectedDonationId] = useState<number | null>(null);
  const [chatOpen, setChatOpen] = useState(false);

  const [searchParams] = useSearchParams();

  const [currentUserID, setCurrentUserID] = useState<number | null>(null);

  useEffect(() => {
    fetch("http://localhost/KindLoop-project01/Backend/profile.php", {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        setCurrentUserID(data?.userID ?? null);
      })
      .catch(() => setCurrentUserID(null));
  }, []);

  // Poll conversations list with adaptive backoff and only update on changes
  useEffect(() => {
    if (!currentUserID) return;

    let delay = BASE_DELAY_MS;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    let stopped = false;
    let firstRun = true;
    let controller: AbortController | null = null;

    const computeSignature = (items: Conversation[]) =>
      items
        .map(
          (c) =>
            `${c.otherUserID}:${c.donationID ?? "none"}:${String(c.unread)}:${c.timestamp}:${c.message}`
        )
        .join("|");

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
          { params: { userID: currentUserID }, withCredentials: true, signal: controller.signal }
        );

        if (res.data?.success && Array.isArray(res.data?.conversations)) {
          const newItems: Conversation[] = res.data.conversations;
          const newSig = computeSignature(newItems);
          const hasChanged = newSig !== lastSig;

          if (hasChanged) {
            setConversations(newItems);
            lastSig = newSig;
            delay = BASE_DELAY_MS; // reset delay on fresh data
          } else {
            delay = Math.min(delay * 2, MAX_DELAY_MS); // backoff if no change
          }
          setError(null);
        } else {
          setError(res.data?.message || "Failed to fetch conversations.");
          delay = Math.min(delay * 2, MAX_DELAY_MS);
        }
      } catch (e: any) {
        if (e?.name === "CanceledError") {
          // aborted due to next poll/cleanup; do nothing
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

    // start loop
    poll();

    return () => {
      stopped = true;
      if (timeoutId) clearTimeout(timeoutId);
      if (controller) controller.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUserID]);

  // Auto-open chat from URL: ?peerId=...&donationId=...
  useEffect(() => {
    const peerId = searchParams.get("peerId");
    const donationId = searchParams.get("donationId");
    if (peerId) {
      const p = Number(peerId);
      const d = donationId ? Number(donationId) : null;
      setSelectedPeer(p);
      setSelectedDonationId(d);
      setChatOpen(true);

      // Optimistically clear unread for this thread for immediate UX
      setConversations((prev) =>
        prev.map((c) =>
          c.otherUserID === p && (c.donationID ?? null) === (d ?? null)
            ? { ...c, unread: 0 }
            : c
        )
      );
    }
  }, [searchParams]);

  // Load donation titles for conversations with donationID
  useEffect(() => {
    const idsToFetch = conversations
      .map((c) => c.donationID)
      .filter((id): id is number => id != null && !donationTitles[id]);

    if (idsToFetch.length === 0) return;

    let cancelled = false;

    const fetchTitles = async () => {
      for (const id of idsToFetch) {
        try {
          const res = await axios.get(
            `http://localhost/KindLoop-project01/Backend/get-donation-by-id.php`,
            { params: { DonationID: id }, withCredentials: true }
          );
          if (!cancelled && res.data?.status === "success" && res.data?.data?.title) {
            setDonationTitles((prev) => ({ ...prev, [id]: res.data.data.title }));
          }
        } catch {
          // ignore failure for title fetch
        }
      }
    };

    fetchTitles();
    return () => {
      cancelled = true;
    };
  }, [conversations, donationTitles]);

  const totalUnread = useMemo(
    () => conversations.reduce((sum, c) => sum + (Number(c.unread) || 0), 0),
    [conversations]
  );

  const openChat = (peerId: number, donationId: number | null) => {
    if (peerId === currentUserID) {
      toast({
        title: "This is your post",
        description: "You can’t message yourself.",
        variant: "destructive",
      });
      return;
    }
    setSelectedPeer(peerId);
    setSelectedDonationId(donationId);
    setChatOpen(true);

    // Optimistically clear unread for this thread immediately
    setConversations((prev) =>
      prev.map((c) =>
        c.otherUserID === peerId && (c.donationID ?? null) === (donationId ?? null)
          ? { ...c, unread: 0 }
          : c
      )
    );
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
              c.donationID != null ? donationTitles[c.donationID] ?? "…" : undefined;

            return (
              <button
                key={`${c.otherUserID}-${c.donationID ?? "none"}`}
                className="w-full p-3 flex items-center justify-between hover:bg-gray-50 text-left"
                onClick={() => openChat(c.otherUserID, c.donationID)}
                aria-label={`Open chat with ${c.otherUserName || `User ${c.otherUserID}`}`}
                title={`Open chat with ${c.otherUserName || `User ${c.otherUserID}`}`}
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
                    <div className="mt-1 text-xs text-gray-500">About: {title}</div>
                  ) : null}
                </div>
                {Number(c.unread) > 0 ? (
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
                (c.donationID ?? null) === (selectedDonationId ?? null)
            )?.otherUserName
          }
        />
      )}
    </div>
  );
};

export default Messages;
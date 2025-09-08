import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import ChatBox from "@/components/ChatBox";
import { useToast } from "@/components/ui/use-toast";

type Conversation = {
  otherUserID: number;
  otherUserName: string;
  donationID: number | null;
  message: string;
  timestamp: string;
  unread: number | string;
};

const Messages = () => {
  const { toast } = useToast();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [donationTitles, setDonationTitles] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedPeer, setSelectedPeer] = useState<number | null>(null);
  const [selectedDonationId, setSelectedDonationId] = useState<number | null>(null);
  const [chatOpen, setChatOpen] = useState(false);

  const currentUserID = useMemo(
    () => Number(localStorage.getItem("userID") || "0"),
    []
  );

  // Load conversations
  useEffect(() => {
    if (!currentUserID) return;

    let cancelled = false;

    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await axios.get(
          `http://localhost/KindLoop-project01/Backend/Chat-System/get-conversations-list.php`,
          { params: { userID: currentUserID }, withCredentials: true }
        );
        if (!cancelled) {
          if (res.data?.success && Array.isArray(res.data?.conversations)) {
            setConversations(res.data.conversations);
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
    const id = setInterval(load, 8000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [currentUserID]);

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
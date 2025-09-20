import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { ChevronDown, Pencil, Trash2 } from "lucide-react";

interface ChatMessage {
  messageID: number;
  senderID: number;
  receiverID: number;
  donationID: number | null;
  message: string;
  timestamp: string;
  is_read: number;
  // optional flags from backend
  is_deleted?: number;
  is_edited?: number;
  deleted_at?: string | null;
  edited_at?: string | null;
}

interface ChatBoxProps {
  open: boolean;
  onClose: () => void;
  currentUserID: number;
  otherUserID: number;
  donationID?: number | null;
  otherUserName?: string;
}

const ChatBox: React.FC<ChatBoxProps> = ({
  open,
  onClose,
  currentUserID,
  otherUserID,
  donationID,
  otherUserName,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [donationTitle, setDonationTitle] = useState<string | null>(null);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editText, setEditText] = useState<string>("");
  const [menuOpenFor, setMenuOpenFor] = useState<number | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const { toast } = useToast();
  const isSelfChat = currentUserID === otherUserID;

  // Fetch donation title if a donationID is present
  useEffect(() => {
    let cancelled = false;

    async function loadTitle() {
      if (!donationID) {
        setDonationTitle(null);
        return;
      }
      try {
        const res = await axios.get(
          `http://localhost/KindLoop-project01/Backend/get-donation-by-id.php`,
          { params: { DonationID: donationID }, withCredentials: true }
        );
        if (!cancelled) {
          if (res.data?.status === "success" && res.data?.data?.title) {
            setDonationTitle(res.data.data.title as string);
          } else {
            setDonationTitle(null);
          }
        }
      } catch {
        if (!cancelled) setDonationTitle(null);
      }
    }

    loadTitle();
    return () => {
      cancelled = true;
    };
  }, [donationID]);

  // Scroll to bottom when messages update
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Initial fetch when opened
  useEffect(() => {
    if (open) {
      fetchMessages();
      // mark as read for messages from otherUserID to currentUserID
      markAsRead();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Polling while dialog is open
  useEffect(() => {
    if (!open) return;
    const id = setInterval(() => {
      fetchMessages();
    }, 3000);
    return () => clearInterval(id);
  }, [open, currentUserID, otherUserID, donationID]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = async () => {
    try {
      const res = await axios.get(
        `http://localhost/KindLoop-project01/Backend/Chat-System/get-conversation.php`,
        {
          params: {
            user1: currentUserID,
            user2: otherUserID,
            donationID: donationID ?? null,
          },
          withCredentials: true,
        }
      );
      if (res.data?.success && Array.isArray(res.data.messages)) {
        setMessages(res.data.messages);
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  const markAsRead = async () => {
    try {
      await axios.post(
        `http://localhost/KindLoop-project01/Backend/Chat-System/mark-read.php`,
        {
          receiverID: currentUserID,
          senderID: otherUserID,
          donationID: donationID ?? null,
        },
        { withCredentials: true }
      );
    } catch (e) {
      // non-fatal for UI
      console.warn("Failed to mark as read", e);
    }
  };

  const sendMessage = async () => {
    if (isSelfChat) {
      toast({
        title: "This is your post",
        description: "You can’t message yourself.",
        variant: "destructive",
      });
      return;
    }
    if (!newMessage.trim()) return;

    setLoading(true);
    try {
      const res = await axios.post(
        `http://localhost/KindLoop-project01/Backend/Chat-System/send-message.php`,
        {
          senderID: currentUserID,
          receiverID: otherUserID,
          donationID: donationID ?? null,
          message: newMessage.trim(),
        },
        { withCredentials: true }
      );

      if (res.data?.success) {
        setNewMessage("");
        fetchMessages();
      }
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (msg: ChatMessage) => {
    setEditingId(msg.messageID);
    setEditText(msg.message || "");
    setMenuOpenFor(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditText("");
  };

  const saveEdit = async () => {
    if (!editingId) return;
    const text = editText.trim();
    if (!text) {
      toast({ title: "Message cannot be empty", variant: "destructive" });
      return;
    }
    try {
      const res = await axios.post(
        `http://localhost/KindLoop-project01/Backend/Chat-System/edit-message.php`,
        {
          messageID: editingId,
          userID: currentUserID,
          message: text,
        },
        { withCredentials: true }
      );
      if (res.data?.success) {
        cancelEdit();
        fetchMessages();
      } else {
        toast({
          title: "Failed to edit message",
          description: res.data?.message || "Please try again.",
          variant: "destructive",
        });
      }
    } catch (e) {
      toast({
        title: "Server error while editing",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  const deleteMessage = async (messageID: number) => {
    try {
      const res = await axios.post(
        `http://localhost/KindLoop-project01/Backend/Chat-System/delete-message.php`,
        { messageID, userID: currentUserID },
        { withCredentials: true }
      );
      if (res.data?.success) {
        setMenuOpenFor(null);
        fetchMessages();
      } else {
        toast({
          title: "Failed to delete message",
          description: res.data?.message || "Please try again.",
          variant: "destructive",
        });
      }
    } catch (e) {
    toast({
        title: "Server error while deleting",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!loading && newMessage.trim()) {
        sendMessage();
      }
    }
  };

  const handleDialogOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) onClose();
  };

  const visibleMessages = messages.filter(
    (m) => !(m.is_deleted === 1 || m.message === "[deleted]")
  );

  const canEditMessage = (msg: ChatMessage) => {
    const isMine = msg.senderID === currentUserID;
    const within15 =
      new Date().getTime() - new Date(msg.timestamp).getTime() <= 15 * 60 * 1000;
    const notDeleted = msg.is_deleted !== 1 && msg.message !== "[deleted]";
    return isMine && within15 && notDeleted;
  };

  // Include date in timestamp (compact and readable)
  const formatDateTimeWithDate = (ts: string) => {
    const d = new Date(ts);
    const now = new Date();
    const sameYear = d.getFullYear() === now.getFullYear();
    return d.toLocaleString([], {
      year: sameYear ? undefined : "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const fullTimestamp = (msg: ChatMessage) => {
    const sent = new Date(msg.timestamp).toLocaleString();
    const edited =
      msg.is_edited === 1
        ? ` • edited${
            msg.edited_at ? " " + new Date(msg.edited_at).toLocaleString() : ""
          }`
        : "";
    return `Sent ${sent}${edited}`;
  };

  // Toggle menu with keyboard support
  const toggleMenuFor = (id: number) => {
    setMenuOpenFor((prev) => (prev === id ? null : id));
  };

  // Close menu on Escape
  useEffect(() => {
    if (menuOpenFor === null) return;
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpenFor(null);
    };
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [menuOpenFor]);

  return (
    <Dialog open={open} onOpenChange={handleDialogOpenChange}>
      {/* Enlarged dialog size for readability */}
      <DialogContent className="max-w-3xl p-6 flex flex-col h-[720px]">
        <DialogHeader>
          <DialogTitle className="text-xl">
            Chat {donationTitle ? `about “${donationTitle}” ` : ""}with{" "}
            {otherUserName || "User"}
          </DialogTitle>
          <DialogDescription>
            Discuss donation details directly with the other user.
          </DialogDescription>
        </DialogHeader>

        {isSelfChat && (
          <div className="mb-2 text-sm text-red-600">
            You can’t message yourself about your own post.
          </div>
        )}

        {/* Messages list */}
        <div className="flex-1 overflow-y-auto border rounded-md p-4 space-y-4 bg-muted">
          {visibleMessages.length > 0 ? (
            visibleMessages.map((msg) => {
              const isMine = msg.senderID === currentUserID;
              const isEditing = editingId === msg.messageID;
              return (
                <div
                  key={msg.messageID}
                  className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                >
                  {/* The bubble itself is relative so arrow/menu can be inside it */}
                  <div
                    className={`relative max-w-[80%] rounded-xl px-4 py-3 text-base leading-relaxed shadow ${
                      isMine
                        ? "bg-violet-600 text-white"
                        : "bg-white text-gray-900 border"
                    }`}
                    // Leave space inside the top-right for the arrow to live
                    style={{ paddingRight: "3.25rem", paddingTop: "0.85rem" }}
                    title={fullTimestamp(msg)}
                  >
                    {/* Message text */}
                    {!isEditing ? (
                      <div className="whitespace-pre-wrap break-words">
                        {msg.message}
                      </div>
                    ) : (
                      <>
                        <input
                          className="w-full rounded px-3 py-2 text-base text-gray-900 border"
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              saveEdit();
                            }
                          }}
                          autoFocus
                        />
                        <div className="mt-3 flex gap-2 justify-end">
                          <button
                            className="px-3 py-1.5 text-sm rounded bg-green-400 text-white"
                            onClick={saveEdit}
                          >
                            Save
                          </button>
                          <button
                            className="px-3 py-1.5 text-sm rounded bg-red-400 text-white"
                            onClick={cancelEdit}
                          >
                            Cancel
                          </button>
                        </div>
                      </>
                    )}

                    {/* Timestamp row (always includes date) */}
                    <div
                      className={`mt-2 text-xs flex items-center gap-1 ${
                        isMine ? "text-violet-100" : "text-gray-500"
                      } justify`}
                    >
                      <span>{formatDateTimeWithDate(msg.timestamp)}</span>
                      {msg.is_edited === 1 && (
                        <span
                          className="inline-flex items-center gap-1"
                          title="Edited"
                          aria-label="Edited"
                        >
                          · <Pencil className="h-3.5 w-3.5" />
                        </span>
                      )}
                    </div>

                    {/* Downward arrow INSIDE the bubble (visible, top-right) */}
                    {isMine && !isEditing && (
                      <>
                        <button
                          className="absolute top-2 right-2 h-5 w-5 flex items-center justify-center rounded-full bg-violet-300/80 border border-gray-200 shadow hover:bg-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                          onClick={() => toggleMenuFor(msg.messageID)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              toggleMenuFor(msg.messageID);
                            }
                          }}
                          aria-label="More options"
                          title="More options"
                        >
                          <ChevronDown className="h-5 w-5 text-gray-700" />
                        </button>

                        {menuOpenFor === msg.messageID && (
                          <>
                            {/* Click-catcher to close menu when clicking outside */}
                            <div
                              className="fixed inset-0 z-10"
                              onClick={() => setMenuOpenFor(null)}
                            />
                            {/* Menu anchored inside bubble; can overflow visually */}
                            <div className="absolute z-20 top-12 right-2 min-w-[12rem] rounded-md border border-gray-200 bg-white shadow-lg overflow-hidden">
                              <button
                                className={`w-full flex items-center gap-2 px-4 py-3 text-left text-base text-gray-700 hover:bg-gray-50 ${
                                  !canEditMessage(msg)
                                    ? "opacity-50 cursor-not-allowed"
                                    : ""
                                }`}
                                onClick={() =>
                                  canEditMessage(msg) && startEdit(msg)
                                }
                                disabled={!canEditMessage(msg)}
                              >
                                <Pencil className="h-4 w-4 text-gray-600" />
                                Edit
                              </button>
                              <button
                                className="w-full flex items-center gap-2 px-4 py-3 text-left text-base text-red-600 hover:bg-red-50"
                                onClick={() => deleteMessage(msg.messageID)}
                              >
                                <Trash2 className="h-5 w-5" />
                                Delete
                              </button>
                            </div>
                          </>
                        )}
                      </>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-sm text-gray-500">No messages yet.</div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Composer */}
        <div className="mt-4 flex gap-2">
          <input
            className="flex-1 border rounded-md px-4 py-3 text-base"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Type a message…"
            disabled={loading || isSelfChat}
          />
          <button
            className="px-4 py-3 text-base bg-violet-600 text-white rounded-md disabled:opacity-60"
            onClick={sendMessage}
            disabled={loading || isSelfChat}
          >
            Send
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ChatBox;
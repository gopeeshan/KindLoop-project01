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

  return (
    <Dialog open={open} onOpenChange={handleDialogOpenChange}>
      <DialogContent className="max-w-lg p-4 flex flex-col h-[500px]">
        <DialogHeader>
          <DialogTitle>
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
        <div className="flex-1 overflow-y-auto border rounded-md p-2 space-y-2 bg-muted">
          {visibleMessages.length > 0 ? (
            visibleMessages.map((msg) => {
              const isMine = msg.senderID === currentUserID;
              const isEditing = editingId === msg.messageID;
              return (
                <div
                  key={msg.messageID}
                  className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[75%] rounded-lg px-3 py-2 text-sm shadow ${
                      isMine
                        ? "bg-violet-600 text-white"
                        : "bg-white text-gray-900 border"
                    }`}
                  >
                    {!isEditing ? (
                      <>
                        <div className="whitespace-pre-wrap break-words">
                          {msg.message}
                        </div>
                        <div
                          className={`mt-1 text-[10px] flex items-center gap-2 ${
                            isMine ? "text-violet-100" : "text-gray-500"
                          }`}
                        >
                          <span>{new Date(msg.timestamp).toLocaleString()}</span>
                          {msg.is_edited === 1 && <span>(edited)</span>}
                        </div>

                        {isMine && (
                          <div className="mt-1 flex gap-2 text-[11px]">
                            {canEditMessage(msg) && (
                              <button
                                className={`underline ${
                                  isMine ? "text-violet-100" : "text-gray-600"
                                }`}
                                onClick={() => startEdit(msg)}
                              >
                                Edit
                              </button>
                            )}
                            <button
                              className={`underline ${
                                isMine ? "text-violet-100" : "text-gray-600"
                              }`}
                              onClick={() => deleteMessage(msg.messageID)}
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </>
                    ) : (
                      <>
                        <input
                          className={`w-full rounded px-2 py-1 text-sm ${
                            isMine ? "text-gray-900" : "text-gray-900"
                          }`}
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
                        <div className="mt-2 flex gap-2">
                          <button
                            className="px-2 py-1 text-xs rounded bg-violet-700 text-white"
                            onClick={saveEdit}
                          >
                            Save
                          </button>
                          <button
                            className="px-2 py-1 text-xs rounded bg-gray-200"
                            onClick={cancelEdit}
                          >
                            Cancel
                          </button>
                        </div>
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
        <div className="mt-2 flex gap-2">
          <input
            className="flex-1 border rounded-md px-3 py-2"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Type a message…"
            disabled={loading || isSelfChat}
          />
          <button
            className="px-3 py-2 bg-violet-600 text-white rounded-md disabled:opacity-60"
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
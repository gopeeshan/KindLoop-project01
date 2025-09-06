import { useEffect, useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import axios from "axios";

interface ChatBoxProps {
  open: boolean;
  onClose: () => void;
  currentUserID: number;
  otherUserID: number;
  donationID: number;
  // New: pass the display name of the chat partner (e.g., donor or requester)
  otherUserName?: string;
}

interface Message {
  messageID: number;
  senderID: number;
  receiverID: number;
  message: string;
  timestamp: string;
  is_read: number;
}

const ChatBox: React.FC<ChatBoxProps> = ({
  open,
  onClose,
  currentUserID,
  otherUserID,
  donationID,
  otherUserName,
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Scroll to bottom when messages update
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Initial fetch when opened
  useEffect(() => {
    if (open) {
      fetchMessages();
    }
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
            donationID: donationID,
          },
          // withCredentials true only if your PHP relies on cookies/sessions
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

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    setLoading(true);
    try {
      const res = await axios.post(
        `http://localhost/KindLoop-project01/Backend/Chat-System/send-message.php`,
        {
          senderID: currentUserID,
          receiverID: otherUserID,
          donationID: donationID,
          message: newMessage.trim(),
        },
        { withCredentials: true }
      );

      if (res.data?.success) {
        setNewMessage("");
        // Optimistic update could be added; for now re-fetch to keep consistent with server
        fetchMessages();
      }
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setLoading(false);
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

  // Important: use onOpenChange to close properly
  const handleDialogOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogOpenChange}>
      <DialogContent className="max-w-lg p-4 flex flex-col h-[500px]">
        <DialogHeader>
          <DialogTitle>Chat with {otherUserName || "User"}</DialogTitle>
          <DialogDescription>
            Discuss donation details directly with the other user.
          </DialogDescription>
        </DialogHeader>

        {/* Messages list */}
        <div className="flex-1 overflow-y-auto border rounded-md p-2 space-y-2 bg-muted">
          {messages.length > 0 ? (
            messages.map((msg) => {
              const isMine = msg.senderID === currentUserID;
              return (
                <div
                  key={msg.messageID}
                  className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`p-2 rounded-md max-w-[70%] text-sm ${
                      isMine ? "bg-blue-600 text-white" : "bg-white text-black"
                    }`}
                  >
                    <div className="whitespace-pre-wrap break-words">
                      {msg.message}
                    </div>
                    <div className={`text-[10px] mt-1 opacity-70 ${isMine ? "text-white" : "text-gray-600"}`}>
                      {new Date(msg.timestamp).toLocaleString()}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-sm text-muted-foreground text-center">
              No messages yet. Say hello!
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <DialogFooter className="pt-2">
          <div className="flex w-full gap-2">
            <Input
              placeholder="Type your message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={onKeyDown}
              disabled={loading}
            />
            <Button onClick={sendMessage} disabled={loading || !newMessage.trim()}>
              {loading ? "Sending..." : "Send"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ChatBox;
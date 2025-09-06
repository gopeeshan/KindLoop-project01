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
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const [donorName, setDonorName] = useState<string>("");

  // Scroll to bottom when messages update
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (open) {
      fetchMessages();
    }
  }, [open]);

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
        }
      );
      if (res.data.success) {
        setMessages(res.data.messages);
        if (res.data.donorName) {
          setDonorName(res.data.donorName);
        }
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
          message: newMessage,
        }
      );

      if (res.data.success) {
        setNewMessage("");
        fetchMessages(); // refresh after sending
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg p-4 flex flex-col h-[500px]">
        <DialogHeader>
          <DialogTitle>Chat with {donorName || "Donor"}</DialogTitle>

          <DialogDescription>
            Discuss donation details directly with the donor.
          </DialogDescription>
        </DialogHeader>

        {/* Messages list */}
        <div className="flex-1 overflow-y-auto border rounded-md p-2 space-y-2 bg-muted">
          {messages.length > 0 ? (
            messages.map((msg) => (
              <div
                key={msg.messageID}
                className={`p-2 rounded-md max-w-[70%] ${
                  msg.senderID === currentUserID
                    ? "ml-auto bg-primary text-primary-foreground"
                    : "mr-auto bg-secondary text-secondary-foreground"
                }`}
              >
                <p className="text-sm">{msg.message}</p>
                <span className="text-xs opacity-70 block">
                  {new Date(msg.timestamp).toLocaleString()}
                </span>
              </div>
            ))
          ) : (
            <p className="text-center text-sm text-muted-foreground">
              No messages yet. Start the conversation!
            </p>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input & Send */}
        <DialogFooter className="flex gap-2 mt-2">
          <Input
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          />
          <Button onClick={sendMessage} disabled={loading}>
            Send
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ChatBox;

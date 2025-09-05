import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import axios from "axios";

interface ChatBoxProps {
  open: boolean;
  onClose: () => void;
  currentUserID: number;
  otherUserID: number;
  donationID?: number;
}

interface Message {
  messageID: number;
  senderID: number;
  receiverID: number;
  message: string;
  timestamp: string;
}

const ChatBox = ({ open, onClose, currentUserID, otherUserID, donationID }: ChatBoxProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");

  // Fetch existing conversation
  useEffect(() => {
    if (open) {
      axios
        .get("http://localhost/KindLoop-project01/Backend/get-conversation.php", {
          params: {
            user1: currentUserID,
            user2: otherUserID,
            donationID: donationID,
          },
        })
        .then((res) => {
          if (res.data.status === "success") setMessages(res.data.data);
        });
    }
  }, [open, currentUserID, otherUserID, donationID]);

  // Send a message
  const handleSend = async () => {
    if (!newMessage.trim()) return;

    const res = await axios.post("http://localhost/KindLoop-project01/Backend/send-message.php", {
      senderID: currentUserID,
      receiverID: otherUserID,
      donationID,
      message: newMessage,
    });

    if (res.data.success) {
      setMessages([...messages, { 
        messageID: res.data.insertId, 
        senderID: currentUserID, 
        receiverID: otherUserID, 
        message: newMessage, 
        timestamp: new Date().toISOString() 
      }]);
      setNewMessage("");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md flex flex-col h-[500px]">
        <DialogHeader>
          <DialogTitle>Chat</DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto p-2 space-y-2 bg-gray-50 rounded-md">
          {messages.map((msg) => (
            <div
              key={msg.messageID}
              className={`flex ${msg.senderID === currentUserID ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`p-2 rounded-lg max-w-xs ${
                  msg.senderID === currentUserID
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 text-gray-900"
                }`}
              >
                <p>{msg.message}</p>
                <span className="text-[10px] block mt-1 opacity-70">
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
            </div>
          ))}
        </div>
        <div className="flex gap-2 mt-2">
          <Input
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
          />
          <Button onClick={handleSend}>Send</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ChatBox;

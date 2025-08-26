import React, { useState } from "react";

interface Props {
  onSend: (content: string) => void;
  disabled?: boolean;
}

const MessageInput: React.FC<Props> = ({ onSend, disabled }) => {
  const [text, setText] = useState("");

  const send = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setText("");
  };

  const handleKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <div className="flex items-center">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKey}
        className="flex-1 p-2 border rounded resize-none"
        rows={2}
        disabled={disabled}
        placeholder={disabled ? "Select a user to chat" : "Type a message..."}
      />
      <button className="ml-2 px-4 py-2 bg-blue-600 text-white rounded" onClick={send} disabled={disabled}>
        Send
      </button>
    </div>
  );
};

export default MessageInput;
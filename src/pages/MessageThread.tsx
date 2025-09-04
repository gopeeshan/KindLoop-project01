/**
 * MessageThread Component  
 * Displays chat messages with elegant bubble design and smooth scrolling
 */

import React, { useEffect, useRef } from 'react';
import { Message, User } from '@/types/chat';
import { formatDistanceToNow } from 'date-fns';

interface MessageThreadProps {
  messages: Message[];
  currentUser: User;
  otherUser: User;
}

interface MessageBubbleProps {
  message: Message;
  isCurrentUser: boolean;
  user: User;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isCurrentUser, user }) => {
  return (
    <div className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`flex max-w-[70%] ${isCurrentUser ? 'flex-row-reverse' : 'flex-row'} items-end space-x-2`}>
        {/* Avatar */}
        <div className="flex-shrink-0">
          <div className="w-8 h-8 rounded-full bg-primary-soft flex items-center justify-center text-sm">
            {user.avatar || user.name.charAt(0)}
          </div>
        </div>
        
        {/* Message bubble */}
        <div className="flex flex-col">
          <div
            className={`px-4 py-2 rounded-2xl shadow-sm transition-all duration-200 hover:shadow-md ${
              isCurrentUser
                ? 'bg-chat-bubble-user text-foreground rounded-br-md'
                : 'bg-chat-bubble-other text-foreground rounded-bl-md'
            }`}
          >
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
          </div>
          
          {/* Timestamp */}
          <div className={`text-xs text-muted-foreground mt-1 ${isCurrentUser ? 'text-right' : 'text-left'}`}>
            {formatDistanceToNow(message.timestamp, { addSuffix: true })}
          </div>
        </div>
      </div>
    </div>
  );
};

export const MessageThread: React.FC<MessageThreadProps> = ({
  messages,
  currentUser,
  otherUser
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-background to-muted/30">
        <div className="text-center space-y-2">
          <div className="text-4xl">{otherUser.avatar || '💬'}</div>
          <p className="text-muted-foreground">Start a conversation with {otherUser.name}</p>
          <p className="text-sm text-muted-foreground">Say hello and discuss the donation details!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-gradient-to-br from-background to-muted/30 p-4">
      <div className="space-y-1">
        {messages.map((message) => (
          <MessageBubble
            key={message.id}
            message={message}
            isCurrentUser={message.senderId === currentUser.id}
            user={message.senderId === currentUser.id ? currentUser : otherUser}
          />
        ))}
      </div>
      <div ref={messagesEndRef} />
    </div>
  );
};
/**
 * ChatSystem Component
 * Main chat interface combining conversation list and message thread
 */

import React, { useState, useMemo } from 'react';
import { Conversation, Message, User } from '@/types/chat';
import { ConversationList } from './ConversationList';
import { MessageThread } from './MessageThread';
import { ChatInput } from './ChatInput';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, X } from 'lucide-react';

interface ChatSystemProps {
  conversations: Conversation[];
  messages: Message[];
  currentUser: User;
  onSendMessage?: (conversationId: string, content: string) => void;
  onClose?: () => void;
  initialConversationId?: string;
  className?: string;
}

export const ChatSystem: React.FC<ChatSystemProps> = ({
  conversations,
  messages,
  currentUser,
  onSendMessage,
  onClose,
  initialConversationId,
  className = ''
}) => {
  // Find initial conversation or default to first one
  const initialConversation = initialConversationId 
    ? conversations.find(c => c.id === initialConversationId)
    : conversations[0];
    
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(
    initialConversation || null
  );

  // Filter messages for active conversation
  const activeMessages = useMemo(() => {
    if (!activeConversation) return [];
    
    return messages.filter(message => {
      const participantIds = activeConversation.participants.map(p => p.id);
      return participantIds.includes(message.senderId) && participantIds.includes(message.receiverId);
    }).sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }, [activeConversation, messages]);

  // Get other participant in active conversation
  const otherUser = activeConversation?.participants.find(p => p.id !== currentUser.id);

  const handleSendMessage = (content: string) => {
    if (activeConversation && onSendMessage) {
      onSendMessage(activeConversation.id, content);
    }
  };

  const handleSelectConversation = (conversation: Conversation) => {
    setActiveConversation(conversation);
  };

  return (
    <Card className={`flex h-[600px] overflow-hidden bg-background shadow-lg ${className}`}>
      {/* Conversation List Sidebar */}
      <ConversationList
        conversations={conversations}
        activeConversation={activeConversation}
        currentUser={currentUser}
        onSelectConversation={handleSelectConversation}
      />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {activeConversation && otherUser ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-border bg-background/50 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-primary-soft flex items-center justify-center">
                  <span className="text-sm font-medium">
                    {otherUser.avatar || otherUser.name.charAt(0)}
                  </span>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{otherUser.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {activeConversation.donationId ? 'About donation' : 'General conversation'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setActiveConversation(null)}
                  className="text-muted-foreground hover:text-foreground lg:hidden"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                {onClose && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onClose}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>

            {/* Messages */}
            <MessageThread
              messages={activeMessages}
              currentUser={currentUser}
              otherUser={otherUser}
            />

            {/* Input */}
            <ChatInput onSendMessage={handleSendMessage} />
          </>
        ) : (
          /* No conversation selected state */
          <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-background to-muted/30">
            <div className="text-center space-y-4 p-8">
              <div className="text-6xl opacity-50">💬</div>
              <h3 className="text-xl font-semibold text-foreground">Welcome to KindLoop Chat</h3>
              <p className="text-muted-foreground max-w-md">
                Select a conversation from the sidebar to start messaging, or click the message icon 
                on any donation post to begin a new conversation with the donor.
              </p>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};
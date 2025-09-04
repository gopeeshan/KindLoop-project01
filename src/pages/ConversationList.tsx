/**
 * ConversationList Component
 * Sidebar showing all active conversations with unread indicators
 */

import React from 'react';
import { Conversation, User } from '@/types/chat';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';

interface ConversationListProps {
  conversations: Conversation[];
  activeConversation: Conversation | null;
  currentUser: User;
  onSelectConversation: (conversation: Conversation) => void;
}

interface ConversationItemProps {
  conversation: Conversation;
  isActive: boolean;
  currentUser: User;
  onClick: () => void;
}

const ConversationItem: React.FC<ConversationItemProps> = ({
  conversation,
  isActive,
  currentUser,
  onClick
}) => {
  // Get the other participant (not the current user)
  const otherUser = conversation.participants.find(p => p.id !== currentUser.id);
  
  if (!otherUser) return null;

  return (
    <div
      onClick={onClick}
      className={`p-4 cursor-pointer transition-all duration-200 border-b border-border/50 
                hover:bg-accent/30 ${isActive ? 'bg-accent/50 border-l-4 border-l-primary' : ''}`}
    >
      <div className="flex items-start space-x-3">
        {/* Avatar */}
        <div className="flex-shrink-0">
          <div className="w-10 h-10 rounded-full bg-primary-soft flex items-center justify-center">
            <span className="text-sm font-medium">
              {otherUser.avatar || otherUser.name.charAt(0)}
            </span>
          </div>
        </div>

        {/* Conversation details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-foreground truncate">{otherUser.name}</h3>
            {conversation.unreadCount > 0 && (
              <Badge 
                variant="secondary" 
                className="bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full"
              >
                {conversation.unreadCount}
              </Badge>
            )}
          </div>
          
          {/* Last message preview */}
          {conversation.lastMessage && (
            <p className="text-sm text-muted-foreground mt-1 truncate">
              {conversation.lastMessage.content}
            </p>
          )}
          
          {/* Timestamp */}
          <p className="text-xs text-muted-foreground mt-1">
            {conversation.lastMessage 
              ? formatDistanceToNow(conversation.lastMessage.timestamp, { addSuffix: true })
              : formatDistanceToNow(conversation.createdAt, { addSuffix: true })
            }
          </p>
        </div>
      </div>
    </div>
  );
};

export const ConversationList: React.FC<ConversationListProps> = ({
  conversations,
  activeConversation,
  currentUser,
  onSelectConversation
}) => {
  // Sort conversations by last activity
  const sortedConversations = [...conversations].sort((a, b) => {
    const aTime = a.lastMessage?.timestamp || a.createdAt;
    const bTime = b.lastMessage?.timestamp || b.createdAt;
    return bTime.getTime() - aTime.getTime();
  });

  if (conversations.length === 0) {
    return (
      <div className="w-80 bg-chat-sidebar border-r border-border flex items-center justify-center">
        <div className="text-center space-y-2 p-6">
          <div className="text-4xl">💬</div>
          <p className="text-muted-foreground">No conversations yet</p>
          <p className="text-sm text-muted-foreground">
            Start chatting by clicking the message icon on donation posts!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-80 bg-chat-sidebar border-r border-border flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border bg-background/50">
        <h2 className="text-lg font-semibold text-foreground">Messages</h2>
        <p className="text-sm text-muted-foreground">
          {conversations.length} conversation{conversations.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Conversations */}
      <div className="flex-1 overflow-y-auto">
        {sortedConversations.map((conversation) => (
          <ConversationItem
            key={conversation.id}
            conversation={conversation}
            isActive={activeConversation?.id === conversation.id}
            currentUser={currentUser}
            onClick={() => onSelectConversation(conversation)}
          />
        ))}
      </div>
    </div>
  );
};
/**
 * TypeScript interfaces for KindLoop Chat System
 * Defines all data structures used in the chat functionality
 */

export interface User {
  id: string;
  name: string;
  avatar?: string;
  email?: string;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: Date;
  read: boolean;
  type: 'text' | 'system'; // Extensible for future message types
}

export interface Conversation {
  id: string;
  participants: User[];
  lastMessage?: Message;
  unreadCount: number;
  donationId?: string; // Links conversation to a donation post
  createdAt: Date;
  updatedAt: Date;
}

export interface Donation {
  id: string;
  title: string;
  description: string;
  category: string;
  location: string;
  donor: User;
  status: 'available' | 'reserved' | 'completed';
  imageUrl?: string;
  createdAt: Date;
}

export interface ChatContextType {
  conversations: Conversation[];
  activeConversation: Conversation | null;
  messages: Message[];
  currentUser: User;
  setActiveConversation: (conversation: Conversation | null) => void;
  sendMessage: (content: string) => void;
  markAsRead: (conversationId: string) => void;
}
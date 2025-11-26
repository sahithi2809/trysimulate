export interface User {
  id: string;
  name: string;
  avatar: string;
  role: string;
  status: 'online' | 'offline' | 'busy';
  bio?: string; // For AI persona context
}

export interface Channel {
  id: string;
  name: string;
  type: 'public' | 'private' | 'dm';
  memberIds: string[];
  unreadCount?: number;
  purpose?: string;
}

export interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: number;
  channelId: string;
  reactions?: Record<string, string[]>; // emoji -> userIds
}

export interface SimulationConfig {
  frequency: 'low' | 'medium' | 'high';
  chaosLevel: number; // Affects tone of messages
}

export interface Scenario {
  id: string;
  title: string;
  description: string;
  channelId: string;
  initiatorId: string; // Who starts the thread
  initialMessage: string; // The message that kicks off the conflict
  stakeholders: string[]; // IDs of people involved in the conflict
}

export interface Evaluation {
  score: number; // 1-10
  feedback: string;
  strengths: string[];
  weaknesses: string[];
}
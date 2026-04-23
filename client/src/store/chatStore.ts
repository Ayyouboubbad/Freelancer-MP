import { create } from 'zustand';
import type { Conversation, Message } from '../types';
import { messageAPI } from '../api';

interface ChatState {
  conversations: Conversation[];
  activeConversation: Conversation | null;
  messages: Message[];
  loadingConvs: boolean;
  loadingMsgs: boolean;

  fetchConversations: () => Promise<void>;
  openConversation: (conv: Conversation) => void;
  fetchMessages: (conversationId: string) => Promise<void>;
  addMessage: (msg: Message) => void;
  setConversations: (convs: Conversation[]) => void;
}

export const useChatStore = create<ChatState>((set) => ({
  conversations: [],
  activeConversation: null,
  messages: [],
  loadingConvs: false,
  loadingMsgs: false,

  fetchConversations: async () => {
    set({ loadingConvs: true });
    try {
      const { data } = await messageAPI.getConversations();
      set({ conversations: data.conversations });
    } finally {
      set({ loadingConvs: false });
    }
  },

  openConversation: (conv) => {
    set({ activeConversation: conv, messages: [] });
  },

  fetchMessages: async (conversationId) => {
    set({ loadingMsgs: true });
    try {
      const { data } = await messageAPI.getMessages(conversationId);
      set({ messages: data.messages });
    } finally {
      set({ loadingMsgs: false });
    }
  },

  addMessage: (msg) => {
    set((s) => ({ messages: [...s.messages, msg] }));
  },

  setConversations: (convs) => set({ conversations: convs }),
}));

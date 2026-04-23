import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { messageAPI } from '../api';
import { useSocket } from '../context/SocketContext';
import type { Conversation, Message } from '../types';
import { formatDistanceToNow } from '../utils/dateUtils';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Send, Paperclip, ArrowLeft, MessageCircle, Search,
} from 'lucide-react';
import toast from 'react-hot-toast';

const MessagesPage = () => {
  const { conversationId } = useParams<{ conversationId: string }>();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const socket = useSocket();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConvo, setActiveConvo] = useState<string | null>(conversationId || null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState('');
  const [loadingConvos, setLoadingConvos] = useState(true);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [sending, setSending] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  // Load conversations
  useEffect(() => {
    messageAPI.getConversations()
      .then(({ data }) => setConversations(data.conversations || []))
      .catch(() => toast.error('Failed to load conversations'))
      .finally(() => setLoadingConvos(false));
  }, []);

  // Load messages when active conversation changes
  useEffect(() => {
    if (!activeConvo) return;
    setLoadingMsgs(true);
    messageAPI.getMessages(activeConvo)
      .then(({ data }) => setMessages(data.messages || []))
      .catch(() => toast.error('Failed to load messages'))
      .finally(() => setLoadingMsgs(false));
  }, [activeConvo]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Socket: listen for new messages
  useEffect(() => {
    if (!socket) return;
    const handler = (msg: Message) => {
      if (msg.conversation === activeConvo) {
        setMessages((prev) => [...prev, msg]);
      }
      // Update conversation list preview
      setConversations((prev) =>
        prev.map((c) =>
          c._id === msg.conversation
            ? { ...c, lastMessage: msg, lastMessageAt: msg.createdAt }
            : c
        )
      );
    };
    socket.on('new_message', handler);
    return () => { socket.off('new_message', handler); };
  }, [socket, activeConvo]);

  const handleSend = async () => {
    if (!text.trim() || !activeConvo) return;
    setSending(true);
    try {
      const formData = new FormData();
      formData.append('conversationId', activeConvo);
      formData.append('text', text.trim());
      const { data } = await messageAPI.sendMessage(formData);
      setMessages((prev) => [...prev, data.message]);
      setText('');
      // Emit via socket
      socket?.emit('send_message', data.message);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to send.');
    } finally {
      setSending(false);
    }
  };

  const getOtherUser = (convo: Conversation) => {
    return convo.participants.find((p) => p._id !== user?._id) || convo.participants[0];
  };

  const filteredConvos = conversations.filter((c) => {
    if (!searchTerm) return true;
    const other = getOtherUser(c);
    return other?.name?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const selectedConvo = conversations.find((c) => c._id === activeConvo);

  return (
    <div className="page !py-4">
      <div className="flex gap-4 h-[calc(100vh-8rem)]">
        {/* Conversation List */}
        <div className={`chat-sidebar ${activeConvo ? 'hidden lg:flex' : 'flex'} flex-col`}>
          <div className="p-4 border-b border-white/5">
            <h2 className="text-lg font-display font-bold text-white mb-3 flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-brand-400" /> Messages
            </h2>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                className="input !pl-9 !py-2 text-sm" placeholder="Search conversations..."
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto no-scrollbar">
            {loadingConvos ? (
              <div className="p-4 space-y-3">
                {[1,2,3].map((i) => <div key={i} className="skeleton h-16 rounded-xl" />)}
              </div>
            ) : filteredConvos.length === 0 ? (
              <div className="p-8 text-center">
                <MessageCircle className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-400 text-sm">No conversations yet</p>
              </div>
            ) : (
              filteredConvos.map((convo) => {
                const other = getOtherUser(convo);
                const isActive = convo._id === activeConvo;
                return (
                  <button
                    key={convo._id}
                    onClick={() => { setActiveConvo(convo._id); navigate(`/messages/${convo._id}`, { replace: true }); }}
                    className={`chat-item w-full text-left ${isActive ? 'active' : ''}`}
                  >
                    <img
                      src={other?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${other?._id}`}
                      alt="" className="w-10 h-10 rounded-full border border-white/10 shrink-0 object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center">
                        <p className="text-sm font-semibold text-white truncate">{other?.name}</p>
                        <span className="text-xs text-slate-500 shrink-0">
                          {convo.lastMessageAt ? formatDistanceToNow(convo.lastMessageAt) : ''}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 truncate mt-0.5">
                        {typeof convo.lastMessage === 'object' && convo.lastMessage !== null ? convo.lastMessage.text : 'Start chatting...'}
                      </p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className={`flex-1 flex flex-col glass-dark rounded-2xl overflow-hidden ${!activeConvo ? 'hidden lg:flex' : 'flex'}`}>
          {activeConvo && selectedConvo ? (
            <>
              {/* Chat header */}
              <div className="flex items-center gap-3 p-4 border-b border-white/5">
                <button onClick={() => setActiveConvo(null)} className="btn-ghost btn-icon lg:hidden">
                  <ArrowLeft className="w-5 h-5" />
                </button>
                {(() => {
                  const other = getOtherUser(selectedConvo);
                  return (
                    <>
                      <img
                        src={other?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${other?._id}`}
                        alt="" className="w-9 h-9 rounded-full border border-white/10 object-cover"
                      />
                      <div>
                        <p className="text-sm font-semibold text-white">{other?.name}</p>
                        <p className="text-xs text-slate-500 capitalize">{other?.role || 'User'}</p>
                      </div>
                    </>
                  );
                })()}
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 no-scrollbar">
                {loadingMsgs ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-center">
                    <div>
                      <MessageCircle className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                      <p className="text-slate-400">No messages yet. Say hi!</p>
                    </div>
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isMine = (typeof msg.sender === 'object' ? msg.sender._id : msg.sender) === user?._id;
                    return (
                      <div key={msg._id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                        <div className={`chat-bubble ${isMine ? 'sent' : 'received'}`}>
                          <p>{msg.text}</p>
                          <p className={`text-xs mt-1 ${isMine ? 'text-white/50' : 'text-slate-500'}`}>
                            {formatDistanceToNow(msg.createdAt)}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-4 border-t border-white/5">
                <div className="flex gap-2">
                  <input
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
                    className="input flex-1 !py-3"
                    placeholder="Type a message..."
                  />
                  <button onClick={handleSend} disabled={sending || !text.trim()}
                    className="btn-primary !px-4">
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-center">
              <div>
                <MessageCircle className="w-16 h-16 text-surface-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-300 mb-1">Your Messages</h3>
                <p className="text-sm text-slate-500">Select a conversation to start chatting</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessagesPage;

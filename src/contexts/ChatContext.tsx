import React, { createContext, useContext, useEffect, useState } from 'react';
import { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { chatService } from '../services/chatService';
import { messageService } from '../services/messageService';
import { authService } from '../services/authService';
import type { ChatWithDetails, MessageWithDetails, User } from '../types/database.types';
import { useAuth } from './AuthContext';

interface ChatContextType {
    chats: ChatWithDetails[];
    activeChat: ChatWithDetails | null;
    messages: MessageWithDetails[];
    typingUsers: User[];
    loading: boolean;
    loadChats: () => Promise<void>;
    selectChat: (chatId: string) => Promise<void>;
    sendMessage: (content: string, replyToId?: string) => Promise<void>;
    loadMoreMessages: () => Promise<void>;
    setTyping: (isTyping: boolean) => void;
    searchUsers: (query: string) => Promise<User[]>;
    startPrivateChat: (userId: string) => Promise<void>;
    deleteChat: (chatId: string) => Promise<void>;
    deselectChat: () => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const useChat = () => {
    const context = useContext(ChatContext);
    if (!context) {
        throw new Error('useChat must be used within a ChatProvider');
    }
    return context;
};

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const [chats, setChats] = useState<ChatWithDetails[]>([]);
    const [activeChat, setActiveChat] = useState<ChatWithDetails | null>(null);
    const [messages, setMessages] = useState<MessageWithDetails[]>([]);
    const [typingUsers, setTypingUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);

    const [chatChannel, setChatChannel] = useState<RealtimeChannel | null>(null);
    const [messageChannel, setMessageChannel] = useState<RealtimeChannel | null>(null);
    const [typingChannel, setTypingChannel] = useState<RealtimeChannel | null>(null);

    // Load user's chats
    const loadChats = async () => {
        if (!user) return;

        // Only show loading if we don't have any chats yet
        if (chats.length === 0) {
            setLoading(true);
        }

        try {
            const userChats = await chatService.getUserChats();
            setChats(userChats);
        } catch (error) {
            console.error('Error loading chats:', error);
        } finally {
            setLoading(false);
        }
    };

    // Select and load a chat
    const selectChat = async (chatId: string) => {
        if (!user) return;

        try {
            const chat = await chatService.getChatById(chatId);

            // Populate other_user for private chats
            if (chat.type === 'private' && chat.participants) {
                const otherParticipant = chat.participants.find(
                    (p: any) => p.user_id !== user.id
                );
                chat.other_user = otherParticipant?.user;
                console.log('[ChatContext] Selected private chat with:', chat.other_user?.username);
            }

            setActiveChat(chat);

            // Load messages
            const chatMessages = await messageService.getMessages(chatId);
            setMessages(chatMessages);
            setHasMore(chatMessages.length >= 50);

            // Mark messages as read
            const unreadMessageIds = chatMessages
                .filter(m => m.sender_id !== user.id)
                .map(m => m.id);

            if (unreadMessageIds.length > 0) {
                await messageService.markAsRead(unreadMessageIds);
            }

            // Subscribe to real-time updates
            subscribeToChat(chatId);
        } catch (error) {
            console.error('Error selecting chat:', error);
        }
    };

    // Subscribe to real-time chat updates
    const subscribeToChat = (chatId: string) => {
        // Unsubscribe from previous channels
        if (messageChannel) messageChannel.unsubscribe();
        if (typingChannel) typingChannel.unsubscribe();

        // Subscribe to new messages
        const newMessageChannel = supabase
            .channel(`messages:${chatId}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'messages',
                    filter: `chat_id=eq.${chatId}`,
                },
                async (payload) => {
                    const newMessage = payload.new as MessageWithDetails;
                    if (newMessage) {
                        // 1. Initial immediate update with whatever we have (fast)
                        const placeholder: MessageWithDetails = {
                            ...newMessage,
                            sender: newMessage.sender || { username: '...', is_online: false } as User,
                            is_edited: false,
                            is_deleted: false,
                            created_at: newMessage.created_at || new Date().toISOString()
                        };

                        setMessages(prev => {
                            if (prev.some(m => m.id === placeholder.id)) return prev;

                            // Replace optimistic if exists
                            const optIndex = prev.findIndex(m =>
                                m.is_optimistic && m.content === placeholder.content && m.sender_id === placeholder.sender_id
                            );

                            if (optIndex !== -1) {
                                const next = [...prev];
                                next[optIndex] = placeholder;
                                return next;
                            }
                            return [...prev, placeholder];
                        });

                        // 2. Background fetch for full details (rich)
                        const { data } = await supabase
                            .from('messages')
                            .select(`
                                *,
                                sender:users (*),
                                reply_to:messages (
                                    *,
                                    sender:users (*)
                                )
                            `)
                            .eq('id', newMessage.id)
                            .single();

                        if (data) {
                            setMessages(prev => prev.map(m => m.id === data.id ? { ...m, ...data } : m));

                            // Mark as read if not sent by us
                            if (data.sender_id !== user?.id) {
                                messageService.markAsRead([data.id]).catch(() => { });
                            }
                        }
                    }
                }
            )
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'messages',
                    filter: `chat_id=eq.${chatId}`,
                },
                async (payload) => {
                    const updatedMessage = payload.new as MessageWithDetails;

                    // Refetch full message with relations
                    const { data } = await supabase
                        .from('messages')
                        .select(`
                            *,
                            sender:users (*),
                            reply_to:messages (
                                *,
                                sender:users (*)
                            )
                        `)
                        .eq('id', updatedMessage.id)
                        .single();

                    if (data) {
                        setMessages(prev =>
                            prev.map(m => (m.id === data.id ? { ...m, ...data } : m))
                        );
                    }
                }
            )
            .subscribe((status) => {
                console.log(`[ChatContext] Realtime status for ${chatId}:`, status);
                if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
                    console.warn('[ChatContext] Subscription failed, attempting reconnect...');
                    setTimeout(() => subscribeToChat(chatId), 2000);
                }
            });

        setMessageChannel(newMessageChannel);

        // Subscribe to typing indicators
        const newTypingChannel = supabase
            .channel(`typing:${chatId}`)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'typing_indicators',
                    filter: `chat_id=eq.${chatId}`,
                },
                async () => {
                    // Fetch current typing users
                    const { data } = await supabase
                        .from('typing_indicators')
                        .select('user:users (*)')
                        .eq('chat_id', chatId)
                        .eq('is_typing', true)
                        .neq('user_id', user?.id || '');

                    if (data) {
                        setTypingUsers(data.map(d => (d as any).user).filter(Boolean) as unknown as User[]);
                    }
                }
            )
            .subscribe();

        setTypingChannel(newTypingChannel);
    };

    // Send a message
    const sendMessage = async (content: string, replyToId?: string) => {
        if (!activeChat || !user || !content.trim()) return;

        const optimisticMessage: MessageWithDetails = {
            id: `temp-${Date.now()}`,
            chat_id: activeChat.id,
            sender_id: user.id,
            content: content.trim(),
            message_type: 'text',
            created_at: new Date().toISOString(),
            sender: user,
            is_optimistic: true,
            is_edited: false,
            is_deleted: false,
            reply_to_message_id: replyToId,
            reply_to: replyToId ? messages.find(m => m.id === replyToId) : undefined
        };

        // Add to UI immediately
        setMessages(prev => [...prev, optimisticMessage]);

        try {
            await messageService.sendMessage(activeChat.id, content, replyToId);
            // The real-time subscription will handle replacing the optimistic message
        } catch (error) {
            console.error('Error sending message:', error);
            // Remove optimistic message on error
            setMessages(prev => prev.filter(m => m.id !== optimisticMessage.id));
            throw error;
        }
    };

    // Load more messages (pagination)
    const loadMoreMessages = async () => {
        if (!activeChat || !hasMore || messages.length === 0) return;

        try {
            const oldestMessage = messages[0];
            const olderMessages = await messageService.getMessages(
                activeChat.id,
                50,
                oldestMessage.id
            );

            if (olderMessages.length < 50) {
                setHasMore(false);
            }

            setMessages(prev => [...olderMessages, ...prev]);
        } catch (error) {
            console.error('Error loading more messages:', error);
        }
    };

    // Set typing indicator
    const setTyping = async (isTyping: boolean) => {
        if (!activeChat) return;

        try {
            await messageService.setTyping(activeChat.id, isTyping);
        } catch (error) {
            console.error('Error setting typing indicator:', error);
        }
    };

    // Subscribe to chat list updates
    useEffect(() => {
        if (!user) return;

        const channel = supabase
            .channel('chat_participants')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'chat_participants',
                    filter: `user_id=eq.${user.id}`,
                },
                () => {
                    loadChats();
                }
            )
            .subscribe();

        setChatChannel(channel);

        return () => {
            channel.unsubscribe();
        };
    }, [user]);

    // Load chats on mount
    useEffect(() => {
        if (user) {
            loadChats();
        }
    }, [user]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (chatChannel) chatChannel.unsubscribe();
            if (messageChannel) messageChannel.unsubscribe();
            if (typingChannel) typingChannel.unsubscribe();
        };
    }, [chatChannel, messageChannel, typingChannel]);

    // Search users
    const searchUsers = async (query: string): Promise<User[]> => {
        if (!query.trim()) return [];
        try {
            return await authService.searchUsers(query);
        } catch (error) {
            console.error('Error searching users:', error);
            return [];
        }
    };

    // Start a private chat
    const startPrivateChat = async (userId: string) => {
        if (!user) return;

        try {
            const chatId = await chatService.createOrGetPrivateChat(userId);
            if (chatId) {
                await loadChats();
                await selectChat(chatId);
            }
        } catch (error) {
            console.error('Error starting private chat:', error);
            throw error;
        }
    };

    const deleteChat = async (chatId: string) => {
        try {
            await chatService.deleteChat(chatId);
            if (activeChat?.id === chatId) {
                setActiveChat(null);
                setMessages([]);
            }
            await loadChats();
        } catch (error) {
            console.error('Error deleting chat:', error);
            throw error;
        }
    };

    const deselectChat = () => {
        setActiveChat(null);
        setMessages([]);
    };

    const value = {
        chats,
        activeChat,
        messages,
        typingUsers,
        loading,
        loadChats,
        selectChat,
        sendMessage,
        loadMoreMessages,
        setTyping,
        searchUsers,
        startPrivateChat,
        deleteChat,
        deselectChat,
    };

    return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

import React from 'react';
import { useChat } from '../../contexts/ChatContext';
import { useAuth } from '../../contexts/AuthContext';
import type { ChatWithDetails } from '../../types/database.types';
import { formatDistanceToNow } from 'date-fns';

export const ChatList: React.FC = () => {
    const { chats, activeChat, selectChat, loading } = useChat();
    const { user } = useAuth();

    const getChatName = (chat: ChatWithDetails) => {
        if (chat.type === 'private' && chat.other_user) {
            return chat.other_user.full_name || chat.other_user.username;
        }
        return chat.name || 'Unnamed Chat';
    };

    const getChatAvatar = (chat: ChatWithDetails) => {
        if (chat.type === 'private' && chat.other_user) {
            return chat.other_user.avatar_url;
        }
        return chat.avatar_url;
    };

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    if (loading) {
        return (
            <div className="flex-center h-full">
                <div className="spinner w-8 h-8"></div>
            </div>
        );
    }

    if (chats.length === 0) {
        return (
            <div className="flex-center h-full flex-col p-8 text-center">
                <div className="w-24 h-24 bg-telegram-bg-tertiary rounded-full flex-center mb-4">
                    <svg className="w-12 h-12 text-telegram-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                </div>
                <h3 className="text-lg font-semibold text-telegram-text mb-2">No chats yet</h3>
                <p className="text-telegram-text-secondary text-sm">
                    Start a conversation by searching for users
                </p>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full">
            {chats.map((chat) => {
                const chatName = getChatName(chat);
                const avatarUrl = getChatAvatar(chat);
                const isActive = activeChat?.id === chat.id;
                const isOnline = chat.type === 'private' && chat.other_user?.is_online;

                return (
                    <div
                        key={chat.id}
                        onClick={() => selectChat(chat.id)}
                        className={`flex items-center gap-3 p-4 cursor-pointer transition-colors border-b border-telegram-border ${isActive
                                ? 'bg-telegram-bg-tertiary'
                                : 'hover-highlight'
                            }`}
                    >
                        {/* Avatar */}
                        <div className="relative flex-shrink-0">
                            {avatarUrl ? (
                                <img
                                    src={avatarUrl}
                                    alt={chatName}
                                    className="avatar avatar-md object-cover"
                                />
                            ) : (
                                <div className="avatar avatar-md bg-telegram-blue">
                                    {getInitials(chatName)}
                                </div>
                            )}
                            {isOnline && <div className="online-indicator"></div>}
                        </div>

                        {/* Chat Info */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                                <h3 className="font-semibold text-telegram-text text-truncate">
                                    {chatName}
                                </h3>
                                {chat.last_message && (
                                    <span className="text-xs text-telegram-text-secondary flex-shrink-0 ml-2">
                                        {formatDistanceToNow(new Date(chat.last_message.created_at), { addSuffix: false })}
                                    </span>
                                )}
                            </div>

                            {chat.last_message && (
                                <div className="flex items-center justify-between">
                                    <p className="text-sm text-telegram-text-secondary text-truncate">
                                        {chat.last_message.sender_id === user?.id && 'You: '}
                                        {chat.last_message.is_deleted
                                            ? 'Message deleted'
                                            : chat.last_message.content || '📎 Attachment'}
                                    </p>
                                    {chat.unread_count && chat.unread_count > 0 && (
                                        <span className="unread-badge ml-2">
                                            {chat.unread_count > 99 ? '99+' : chat.unread_count}
                                        </span>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

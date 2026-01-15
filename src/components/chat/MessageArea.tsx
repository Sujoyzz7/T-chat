import React, { useRef, useEffect } from 'react';
import { useChat } from '../../contexts/ChatContext';
import { useAuth } from '../../contexts/AuthContext';
import { MessageBubble } from './MessageBubble';

export const MessageArea: React.FC = () => {
    const { activeChat, messages, typingUsers, loadMoreMessages } = useChat();
    const { user } = useAuth();
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const messagesContainerRef = useRef<HTMLDivElement>(null);

    // Scroll to bottom on new messages
    useEffect(() => {
        if (!messages.length) return;

        const container = messagesContainerRef.current;
        if (!container) return;

        const isAtBottom = container.scrollHeight - container.scrollTop <= container.clientHeight + 200;

        // If we are already at bottom or just loaded, scroll instantly
        // If it's a new message and we are looking at the chat, scroll smoothly
        if (isAtBottom) {
            messagesEndRef.current?.scrollIntoView({
                behavior: messages.length < 20 ? 'auto' : 'smooth'
            });
        }
    }, [messages]);

    // Handle scroll for pagination
    const handleScroll = () => {
        if (messagesContainerRef.current) {
            const { scrollTop } = messagesContainerRef.current;
            if (scrollTop === 0) {
                loadMoreMessages();
            }
        }
    };

    if (!activeChat) {
        return (
            <div className="flex-center h-full flex-col bg-telegram-bg">
                <div className="w-32 h-32 bg-telegram-bg-secondary rounded-full flex-center mb-6">
                    <svg className="w-16 h-16 text-telegram-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                </div>
                <h2 className="text-2xl font-bold text-telegram-text mb-2">
                    Select a chat to start messaging
                </h2>
                <p className="text-telegram-text-secondary">
                    Choose a conversation from the sidebar
                </p>
            </div>
        );
    }

    return (
        <div
            ref={messagesContainerRef}
            onScroll={handleScroll}
            className="flex-1 overflow-y-auto p-4 space-y-2 bg-telegram-bg"
        >
            {messages.map((message, index) => {
                const isSent = message.sender_id === user?.id;
                const showAvatar = !isSent && (
                    index === messages.length - 1 ||
                    messages[index + 1]?.sender_id !== message.sender_id
                );

                return (
                    <MessageBubble
                        key={message.id}
                        message={message}
                        isSent={isSent}
                        showAvatar={showAvatar}
                    />
                );
            })}

            {/* Typing indicator */}
            {typingUsers.length > 0 && (
                <div className="flex items-center gap-2 px-4 py-2">
                    <div className="avatar avatar-sm bg-telegram-bg-tertiary">
                        {typingUsers[0].username[0].toUpperCase()}
                    </div>
                    <div className="flex gap-1 bg-telegram-bg-tertiary px-4 py-3 rounded-2xl">
                        <div className="typing-dot"></div>
                        <div className="typing-dot animation-delay-100"></div>
                        <div className="typing-dot animation-delay-200"></div>
                    </div>
                </div>
            )}

            <div ref={messagesEndRef} />
        </div>
    );
};

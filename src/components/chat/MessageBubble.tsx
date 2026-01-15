import React from 'react';
import type { MessageWithDetails } from '../../types/database.types';
import { format } from 'date-fns';

interface MessageBubbleProps {
    message: MessageWithDetails;
    isSent: boolean;
    showAvatar: boolean;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isSent, showAvatar }) => {
    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    const renderReplyContent = (replyMessage: MessageWithDetails) => {
        if (replyMessage.is_deleted) {
            return <span className="italic opacity-60">Message deleted</span>;
        }

        if (replyMessage.content) {
            return replyMessage.content;
        }

        switch (replyMessage.message_type) {
            case 'image':
                return <span className="flex items-center gap-1 italic">📷 Photo</span>;
            case 'video':
                return <span className="flex items-center gap-1 italic">🎥 Video</span>;
            case 'audio':
                return <span className="flex items-center gap-1 italic">🎵 Audio</span>;
            case 'file':
                return <span className="flex items-center gap-1 italic">📎 {replyMessage.file_name || 'File'}</span>;
            case 'voice':
                return <span className="flex items-center gap-1 italic">🎤 Voice Message</span>;
            case 'text':
                return <span className="italic">...</span>;
            default:
                return null;
        }
    };

    return (
        <div className={`flex gap-3 mb-2 ${isSent ? 'flex-row-reverse' : 'flex-row'} items-end px-4 message-enter`}>
            {/* Avatar for received messages */}
            {!isSent && (
                <div className="flex-shrink-0 mb-1">
                    {showAvatar ? (
                        message.sender?.avatar_url ? (
                            <img
                                src={message.sender.avatar_url}
                                alt={message.sender.username}
                                className="avatar avatar-sm object-cover ring-1 ring-telegram-border"
                            />
                        ) : (
                            <div className="avatar avatar-sm bg-gradient-to-tr from-telegram-blue to-telegram-blue-light text-white">
                                {message.sender?.username ? getInitials(message.sender.username) : '?'}
                            </div>
                        )
                    ) : (
                        <div className="w-8 h-8"></div>
                    )}
                </div>
            )}

            {/* Message bubble container */}
            <div className={`flex flex-col ${isSent ? 'items-end' : 'items-start'} max-w-[85%] md:max-w-[70%]`}>
                {/* Message bubble */}
                <div
                    className={`relative rounded-2xl px-3 py-2 shadow-sm transition-opacity duration-300 ${isSent
                        ? 'bg-telegram-blue text-white rounded-br-md'
                        : 'bg-telegram-bg-tertiary text-telegram-text rounded-bl-md'
                        } ${message.is_optimistic ? 'opacity-70 grayscale-[0.2]' : 'opacity-100'}`}
                >
                    {/* Reply to message */}
                    {message.reply_to && (
                        <div className={`text-[12px] px-2 py-1 mb-2 rounded border-l-[3px] cursor-pointer hover:bg-black hover:bg-opacity-5 transition-colors ${isSent
                            ? 'bg-white bg-opacity-10 border-white'
                            : 'bg-black bg-opacity-20 border-telegram-blue'
                            }`}>
                            <div className={`${isSent ? 'text-white text-opacity-80' : 'text-telegram-text-secondary'} line-clamp-1`}>
                                {renderReplyContent(message.reply_to)}
                            </div>
                        </div>
                    )}

                    {/* Media content */}
                    {message.file_url && message.message_type === 'image' && (
                        <div className="-mx-1 -mt-1 mb-1 overflow-hidden rounded-lg">
                            <img
                                src={message.file_url}
                                alt={message.file_name || 'Image'}
                                className="max-w-full max-h-96 object-cover cursor-pointer hover:opacity-95 transition-opacity"
                                onClick={() => window.open(message.file_url, '_blank')}
                            />
                        </div>
                    )}

                    {/* Text content */}
                    {message.content && (
                        <p className="text-[15px] leading-relaxed whitespace-pre-wrap break-words pr-12 min-w-[60px]">
                            {message.content}
                        </p>
                    )}

                    {/* Metadata (Pinned to bottom right) */}
                    <div className={`absolute bottom-1 right-2 flex items-center gap-0.5 text-[10px] ${isSent ? 'text-white text-opacity-70' : 'text-telegram-text-secondary'
                        }`}>
                        <span>{format(new Date(message.created_at), 'HH:mm')}</span>
                        {isSent && (
                            message.is_optimistic ? (
                                <svg className="w-3.5 h-3.5 ml-0.5 animate-spin-slow opacity-60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="12" cy="12" r="10" strokeLinecap="round" />
                                    <path d="M12 6v6l4 2" strokeLinecap="round" />
                                </svg>
                            ) : (
                                <svg className="w-3.5 h-3.5 ml-0.5" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12,2A10,10,0,1,0,22,12,10,10,0,0,0,12,2Zm5.5,7.91-6.17,6.17a.89.89,0,0,1-.64.26h0a.89.89,0,0,1-.64-.26L6.5,12.55a.91.91,0,1,1,1.28-1.28l2.91,2.91L16.22,8.63a.91.91,0,1,1,1.28,1.28Z" />
                                </svg>
                            )
                        )}
                    </div>
                </div>

                {/* Reactions */}
                {message.reactions && message.reactions.length > 0 && (
                    <div className={`flex gap-1 mt-1 flex-wrap ${isSent ? 'flex-row-reverse' : 'flex-row'}`}>
                        {Object.entries(
                            message.reactions.reduce((acc, r) => {
                                acc[r.emoji] = (acc[r.emoji] || 0) + 1;
                                return acc;
                            }, {} as Record<string, number>)
                        ).map(([emoji, count]) => (
                            <div
                                key={emoji}
                                className="bg-telegram-bg-tertiary border border-telegram-border px-1.5 py-0.5 rounded-full text-[11px] flex items-center gap-1 hover:bg-telegram-border transition-colors cursor-pointer"
                            >
                                <span>{emoji}</span>
                                <span className="text-telegram-text-secondary font-medium">{count}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

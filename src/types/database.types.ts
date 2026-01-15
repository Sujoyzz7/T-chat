// Database types
export type ChatType = 'private' | 'group' | 'channel';
export type ParticipantRole = 'admin' | 'member';
export type MessageType = 'text' | 'image' | 'video' | 'audio' | 'file' | 'voice';

export interface User {
    id: string;
    username: string;
    full_name?: string;
    avatar_url?: string;
    bio?: string;
    phone_number?: string;
    last_seen?: string;
    is_online: boolean;
    created_at: string;
    updated_at: string;
}

export interface Chat {
    id: string;
    type: ChatType;
    name?: string;
    avatar_url?: string;
    description?: string;
    created_by?: string;
    created_at: string;
    updated_at: string;
    // Computed fields
    last_message?: Message;
    unread_count?: number;
    other_user?: User; // For private chats
}

export interface ChatParticipant {
    id: string;
    chat_id: string;
    user_id: string;
    role: ParticipantRole;
    joined_at: string;
    last_read_message_id?: string;
    notifications_enabled: boolean;
    pinned: boolean;
    archived: boolean;
    // Relations
    user?: User;
}

export interface Message {
    id: string;
    chat_id: string;
    sender_id?: string;
    content?: string;
    message_type: MessageType;
    file_url?: string;
    file_name?: string;
    file_size?: number;
    reply_to_message_id?: string;
    is_edited: boolean;
    is_deleted: boolean;
    created_at: string;
    edited_at?: string;
    is_optimistic?: boolean;
    // Relations
    sender?: User;
    reply_to?: Message;
    reactions?: MessageReaction[];
    read_by?: MessageReadStatus[];
}

export interface MessageReaction {
    id: string;
    message_id: string;
    user_id: string;
    emoji: string;
    created_at: string;
    // Relations
    user?: User;
}

export interface MessageReadStatus {
    id: string;
    message_id: string;
    user_id: string;
    read_at: string;
}

export interface TypingIndicator {
    id: string;
    chat_id: string;
    user_id: string;
    is_typing: boolean;
    updated_at: string;
    // Relations
    user?: User;
}

export interface Contact {
    id: string;
    user_id: string;
    contact_user_id: string;
    contact_name?: string;
    is_blocked: boolean;
    added_at: string;
    // Relations
    contact_user?: User;
}

// UI State types
export interface ChatWithDetails extends Chat {
    participants?: ChatParticipant[];
    typing_users?: User[];
}

export interface MessageWithDetails extends Message {
    sender?: User;
    reply_to?: Message;
    is_optimistic?: boolean;
    reactions_grouped?: {
        emoji: string;
        count: number;
        users: User[];
        user_reacted: boolean;
    }[];
}

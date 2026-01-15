import { supabase } from '../lib/supabase';
import type { MessageWithDetails, MessageReaction } from '../types/database.types';

export const messageService = {
    // Send a text message
    async sendMessage(chatId: string, content: string, replyToId?: string) {
        const currentUser = (await supabase.auth.getUser()).data.user;
        if (!currentUser) throw new Error('Not authenticated');

        const { data, error } = await supabase
            .from('messages')
            .insert({
                chat_id: chatId,
                sender_id: currentUser.id,
                content,
                message_type: 'text',
                reply_to_message_id: replyToId,
            })
            .select(`
        *,
        sender:users (*),
        reply_to:messages (
          *,
          sender:users (*)
        )
      `)
            .single();

        if (error) throw error;
        return data as MessageWithDetails;
    },

    // Send a file message
    async sendFileMessage(
        chatId: string,
        fileUrl: string,
        fileName: string,
        fileSize: number,
        messageType: 'image' | 'video' | 'audio' | 'file' | 'voice',
        content?: string
    ) {
        const currentUser = (await supabase.auth.getUser()).data.user;
        if (!currentUser) throw new Error('Not authenticated');

        const { data, error } = await supabase
            .from('messages')
            .insert({
                chat_id: chatId,
                sender_id: currentUser.id,
                content,
                message_type: messageType,
                file_url: fileUrl,
                file_name: fileName,
                file_size: fileSize,
            })
            .select(`
                *,
                sender:users (*),
                reply_to:messages (
                    *,
                    sender:users (*)
                )
            `)
            .single();

        if (error) throw error;
        return data as MessageWithDetails;
    },

    // Get messages for a chat
    async getMessages(chatId: string, limit = 50, beforeId?: string) {
        let query = supabase
            .from('messages')
            .select(`
        *,
        sender:users (*),
        reply_to:messages (
          *,
          sender:users (*)
        ),
        reactions:message_reactions (
          *,
          user:users (*)
        )
      `)
            .eq('chat_id', chatId)
            .eq('is_deleted', false)
            .order('created_at', { ascending: false })
            .limit(limit);

        if (beforeId) {
            const { data: beforeMessage } = await supabase
                .from('messages')
                .select('created_at')
                .eq('id', beforeId)
                .single();

            if (beforeMessage) {
                query = query.lt('created_at', beforeMessage.created_at);
            }
        }

        const { data, error } = await query;

        if (error) throw error;
        return (data as MessageWithDetails[]).reverse();
    },

    // Edit message
    async editMessage(messageId: string, newContent: string) {
        const { data, error } = await supabase
            .from('messages')
            .update({
                content: newContent,
                is_edited: true,
                edited_at: new Date().toISOString(),
            })
            .eq('id', messageId)
            .select(`
                *,
                sender:users (*),
                reply_to:messages (
                    *,
                    sender:users (*)
                )
            `)
            .single();

        if (error) throw error;
        return data as MessageWithDetails;
    },

    // Delete message
    async deleteMessage(messageId: string) {
        const { error } = await supabase
            .from('messages')
            .update({ is_deleted: true })
            .eq('id', messageId);

        if (error) throw error;
    },

    // Add reaction to message
    async addReaction(messageId: string, emoji: string) {
        const currentUser = (await supabase.auth.getUser()).data.user;
        if (!currentUser) throw new Error('Not authenticated');

        const { data, error } = await supabase
            .from('message_reactions')
            .insert({
                message_id: messageId,
                user_id: currentUser.id,
                emoji,
            })
            .select(`
        *,
        user:users (*)
      `)
            .single();

        if (error) throw error;
        return data as MessageReaction;
    },

    // Remove reaction from message
    async removeReaction(messageId: string, emoji: string) {
        const currentUser = (await supabase.auth.getUser()).data.user;
        if (!currentUser) throw new Error('Not authenticated');

        const { error } = await supabase
            .from('message_reactions')
            .delete()
            .eq('message_id', messageId)
            .eq('user_id', currentUser.id)
            .eq('emoji', emoji);

        if (error) throw error;
    },

    // Mark messages as read
    async markAsRead(messageIds: string[]) {
        const currentUser = (await supabase.auth.getUser()).data.user;
        if (!currentUser) throw new Error('Not authenticated');

        const readStatuses = messageIds.map(id => ({
            message_id: id,
            user_id: currentUser.id,
        }));

        const { error } = await supabase
            .from('message_read_status')
            .upsert(readStatuses);

        if (error) throw error;
    },

    // Set typing indicator
    async setTyping(chatId: string, isTyping: boolean) {
        const currentUser = (await supabase.auth.getUser()).data.user;
        if (!currentUser) throw new Error('Not authenticated');

        if (isTyping) {
            const { error } = await supabase
                .from('typing_indicators')
                .upsert({
                    chat_id: chatId,
                    user_id: currentUser.id,
                    is_typing: true,
                    updated_at: new Date().toISOString(),
                });

            if (error) throw error;
        } else {
            const { error } = await supabase
                .from('typing_indicators')
                .delete()
                .eq('chat_id', chatId)
                .eq('user_id', currentUser.id);

            if (error) throw error;
        }
    },
};

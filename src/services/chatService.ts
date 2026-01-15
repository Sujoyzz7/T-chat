import { supabase } from '../lib/supabase';
import type { Chat, ChatParticipant, ChatWithDetails } from '../types/database.types';

export const chatService = {
    // Create or get private chat
    async createOrGetPrivateChat(otherUserId: string) {
        const { data, error } = await supabase.rpc('create_or_get_private_chat', {
            user1_id: (await supabase.auth.getUser()).data.user?.id,
            user2_id: otherUserId,
        });

        if (error) throw error;
        return data as string; // Returns chat_id
    },

    // Create group chat
    async createGroupChat(name: string, participantIds: string[], avatarUrl?: string, description?: string) {
        const currentUser = (await supabase.auth.getUser()).data.user;
        if (!currentUser) throw new Error('Not authenticated');

        // Create chat
        const { data: chat, error: chatError } = await supabase
            .from('chats')
            .insert({
                type: 'group',
                name,
                avatar_url: avatarUrl,
                description,
                created_by: currentUser.id,
            })
            .select()
            .single();

        if (chatError) throw chatError;

        // Add participants (including creator as admin)
        const participants = [
            { chat_id: chat.id, user_id: currentUser.id, role: 'admin' },
            ...participantIds.map(id => ({ chat_id: chat.id, user_id: id, role: 'member' })),
        ];

        const { error: participantsError } = await supabase
            .from('chat_participants')
            .insert(participants);

        if (participantsError) throw participantsError;

        return chat as Chat;
    },

    // Get user's chats
    async getUserChats() {
        const currentUser = (await supabase.auth.getUser()).data.user;
        if (!currentUser) throw new Error('Not authenticated');

        const { data, error } = await supabase
            .from('chat_participants')
            .select(`
        *,
        chat:chats (
          *,
          participants:chat_participants (
            *,
            user:users (*)
          )
        )
      `)
            .eq('user_id', currentUser.id)
            .order('joined_at', { ascending: false });

        if (error) throw error;

        // Transform data to include chat details
        return data.map(cp => {
            const chat = cp.chat as any;

            // For private chats, find the other user
            if (chat.type === 'private') {
                const otherParticipant = chat.participants?.find(
                    (p: any) => p.user_id !== currentUser.id
                );
                chat.other_user = otherParticipant?.user;
            }

            return {
                ...chat,
                participant_info: cp,
            };
        }) as ChatWithDetails[];
    },

    // Get chat by ID
    async getChatById(chatId: string) {
        const { data, error } = await supabase
            .from('chats')
            .select(`
        *,
        participants:chat_participants (
          *,
          user:users (*)
        )
      `)
            .eq('id', chatId)
            .single();

        if (error) throw error;
        return data as ChatWithDetails;
    },

    // Update chat settings
    async updateChatSettings(chatId: string, updates: Partial<Chat>) {
        const { data, error } = await supabase
            .from('chats')
            .update(updates)
            .eq('id', chatId)
            .select()
            .single();

        if (error) throw error;
        return data as Chat;
    },

    // Update participant settings
    async updateParticipantSettings(chatId: string, updates: Partial<ChatParticipant>) {
        const currentUser = (await supabase.auth.getUser()).data.user;
        if (!currentUser) throw new Error('Not authenticated');

        const { data, error } = await supabase
            .from('chat_participants')
            .update(updates)
            .eq('chat_id', chatId)
            .eq('user_id', currentUser.id)
            .select()
            .single();

        if (error) throw error;
        return data as ChatParticipant;
    },

    // Leave chat
    async leaveChat(chatId: string) {
        const currentUser = (await supabase.auth.getUser()).data.user;
        if (!currentUser) throw new Error('Not authenticated');

        const { error } = await supabase
            .from('chat_participants')
            .delete()
            .eq('chat_id', chatId)
            .eq('user_id', currentUser.id);

        if (error) throw error;
    },

    async addParticipant(chatId: string, userId: string, role: 'admin' | 'member' = 'member') {
        const { data, error } = await supabase
            .from('chat_participants')
            .insert({
                chat_id: chatId,
                user_id: userId,
                role,
            })
            .select()
            .single();

        if (error) throw error;
        return data as ChatParticipant;
    },

    async removeParticipant(chatId: string, userId: string) {
        const { error } = await supabase
            .from('chat_participants')
            .delete()
            .eq('chat_id', chatId)
            .eq('user_id', userId);

        if (error) throw error;
    },

    // Delete chat completely
    async deleteChat(chatId: string) {
        const currentUser = (await supabase.auth.getUser()).data.user;
        if (!currentUser) throw new Error('Not authenticated');

        // Check if it's a private chat or if user is admin
        const { data: chat } = await supabase
            .from('chats')
            .select('*')
            .eq('id', chatId)
            .single();

        if (chat?.type === 'private' || chat?.created_by === currentUser.id) {
            // Full deletion (cascade will handle participants and messages)
            const { error } = await supabase
                .from('chats')
                .delete()
                .eq('id', chatId);
            if (error) throw error;
        } else {
            // Just leave if it's a group the user didn't create
            await this.leaveChat(chatId);
        }
    },
};

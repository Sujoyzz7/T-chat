import { supabase } from '../lib/supabase';
import type { User } from '../types/database.types';

export const authService = {
    // Sign up with email and password
    async signUp(email: string, password: string, username: string, fullName?: string) {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    username,
                    full_name: fullName,
                },
            },
        });

        if (error) throw error;
        return data;
    },

    // Sign in with email and password
    async signIn(email: string, password: string) {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) throw error;
        return data;
    },

    // Sign out
    async signOut() {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
    },

    // Get current session
    async getSession() {
        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;
        return data.session;
    },

    // Get current user
    async getCurrentUser() {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error) throw error;
        return user;
    },

    // Update user profile
    async updateProfile(userId: string, updates: Partial<User>) {
        const { data, error } = await supabase
            .from('users')
            .update(updates)
            .eq('id', userId)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    // Update online status
    async updateOnlineStatus(userId: string, isOnline: boolean) {
        const { error } = await supabase
            .from('users')
            .update({
                is_online: isOnline,
                last_seen: new Date().toISOString(),
            })
            .eq('id', userId);

        if (error) throw error;
    },

    // Get user by ID
    async getUserById(userId: string) {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', userId)
            .single();

        if (error) throw error;
        return data as User;
    },

    // Search users by username
    async searchUsers(query: string) {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .ilike('username', `%${query}%`)
            .limit(20);

        if (error) throw error;
        return data as User[];
    },

    // Block a user
    async blockUser(blockedId: string) {
        const currentUser = (await supabase.auth.getUser()).data.user;
        if (!currentUser) throw new Error('Not authenticated');

        const { error } = await supabase
            .from('blocks')
            .insert({
                blocker_id: currentUser.id,
                blocked_id: blockedId,
            });

        if (error) throw error;
    },

    // Unblock a user
    async unblockUser(blockedId: string) {
        const currentUser = (await supabase.auth.getUser()).data.user;
        if (!currentUser) throw new Error('Not authenticated');

        const { error } = await supabase
            .from('blocks')
            .delete()
            .eq('blocker_id', currentUser.id)
            .eq('blocked_id', blockedId);

        if (error) throw error;
    },

    // Get blocked users
    async getBlockedUsers() {
        const currentUser = (await supabase.auth.getUser()).data.user;
        if (!currentUser) throw new Error('Not authenticated');

        const { data, error } = await supabase
            .from('blocks')
            .select('blocked_id');

        if (error) throw error;
        return data.map(b => b.blocked_id);
    },

    // Get blocked users with full profiles
    async getBlockedUsersFull() {
        const currentUser = (await supabase.auth.getUser()).data.user;
        if (!currentUser) throw new Error('Not authenticated');

        const { data, error } = await supabase
            .from('blocks')
            .select(`
                blocked_id,
                blocked:users!blocks_blocked_id_fkey (*)
            `)
            .eq('blocker_id', currentUser.id);

        if (error) throw error;
        return data.map(b => b.blocked) as unknown as User[];
    },
};

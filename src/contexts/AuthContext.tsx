import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { authService } from '../services/authService';
import type { User } from '../types/database.types';

interface AuthContextType {
    user: User | null;
    session: Session | null;
    loading: boolean;
    signIn: (email: string, password: string) => Promise<void>;
    signUp: (email: string, password: string, username: string, fullName?: string) => Promise<void>;
    signOut: () => Promise<void>;
    updateProfile: (updates: Partial<User>) => Promise<void>;
    blockUser: (userId: string) => Promise<void>;
    unblockUser: (userId: string) => Promise<void>;
    blockedUsers: string[]; // Users YOU have blocked
    isBlockedBy: string[];  // Users who have blocked YOU
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);
    const [blockedUsers, setBlockedUsers] = useState<string[]>([]);
    const [isBlockedBy, setIsBlockedBy] = useState<string[]>([]);

    useEffect(() => {
        let mounted = true;
        let authInitialized = false;

        console.log('[AuthContext] Mount - Initializing Auth...');

        // Safety timeout to prevent infinite loading screen
        const safetyTimeout = setTimeout(() => {
            if (mounted && !authInitialized) {
                console.warn('[AuthContext] Safety timeout reached! Forcing loading state to false.');
                setLoading(false);
            }
        }, 10000);

        const handleAuthChange = async (event: string, currentSession: Session | null) => {
            console.log(`[AuthContext] Auth Event: ${event}`, { userId: currentSession?.user?.id });

            if (!mounted) return;
            setSession(currentSession);

            if (currentSession?.user) {
                // Only trigger global loading during the very first app load
                const profile = await loadUserProfile(currentSession.user.id, !authInitialized);
                await loadBlockedUsers(profile);
            } else {
                console.log('[AuthContext] No session, clearing user state');
                setUser(null);
                setLoading(false);
            }

            authInitialized = true;
        };

        // Initialize session and then listen for changes
        const init = async () => {
            try {
                const { data: { session: initialSession } } = await supabase.auth.getSession();
                console.log('[AuthContext] Initial session check:', { hasSession: !!initialSession });
                await handleAuthChange('INITIAL', initialSession);
            } catch (error) {
                console.error('[AuthContext] Fatal initialization error:', error);
                if (mounted) setLoading(false);
            }
        };

        init();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, currentSession) => {
            // Skip the initial trigger since we handle it in init()
            if (authInitialized) {
                handleAuthChange(event, currentSession);
            }
        });

        return () => {
            console.log('[AuthContext] Unmount - Cleaning up');
            mounted = false;
            clearTimeout(safetyTimeout);
            subscription.unsubscribe();
        };
    }, []);

    // Heartbeat to update online status
    useEffect(() => {
        if (!user) return;

        const interval = setInterval(() => {
            authService.updateOnlineStatus(user.id, true);
        }, 30000); // Update every 30 seconds

        return () => clearInterval(interval);
    }, [user]);

    const loadUserProfile = async (userId: string, isInitial: boolean = false) => {
        console.log(`[AuthContext] loadUserProfile(userId: ${userId}, isInitial: ${isInitial})`);
        if (isInitial) setLoading(true);

        try {
            const profile = await authService.getUserById(userId);
            console.log('[AuthContext] Profile loaded successfully:', profile?.username);
            setUser(profile);
            return profile;
        } catch (error: any) {
            console.error('[AuthContext] Error loading user profile:', error);
            setUser(null);
            throw error;
        } finally {
            if (isInitial) setLoading(false);
        }
    };

    const signIn = async (email: string, password: string) => {
        console.log('[AuthContext] signIn called');
        try {
            const { session: newSession } = await authService.signIn(email, password);
            console.log('[AuthContext] authService.signIn resolved', { hasSession: !!newSession });

            // Note: We don't call loadUserProfile here because onAuthStateChange will catch it
            // and we don't want to trigger global loading (which unmounts AuthPage)
            if (newSession?.user) {
                await loadUserProfile(newSession.user.id, false);
            }
        } catch (error: any) {
            console.error('[AuthContext] signIn error:', error);
            throw error;
        }
    };

    const signUp = async (email: string, password: string, username: string, fullName?: string) => {
        console.log('[AuthContext] signUp called');
        try {
            const { session: newSession } = await authService.signUp(email, password, username, fullName);
            console.log('[AuthContext] authService.signUp resolved', { hasSession: !!newSession });

            if (newSession?.user) {
                // Wait for potential trigger lag
                await new Promise(resolve => setTimeout(resolve, 2000));
                await loadUserProfile(newSession.user.id, false);
            }
        } catch (error: any) {
            console.error('[AuthContext] signUp error:', error);
            throw error;
        }
    };

    const signOut = async () => {
        console.log('[AuthContext] signOut called');
        try {
            // Try to update status, but don't let it block sign out if it fails
            if (user) {
                await authService.updateOnlineStatus(user.id, false).catch(err => {
                    console.warn('[AuthContext] Failed to update online status during sign out:', err);
                });
            }

            // Try to sign out from Supabase
            await authService.signOut().catch(err => {
                console.error('[AuthContext] Supabase signOut error:', err);
            });
        } catch (error) {
            console.error('[AuthContext] signOut unexpected error:', error);
        } finally {
            // ALWAYS clear local state
            console.log('[AuthContext] Clearing local user state');
            setUser(null);
            setSession(null);
            setLoading(false);
        }
    };

    const updateProfile = async (updates: Partial<User>) => {
        if (!user) throw new Error('No user logged in');
        const updatedUser = await authService.updateProfile(user.id, updates);
        setUser(updatedUser);
    };

    const loadBlockedUsers = async (profile?: User) => {
        const currentUser = profile || user;
        if (!currentUser) return;

        try {
            const { data: blockedByMe } = await supabase
                .from('blocks')
                .select('blocked_id')
                .eq('blocker_id', currentUser.id);

            const { data: blockedByThem } = await supabase
                .from('blocks')
                .select('blocker_id')
                .eq('blocked_id', currentUser.id);

            setBlockedUsers(blockedByMe?.map(b => b.blocked_id) || []);
            setIsBlockedBy(blockedByThem?.map(b => b.blocker_id) || []);
        } catch (error) {
            console.error('[AuthContext] Error loading blocked users:', error);
        }
    };

    // Real-time subscription for blocks
    useEffect(() => {
        if (!user) return;

        const blocksSubscription = supabase
            .channel('public:blocks')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'blocks',
                },
                () => {
                    console.log('[AuthContext] Blocks changed, reloading...');
                    loadBlockedUsers();
                }
            )
            .subscribe();

        return () => {
            blocksSubscription.unsubscribe();
        };
    }, [user]);

    const blockUser = async (userId: string) => {
        await authService.blockUser(userId);
        await loadBlockedUsers();
    };

    const unblockUser = async (userId: string) => {
        await authService.unblockUser(userId);
        await loadBlockedUsers();
    };

    const value = {
        user,
        session,
        loading,
        blockedUsers,
        isBlockedBy,
        signIn,
        signUp,
        signOut,
        updateProfile,
        blockUser,
        unblockUser,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { authService } from '../../services/authService';
import type { User } from '../../types/database.types';

interface BlockedUsersModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const BlockedUsersModal: React.FC<BlockedUsersModalProps> = ({ isOpen, onClose }) => {
    const { unblockUser } = useAuth();
    const [blockedList, setBlockedList] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);

    const loadBlockedList = async () => {
        try {
            setLoading(true);
            const list = await authService.getBlockedUsersFull();
            setBlockedList(list);
        } catch (error) {
            console.error('Failed to load blocked list:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen) {
            loadBlockedList();
        }
    }, [isOpen]);

    const handleUnblock = async (userId: string) => {
        try {
            await unblockUser(userId);
            // Refresh list
            setBlockedList(prev => prev.filter(u => u.id !== userId));
        } catch (error) {
            console.error('Failed to unblock user:', error);
        }
    };

    if (!isOpen) return null;

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm animate-fade-in">
            <div className="bg-telegram-bg-secondary w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-telegram-border animate-slide-up">
                {/* Header */}
                <div className="p-4 border-b border-telegram-border flex items-center gap-4 bg-telegram-bg">
                    <button
                        onClick={onClose}
                        className="btn-ghost p-2 rounded-full text-telegram-text-secondary"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                    </button>
                    <h2 className="text-xl font-bold text-telegram-text">Blocked Users</h2>
                </div>

                {/* Content */}
                <div className="max-h-[60vh] overflow-y-auto">
                    {loading ? (
                        <div className="p-8 flex justify-center">
                            <div className="spinner w-8 h-8"></div>
                        </div>
                    ) : blockedList.length === 0 ? (
                        <div className="p-12 text-center text-telegram-text-secondary">
                            <div className="w-20 h-20 bg-telegram-bg-tertiary rounded-full flex items-center justify-center mx-auto mb-4 opacity-50">
                                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636" />
                                </svg>
                            </div>
                            <p>You haven't blocked anyone yet.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-telegram-border">
                            {blockedList.map((blockedUser) => (
                                <div key={blockedUser.id} className="flex items-center justify-between p-4 hover:bg-black hover:bg-opacity-5 transition-colors">
                                    <div className="flex items-center gap-3">
                                        {blockedUser.avatar_url ? (
                                            <img
                                                src={blockedUser.avatar_url}
                                                alt={blockedUser.username}
                                                className="avatar avatar-md object-cover"
                                            />
                                        ) : (
                                            <div className="avatar avatar-md bg-telegram-blue">
                                                {getInitials(blockedUser.full_name || blockedUser.username)}
                                            </div>
                                        )}
                                        <div className="min-w-0">
                                            <h3 className="font-semibold text-telegram-text truncate">
                                                {blockedUser.full_name || blockedUser.username}
                                            </h3>
                                            <p className="text-xs text-telegram-text-secondary">
                                                @{blockedUser.username}
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleUnblock(blockedUser.id)}
                                        className="text-telegram-blue hover:underline text-sm font-medium"
                                    >
                                        Unblock
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer Info */}
                <div className="p-4 bg-telegram-bg text-center border-t border-telegram-border">
                    <p className="text-xs text-telegram-text-secondary">
                        Blocked users will not be able to message you or see your online status.
                    </p>
                </div>
            </div>
        </div>
    );
};

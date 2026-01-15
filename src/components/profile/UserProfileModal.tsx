import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import type { User } from '../../types/database.types';

interface UserProfileModalProps {
    user: User | null;
    isOpen: boolean;
    onClose: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({ user, isOpen, onClose }) => {
    const { blockedUsers, blockUser, unblockUser } = useAuth();

    if (!isOpen || !user) return null;

    const isBlocked = blockedUsers.includes(user.id);

    const handleBlockToggle = async () => {
        try {
            if (isBlocked) {
                await unblockUser(user.id);
            } else {
                if (window.confirm(`Are you sure you want to block ${user.full_name || user.username}?`)) {
                    await blockUser(user.id);
                }
            }
        } catch (error) {
            console.error('Error toggling block:', error);
        }
    };

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black bg-opacity-60 backdrop-blur-md animate-fade-in">
            <div className="bg-telegram-bg-secondary w-full max-w-sm rounded-[28px] shadow-2xl overflow-hidden border border-telegram-border animate-scale-in">
                {/* Header with Close Button */}
                <div className="p-4 flex justify-end bg-telegram-bg-secondary">
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-black hover:bg-opacity-5 rounded-full text-telegram-text-secondary transition-colors"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Profile Content */}
                <div className="px-8 pb-10 flex flex-col items-center">
                    {/* Large Avatar */}
                    <div className="mb-6 relative">
                        <div className="w-32 h-32 rounded-full border-4 border-telegram-blue p-1 shadow-xl">
                            <div className="w-full h-full rounded-full overflow-hidden bg-telegram-blue">
                                {user.avatar_url ? (
                                    <img
                                        src={user.avatar_url}
                                        alt={user.username}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-white uppercase">
                                        {getInitials(user.full_name || user.username)}
                                    </div>
                                )}
                            </div>
                        </div>
                        {user.is_online && !isBlocked && (
                            <div className="absolute bottom-2 right-2 w-6 h-6 bg-telegram-online border-4 border-telegram-bg-secondary rounded-full"></div>
                        )}
                    </div>

                    {/* Basic Info */}
                    <div className="text-center mb-8">
                        <h2 className="text-2xl font-bold text-telegram-text mb-1">
                            {user.full_name || user.username}
                        </h2>
                        <span className="text-telegram-online font-medium">@{user.username}</span>
                        {isBlocked && (
                            <p className="text-red-500 text-xs font-bold mt-1 uppercase tracking-wider">Blocked</p>
                        )}
                    </div>

                    {/* Detailed Info Cards */}
                    <div className="w-full space-y-4">
                        {/* Bio Card */}
                        <div className="bg-telegram-bg-tertiary p-4 rounded-2xl border border-telegram-border border-opacity-50">
                            <div className="flex items-start gap-4">
                                <div className="text-telegram-blue mt-1">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div className="flex-1">
                                    <p className="text-xs font-bold text-telegram-blue uppercase tracking-widest mb-1">Bio</p>
                                    <p className="text-telegram-text leading-relaxed">
                                        {user.bio || 'No bio yet...'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Contact Info Card */}
                        <div className="bg-telegram-bg-tertiary p-4 rounded-2xl border border-telegram-border border-opacity-50">
                            <div className="space-y-4">
                                <div className="flex items-center gap-4">
                                    <div className="text-telegram-blue">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-telegram-blue uppercase tracking-widest leading-none mb-1">Mobile</p>
                                        <p className="text-telegram-text">{user.phone_number || 'Not provided'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="w-full mt-8 space-y-3">
                        <button
                            onClick={handleBlockToggle}
                            className={`w-full py-3 font-bold rounded-2xl transition-all border-2 ${isBlocked
                                ? 'border-telegram-blue text-telegram-blue hover:bg-telegram-blue hover:text-white'
                                : 'border-red-500 text-red-500 hover:bg-red-500 hover:text-white'
                                }`}
                        >
                            {isBlocked ? 'Unblock User' : 'Block User'}
                        </button>
                        <button
                            onClick={onClose}
                            className="w-full py-4 bg-telegram-blue text-white font-bold rounded-2xl shadow-lg shadow-blue-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                        >
                            Close Profile
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};


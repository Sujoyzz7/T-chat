import React, { useState, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { storageService } from '../../services/storageService';
import { BlockedUsersModal } from './BlockedUsersModal';
import { PrivacyPolicyModal } from './PrivacyPolicyModal';
import { User } from '../../types/database.types';

interface ProfileSettingsProps {
    isOpen: boolean;
    onClose: () => void;
}

export const ProfileSettings: React.FC<ProfileSettingsProps> = ({ isOpen, onClose }) => {
    const { user, updateProfile } = useAuth();
    const [fullName, setFullName] = useState(user?.full_name || '');
    const [username, setUsername] = useState(user?.username || '');
    const [bio, setBio] = useState(user?.bio || '');
    const [phoneNumber, setPhoneNumber] = useState(user?.phone_number || '');
    const [loading, setLoading] = useState(false);
    const [isBlockedListOpen, setIsBlockedListOpen] = useState(false);
    const [isPrivacyPolicyOpen, setIsPrivacyPolicyOpen] = useState(false);
    const [error, setError] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [activeTab, setActiveTab] = useState<'profile' | 'privacy'>('profile');

    const isDefaultUsername = (uname: string) => {
        return /^user_[a-f0-9]{8}$/.test(uname);
    };

    const usernameIsLocked = !!(user?.username && !isDefaultUsername(user.username));

    const handleAvatarClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !user) return;

        try {
            setLoading(true);
            setError('');
            storageService.validateFile(file, 'image');
            const avatarUrl = await storageService.uploadAvatar(file, user.id);
            await updateProfile({ avatar_url: avatarUrl });
        } catch (err: any) {
            setError(err.message || 'Failed to upload avatar');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        // Basic validation
        if (!username.trim()) {
            setError('Username cannot be empty');
            return;
        }

        try {
            setLoading(true);
            setError('');
            const profileUpdates: Partial<User> = {
                full_name: fullName.trim(),
                bio: bio.trim(),
                phone_number: phoneNumber.trim(),
            };

            // Only update username if it's not locked
            if (!usernameIsLocked) {
                profileUpdates.username = username.trim().toLowerCase();
            }

            await updateProfile(profileUpdates);
            onClose();
        } catch (err: any) {
            console.error('Update profile error:', err);
            if (err.code === '23505') {
                setError('This username is already taken. Please choose another one.');
            } else {
                setError(err.message || 'Failed to update profile');
            }
        } finally {
            setLoading(false);
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-60 backdrop-blur-sm animate-fade-in text-telegram-text">
            <div className="bg-telegram-bg-secondary w-full max-w-4xl h-[600px] rounded-3xl shadow-2xl overflow-hidden border border-telegram-border animate-scale-in flex">

                {/* Side Navigation */}
                <div className="w-64 border-r border-telegram-border bg-telegram-bg flex flex-col p-4">
                    <div className="mb-8 px-2">
                        <h2 className="text-xl font-bold">Settings</h2>
                    </div>

                    <div className="space-y-1">
                        <button
                            onClick={() => setActiveTab('profile')}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all font-medium ${activeTab === 'profile'
                                ? 'bg-telegram-blue text-white'
                                : 'hover:bg-black hover:bg-opacity-5 text-telegram-text-secondary'
                                }`}
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            Edit Profile
                        </button>
                        <button
                            onClick={() => setActiveTab('privacy')}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all font-medium ${activeTab === 'privacy'
                                ? 'bg-telegram-blue text-white'
                                : 'hover:bg-black hover:bg-opacity-5 text-telegram-text-secondary'
                                }`}
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                            Privacy & Security
                        </button>
                    </div>

                    <div className="mt-auto">
                        <button
                            onClick={onClose}
                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-telegram-text-secondary hover:bg-black hover:bg-opacity-5 transition-all font-medium"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            Close Settings
                        </button>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 flex flex-col bg-telegram-bg-secondary relative">
                    {/* Content Header */}
                    <div className="p-6 border-b border-telegram-border flex items-center justify-between">
                        <h3 className="text-xl font-bold">
                            {activeTab === 'profile' ? 'Profile Settings' : 'Privacy & Security'}
                        </h3>
                        {activeTab === 'profile' && (
                            <button
                                onClick={handleSubmit}
                                disabled={loading}
                                className="bg-telegram-blue text-white px-6 py-2 rounded-xl font-bold hover:bg-opacity-90 disabled:opacity-50 transition-all flex items-center gap-2"
                            >
                                {loading && <div className="spinner-white w-4 h-4"></div>}
                                Save Changes
                            </button>
                        )}
                    </div>

                    {/* Scrollable Content */}
                    <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                        {error && (
                            <div className="mb-6 p-4 bg-red-500 bg-opacity-10 text-red-400 rounded-2xl text-sm border border-red-500 border-opacity-20">
                                {error}
                            </div>
                        )}

                        {activeTab === 'profile' ? (
                            <div className="max-w-xl mx-auto space-y-8">
                                {/* Avatar Upload */}
                                <div className="flex flex-col items-center">
                                    <div className="relative group cursor-pointer" onClick={handleAvatarClick}>
                                        <div className="w-32 h-32 rounded-3xl overflow-hidden border-4 border-telegram-blue p-1 shadow-2xl relative transition-transform group-hover:scale-[1.02]">
                                            <div className="w-full h-full rounded-2xl overflow-hidden bg-telegram-blue">
                                                {user?.avatar_url ? (
                                                    <img src={user.avatar_url} alt={user.username} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-white uppercase">
                                                        {user?.username ? getInitials(user.full_name || user.username) : 'U'}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl">
                                                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                                </svg>
                                            </div>
                                        </div>
                                        {loading && (
                                            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20 rounded-3xl">
                                                <div className="spinner w-8 h-8"></div>
                                            </div>
                                        )}
                                        <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                                    </div>
                                    <p className="mt-4 text-telegram-blue font-bold hover:underline cursor-pointer" onClick={handleAvatarClick}>
                                        Change Profile Photo
                                    </p>
                                </div>

                                {/* Form Fields */}
                                <div className="grid grid-cols-1 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-telegram-blue uppercase tracking-widest ml-1">Full Name</label>
                                        <div className="relative group">
                                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-telegram-text-secondary group-focus-within:text-telegram-blue transition-colors">
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                </svg>
                                            </div>
                                            <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} className="input-large pl-12" placeholder="Your full name" />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center ml-1">
                                            <label className="text-sm font-bold text-telegram-blue uppercase tracking-widest">Username</label>
                                            {usernameIsLocked && (
                                                <span className="text-[10px] bg-green-500 bg-opacity-10 text-green-500 px-2 py-0.5 rounded-full font-bold uppercase tracking-tighter flex items-center gap-1">
                                                    <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                                                    </svg>
                                                    Verified Handle
                                                </span>
                                            )}
                                        </div>
                                        <div className={`relative group ${usernameIsLocked ? 'opacity-60 grayscale-[0.5]' : ''}`}>
                                            <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-1.5 text-telegram-text-secondary group-focus-within:text-telegram-blue transition-colors">
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                                                </svg>
                                                <span className="font-bold text-lg">@</span>
                                            </div>
                                            <input
                                                type="text"
                                                value={username}
                                                onChange={(e) => setUsername(e.target.value)}
                                                className={`input-large pl-16 ${usernameIsLocked ? 'cursor-not-allowed bg-telegram-bg-tertiary border-transparent' : ''}`}
                                                placeholder="username"
                                                disabled={usernameIsLocked}
                                            />
                                        </div>
                                        <p className="text-xs text-telegram-text-secondary ml-1">
                                            {usernameIsLocked
                                                ? "Your username is verified and cannot be changed. This helps other users identify you reliably."
                                                : "You can choose a unique username. Once set, it cannot be changed, so choose carefully!"}
                                        </p>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-telegram-blue uppercase tracking-widest ml-1">Bio</label>
                                        <div className="relative group">
                                            <div className="absolute left-4 top-5 text-telegram-text-secondary group-focus-within:text-telegram-blue transition-colors">
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                                                </svg>
                                            </div>
                                            <textarea value={bio} onChange={(e) => setBio(e.target.value)} className="input-large pl-12 min-h-[120px] py-4 resize-none" placeholder="Write something about yourself..." maxLength={70} />
                                        </div>
                                        <div className="flex justify-between px-1">
                                            <p className="text-xs text-telegram-text-secondary italic">Limit: 70 characters</p>
                                            <span className="text-xs font-bold text-telegram-blue">{70 - bio.length}</span>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-telegram-blue uppercase tracking-widest ml-1">Phone Number</label>
                                        <div className="relative group">
                                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-telegram-text-secondary group-focus-within:text-telegram-blue transition-colors">
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                                </svg>
                                            </div>
                                            <input type="tel" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} className="input-large pl-12" placeholder="+1234567890" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="max-w-xl mx-auto space-y-10">
                                <div>
                                    <h4 className="text-sm font-bold text-telegram-blue uppercase tracking-widest mb-4 ml-1">Safety Controls</h4>
                                    <button
                                        type="button"
                                        onClick={() => setIsBlockedListOpen(true)}
                                        className="w-full flex items-center justify-between p-5 bg-telegram-bg-tertiary rounded-2xl hover:bg-telegram-border transition-all active:scale-[0.98] border border-telegram-border border-opacity-50 group"
                                    >
                                        <div className="flex items-center gap-4 text-red-400">
                                            <div className="w-12 h-12 bg-red-500 bg-opacity-10 rounded-xl flex items-center justify-center group-hover:bg-opacity-20 transition-all">
                                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636" />
                                                </svg>
                                            </div>
                                            <div>
                                                <p className="font-bold text-lg leading-none mb-1">Blocked Users</p>
                                                <p className="text-xs text-telegram-text-secondary">View and manage restricted accounts</p>
                                            </div>
                                        </div>
                                        <svg className="w-6 h-6 text-telegram-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </button>
                                </div>

                                <div className="space-y-6">
                                    <h4 className="text-sm font-bold text-telegram-blue uppercase tracking-widest mb-4 ml-1">Privacy Defaults</h4>

                                    <div className="space-y-4">
                                        {['Show Online Status', 'Read Receipts', 'Allow Voice Calls'].map((label) => (
                                            <div key={label} className="flex items-center justify-between p-4 bg-telegram-bg-tertiary rounded-2xl border border-telegram-border border-opacity-30">
                                                <span className="font-medium">{label}</span>
                                                <div className="w-12 h-6 bg-telegram-blue rounded-full relative p-1 cursor-not-allowed opacity-50">
                                                    <div className="w-4 h-4 bg-white rounded-full absolute right-1"></div>
                                                </div>
                                            </div>
                                        ))}
                                        <p className="text-xs text-telegram-text-secondary italic px-2">
                                            Note: Some advanced privacy features are currently in development.
                                        </p>
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-telegram-border">
                                    <h4 className="text-sm font-bold text-telegram-blue uppercase tracking-widest mb-4 ml-1">Legal</h4>
                                    <button
                                        type="button"
                                        onClick={() => setIsPrivacyPolicyOpen(true)}
                                        className="w-full flex items-center justify-between p-5 bg-telegram-bg-tertiary rounded-2xl hover:bg-telegram-border transition-all active:scale-[0.98] border border-telegram-border border-opacity-50 group"
                                    >
                                        <div className="flex items-center gap-4 text-telegram-blue">
                                            <div className="w-12 h-12 bg-telegram-blue bg-opacity-10 rounded-xl flex items-center justify-center group-hover:bg-opacity-20 transition-all">
                                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                                </svg>
                                            </div>
                                            <div>
                                                <p className="font-bold text-lg leading-none mb-1">Privacy Policy</p>
                                                <p className="text-xs text-telegram-text-secondary">How we handle your data</p>
                                            </div>
                                        </div>
                                        <svg className="w-6 h-6 text-telegram-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Blocked Users Sub-Modal */}
            <BlockedUsersModal
                isOpen={isBlockedListOpen}
                onClose={() => setIsBlockedListOpen(false)}
            />

            {/* Privacy Policy Sub-Modal */}
            <PrivacyPolicyModal
                isOpen={isPrivacyPolicyOpen}
                onClose={() => setIsPrivacyPolicyOpen(false)}
            />
        </div>
    );
};

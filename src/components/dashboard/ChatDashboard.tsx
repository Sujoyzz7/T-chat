import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useChat } from '../../contexts/ChatContext';
import { ChatList } from '../chat/ChatList';
import { MessageArea } from '../chat/MessageArea';
import { MessageInput } from '../chat/MessageInput';
import { ProfileSettings } from '../profile/ProfileSettings';
import { ConfirmationModal } from '../common/ConfirmationModal';
import { UserProfileModal } from '../profile/UserProfileModal';
import type { User } from '../../types/database.types';

export const ChatDashboard: React.FC = () => {
    const { user, signOut, blockedUsers, isBlockedBy, blockUser, unblockUser } = useAuth();
    const { activeChat, searchUsers, startPrivateChat, deleteChat, deselectChat } = useChat();
    const [isProfileOpen, setIsProfileOpen] = React.useState(false);
    const [isBlockConfirmOpen, setIsBlockConfirmOpen] = React.useState(false);
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = React.useState(false);
    const [isViewProfileOpen, setIsViewProfileOpen] = React.useState(false);
    const [isMenuOpen, setIsMenuOpen] = React.useState(false);
    const [searchQuery, setSearchQuery] = React.useState('');
    const [searchResults, setSearchResults] = React.useState<User[]>([]);
    const [isSearching, setIsSearching] = React.useState(false);

    const handleSearch = async (query: string) => {
        setSearchQuery(query);
        if (!query.trim()) {
            setIsSearching(false);
            setSearchResults([]);
            return;
        }

        setIsSearching(true);
        try {
            const results = await searchUsers(query);
            setSearchResults(results);
        } catch (error) {
            console.error('Search error:', error);
        }
    };

    const handleStartChat = async (userId: string) => {
        await startPrivateChat(userId);
        setIsSearching(false);
        setSearchQuery('');
        setSearchResults([]);
    };

    const getChatName = () => {
        if (!activeChat) return 'T Chat';

        if (activeChat.type === 'private' && activeChat.other_user) {
            return activeChat.other_user.full_name || activeChat.other_user.username;
        }
        return activeChat.name || 'Chat';
    };

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    const isBlocked = activeChat?.other_user && blockedUsers.includes(activeChat.other_user.id);
    const amBlocked = activeChat?.other_user && isBlockedBy.includes(activeChat.other_user.id);

    return (
        <div className="h-screen flex bg-telegram-bg overflow-hidden">
            {/* Sidebar */}
            <div className={`w-full md:w-96 flex flex-col border-r border-telegram-border bg-telegram-bg-secondary transition-all duration-300 ${activeChat ? 'hidden md:flex' : 'flex'}`}>
                {/* Sidebar Header */}
                <div className="p-4 border-b border-telegram-border flex items-center justify-between">
                    <div
                        className="flex items-center gap-3 cursor-pointer hover:bg-black hover:bg-opacity-5 p-1 rounded-lg transition-colors"
                        onClick={() => setIsProfileOpen(true)}
                    >
                        {user?.avatar_url ? (
                            <img
                                src={user.avatar_url}
                                alt={user.username}
                                className="avatar avatar-md object-cover"
                            />
                        ) : (
                            <div className="avatar avatar-md bg-telegram-blue">
                                {user?.username ? getInitials(user.username) : 'U'}
                            </div>
                        )}
                        <div className="flex flex-col">
                            <h2 className="font-semibold text-telegram-text line-clamp-1">
                                {user?.full_name || user?.username}
                            </h2>
                            <p className="text-xs text-telegram-online">Online</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {/* Menu button */}
                        <button
                            onClick={() => signOut()}
                            className="btn-ghost p-2 rounded-full text-red-500 hover:bg-red-500 hover:bg-opacity-10"
                            title="Logout"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Search bar */}
                <div className="p-3">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search people..."
                            value={searchQuery}
                            onChange={(e) => handleSearch(e.target.value)}
                            className="input pl-10 py-2"
                        />
                        <svg
                            className="w-5 h-5 text-telegram-text-secondary absolute left-3 top-1/2 transform -translate-y-1/2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        {searchQuery && (
                            <button
                                onClick={() => handleSearch('')}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-telegram-text-secondary hover:text-telegram-text"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        )}
                    </div>
                </div>

                {/* Content Area (Chat List or Search Results) */}
                <div className="flex-1 overflow-y-auto">
                    {isSearching ? (
                        <div className="flex flex-col">
                            <div className="px-4 py-2 text-xs font-semibold text-telegram-blue bg-black bg-opacity-5 uppercase tracking-wider">
                                Global Search
                            </div>
                            {searchResults.length > 0 ? (
                                searchResults.map((result) => (
                                    <div
                                        key={result.id}
                                        onClick={() => handleStartChat(result.id)}
                                        className="chat-item flex items-center gap-3 p-3 transition-colors hover:bg-black hover:bg-opacity-5 cursor-pointer"
                                    >
                                        {result.avatar_url ? (
                                            <img
                                                src={result.avatar_url}
                                                alt={result.username}
                                                className="avatar avatar-md object-cover"
                                            />
                                        ) : (
                                            <div className="avatar avatar-md bg-telegram-blue">
                                                {getInitials(result.username)}
                                            </div>
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-semibold text-telegram-text text-truncate">
                                                {result.full_name || result.username}
                                            </h3>
                                            <p className="text-xs text-telegram-text-secondary">
                                                @{result.username}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="p-8 text-center text-telegram-text-secondary">
                                    No users found
                                </div>
                            )}
                        </div>
                    ) : (
                        <ChatList />
                    )}
                </div>
            </div>

            {/* Main Chat Area */}
            <div className={`flex-1 flex flex-col bg-telegram-bg relative transition-all duration-300 ${activeChat ? 'flex' : 'hidden md:flex'}`}>
                {activeChat ? (
                    <>
                        {/* Chat Header */}
                        <div className="p-3 md:p-4 border-b border-telegram-border bg-telegram-bg-secondary flex items-center justify-between z-10">
                            <div className="flex items-center gap-2 md:gap-3">
                                {/* Back button for mobile */}
                                <button
                                    onClick={() => deselectChat()}
                                    className="md:hidden p-2 -ml-2 rounded-full hover:bg-black hover:bg-opacity-5 text-telegram-blue"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                    </svg>
                                </button>

                                {activeChat.type === 'private' && activeChat.other_user ? (
                                    <div
                                        className="flex items-center gap-2 md:gap-3 cursor-pointer hover:bg-black hover:bg-opacity-5 p-1 -m-1 rounded-lg transition-colors overflow-hidden"
                                        onClick={() => setIsViewProfileOpen(true)}
                                    >
                                        <div className="relative flex-shrink-0">
                                            {activeChat.other_user.avatar_url ? (
                                                <img
                                                    src={activeChat.other_user.avatar_url}
                                                    alt={activeChat.other_user.username}
                                                    className="avatar avatar-sm md:avatar-md object-cover"
                                                />
                                            ) : (
                                                <div className="avatar avatar-sm md:avatar-md bg-telegram-blue text-xs md:text-base">
                                                    {getInitials(activeChat.other_user.username)}
                                                </div>
                                            )}
                                            {activeChat.other_user.is_online && !isBlocked && !amBlocked && (
                                                <div className="online-indicator"></div>
                                            )}
                                        </div>
                                        <div className="min-w-0">
                                            <h2 className="font-semibold text-telegram-text text-sm md:text-base line-clamp-1">
                                                {getChatName()}
                                            </h2>
                                            <p className={`text-[10px] md:text-xs ${isBlocked || amBlocked ? 'text-red-500' : 'text-telegram-text-secondary'} truncate`}>
                                                {isBlocked ? 'Blocked' : amBlocked ? 'Unavailable' : (activeChat.other_user.is_online ? 'online' : 'offline')}
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2 md:gap-3">
                                        {activeChat.avatar_url ? (
                                            <img
                                                src={activeChat.avatar_url}
                                                alt={activeChat.name}
                                                className="avatar avatar-sm md:avatar-md object-cover flex-shrink-0"
                                            />
                                        ) : (
                                            <div className="avatar avatar-sm md:avatar-md bg-telegram-blue text-xs md:text-base flex-shrink-0">
                                                {activeChat.name ? getInitials(activeChat.name) : 'G'}
                                            </div>
                                        )}
                                        <div className="min-w-0">
                                            <h2 className="font-semibold text-telegram-text text-sm md:text-base line-clamp-1">
                                                {activeChat.name}
                                            </h2>
                                            <p className="text-[10px] md:text-xs text-telegram-text-secondary">
                                                {activeChat.participants?.length || 0} members
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center gap-1 md:gap-2">
                                <button className="btn-ghost p-2 rounded-full hidden sm:block" title="Call">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                    </svg>
                                </button>

                                {/* More Options */}
                                <div className="relative">
                                    <button
                                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                                        className={`btn-ghost p-2 rounded-full transition-colors ${isMenuOpen ? 'bg-black bg-opacity-5' : ''}`}
                                    >
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                                        </svg>
                                    </button>

                                    {isMenuOpen && (
                                        <>
                                            <div className="fixed inset-0 z-10" onClick={() => setIsMenuOpen(false)}></div>
                                            <div className="absolute right-0 mt-2 w-48 md:w-56 bg-telegram-bg-secondary border border-telegram-border rounded-xl shadow-2xl z-20 py-1 md:py-2 animate-fade-in origin-top-right">
                                                {activeChat.type === 'private' && activeChat.other_user && (
                                                    <>
                                                        <button
                                                            onClick={() => { setIsViewProfileOpen(true); setIsMenuOpen(false); }}
                                                            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-black hover:bg-opacity-5 text-telegram-text transition-colors"
                                                        >
                                                            <svg className="w-5 h-5 text-telegram-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                            </svg>
                                                            <span className="font-medium text-sm">View Profile</span>
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                if (isBlocked) {
                                                                    unblockUser(activeChat.other_user!.id);
                                                                } else {
                                                                    setIsBlockConfirmOpen(true);
                                                                }
                                                                setIsMenuOpen(false);
                                                            }}
                                                            className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-black hover:bg-opacity-5 transition-colors ${isBlocked ? 'text-telegram-blue' : 'text-red-500'}`}
                                                        >
                                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                {isBlocked ? (
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                                ) : (
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                                                                )}
                                                            </svg>
                                                            <span className="font-medium text-sm">{isBlocked ? 'Unblock User' : 'Block User'}</span>
                                                        </button>
                                                    </>
                                                )}
                                                <button
                                                    onClick={() => { setIsDeleteConfirmOpen(true); setIsMenuOpen(false); }}
                                                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-black hover:bg-opacity-5 text-red-500 transition-colors"
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                    <span className="font-medium text-sm">Delete Chat</span>
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Chat Context (Messages + Input) */}
                        <div className="flex-1 flex flex-col min-h-0">
                            <MessageArea />
                            {activeChat.type === 'private' && (isBlocked || amBlocked) ? (
                                <div className="p-4 bg-telegram-bg-secondary border-t border-telegram-border text-center">
                                    <p className="text-xs md:text-sm text-telegram-text-secondary">
                                        {isBlocked ? (
                                            <>Blocked. <button onClick={() => unblockUser(activeChat.other_user!.id)} className="text-telegram-blue hover:underline">Unblock</button></>
                                        ) : 'User unavailable'}
                                    </p>
                                </div>
                            ) : <MessageInput />}
                        </div>
                    </>
                ) : (
                    <div className="hidden md:flex flex-1 flex-col items-center justify-center text-center p-8">
                        <div className="w-24 h-24 bg-telegram-bg-tertiary rounded-full flex items-center justify-center mb-4">
                            <svg className="w-12 h-12 text-telegram-text-secondary opacity-20" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
                            </svg>
                        </div>
                        <div className="bg-black bg-opacity-10 px-4 py-2 rounded-full">
                            <p className="text-telegram-text-secondary text-sm">Select a chat to start messaging</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Profile Settings Modal */}
            <ProfileSettings
                isOpen={isProfileOpen}
                onClose={() => setIsProfileOpen(false)}
            />

            {/* Block Confirmation Modal */}
            {activeChat?.other_user && (
                <ConfirmationModal
                    isOpen={isBlockConfirmOpen}
                    onClose={() => setIsBlockConfirmOpen(false)}
                    onConfirm={() => {
                        blockUser(activeChat.other_user!.id);
                        setIsBlockConfirmOpen(false); // Close modal after confirming
                    }}
                    title="Block User"
                    message={`Are you sure you want to block ${getChatName()}? This will prevent them from messaging you.`}
                    confirmText="Block"
                    cancelText="Keep"
                    type="danger"
                />
            )}

            {/* View Other User Profile Modal */}
            {activeChat?.other_user && (
                <UserProfileModal
                    isOpen={isViewProfileOpen}
                    onClose={() => setIsViewProfileOpen(false)}
                    user={activeChat.other_user}
                />
            )}

            {/* Delete Chat Confirmation Modal */}
            {activeChat && (
                <ConfirmationModal
                    isOpen={isDeleteConfirmOpen}
                    onClose={() => setIsDeleteConfirmOpen(false)}
                    onConfirm={() => deleteChat(activeChat.id)}
                    title="Delete Chat"
                    message={`Are you sure you want to delete the chat with ${getChatName()}? All messages will be permanently removed for everyone.`}
                    confirmText="Delete"
                    cancelText="Cancel"
                    type="danger"
                />
            )}
        </div>
    );
};

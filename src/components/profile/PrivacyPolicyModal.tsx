import React from 'react';

interface PrivacyPolicyModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const PrivacyPolicyModal: React.FC<PrivacyPolicyModalProps> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black bg-opacity-70 backdrop-blur-md animate-fade-in">
            <div className="bg-telegram-bg-secondary w-full max-w-2xl h-[80vh] rounded-3xl shadow-2xl overflow-hidden border border-telegram-border animate-scale-in flex flex-col">
                {/* Header */}
                <div className="p-6 border-b border-telegram-border flex items-center justify-between bg-telegram-bg">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-telegram-blue bg-opacity-10 rounded-2xl flex items-center justify-center text-telegram-blue">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-telegram-text">Privacy Policy</h2>
                            <p className="text-xs text-telegram-text-secondary">Last updated: January 15, 2026</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-black hover:bg-opacity-5 rounded-xl transition-all text-telegram-text-secondary"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar space-y-8 text-telegram-text">
                    <section className="space-y-3">
                        <h3 className="text-lg font-bold text-telegram-blue">1. Data Collection</h3>
                        <p className="text-telegram-text-secondary leading-relaxed">
                            We collect minimal data to provide our messaging service. This includes your username, display name, and profile picture. If provided, we also store your phone number for account identification.
                        </p>
                    </section>

                    <section className="space-y-3">
                        <h3 className="text-lg font-bold text-telegram-blue">2. Message Privacy</h3>
                        <p className="text-telegram-text-secondary leading-relaxed">
                            Your messages are stored securely in our database. We do not use your message content for advertising or any other purposes outside of delivering them to your intended recipients.
                        </p>
                    </section>

                    <section className="space-y-3">
                        <h3 className="text-lg font-bold text-telegram-blue">3. User Controls</h3>
                        <p className="text-telegram-text-secondary leading-relaxed">
                            You have full control over your profile data. You can update your full name, bio, and profile picture at any time. Per our platform security policy, usernames are set once to ensure persistent identity within the network.
                        </p>
                    </section>

                    <section className="space-y-3">
                        <h3 className="text-lg font-bold text-telegram-blue">4. Security</h3>
                        <p className="text-telegram-text-secondary leading-relaxed">
                            We utilize industry-standard encryption and Row Level Security (RLS) via Supabase to ensure that only you and the participants of a chat can access the messages within that chat.
                        </p>
                    </section>

                    <section className="space-y-3">
                        <h3 className="text-lg font-bold text-telegram-blue">5. Contact</h3>
                        <p className="text-telegram-text-secondary leading-relaxed">
                            If you have questions about this policy or your data, please contact the Tchat support team through our official channels.
                        </p>
                    </section>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-telegram-border bg-telegram-bg flex justify-end">
                    <button
                        onClick={onClose}
                        className="bg-telegram-blue text-white px-8 py-2.5 rounded-xl font-bold hover:bg-opacity-90 transition-all shadow-lg shadow-telegram-blue/20"
                    >
                        I Understand
                    </button>
                </div>
            </div>
        </div>
    );
};

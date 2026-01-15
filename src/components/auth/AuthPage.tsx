import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

export const AuthPage: React.FC = () => {
    const [isSignUp, setIsSignUp] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const [fullName, setFullName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const { signIn, signUp } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        console.log('[AuthPage] Handle submit called', { isSignUp, email });
        setError('');
        setLoading(true);

        try {
            if (isSignUp) {
                if (!username.trim()) {
                    throw new Error('Username is required');
                }
                console.log('[AuthPage] Attempting signUp...');
                await signUp(email, password, username, fullName);
                setError('Check your email for verification link!');
                console.log('[AuthPage] signUp call resolved');
            } else {
                console.log('[AuthPage] Attempting signIn...');
                await signIn(email, password);
                console.log('[AuthPage] signIn call resolved');
            }
        } catch (err: any) {
            console.error('[AuthPage] Auth error caught:', err);
            let message = err.message || 'An error occurred';
            if (message.includes('Database error saving new user')) {
                message = 'Database error: The Supabase trigger failed. Please make sure you have run the full SQL schema in the Supabase SQL Editor as described in SUPABASE_SETUP_GUIDE.md';
            }
            setError(message);
        } finally {
            console.log('[AuthPage] Setting loading to false');
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-telegram-bg via-telegram-bg-secondary to-telegram-bg p-4">
            <div className="w-full max-w-md">
                {/* Logo/Header */}
                <div className="text-center mb-8 animate-fade-in">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-telegram-blue rounded-full mb-4">
                        <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                        </svg>
                    </div>
                    <h1 className="text-3xl font-bold text-telegram-text mb-2">
                        T Chat
                    </h1>
                    <p className="text-telegram-text-secondary">
                        Fast. Secure. Powerful.
                    </p>
                </div>

                {/* Auth Form */}
                <div className="card glass p-6 md:p-8 animate-slide-up shadow-2xl relative overflow-hidden group">
                    <div className="absolute inset-0 bg-telegram-blue opacity-[0.02] group-hover:opacity-[0.05] transition-opacity pointer-events-none"></div>
                    <div className="flex mb-6 bg-telegram-bg-tertiary rounded-xl p-1 relative z-10">
                        <button
                            type="button"
                            onClick={() => setIsSignUp(false)}
                            className={`flex-1 py-2.5 rounded-lg font-semibold transition-all duration-300 ${!isSignUp
                                ? 'bg-telegram-blue text-white shadow-lg scale-[1.02]'
                                : 'text-telegram-text-secondary hover:text-telegram-text'
                                }`}
                        >
                            Sign In
                        </button>
                        <button
                            type="button"
                            onClick={() => setIsSignUp(true)}
                            className={`flex-1 py-2.5 rounded-lg font-semibold transition-all duration-300 ${isSignUp
                                ? 'bg-telegram-blue text-white shadow-lg scale-[1.02]'
                                : 'text-telegram-text-secondary hover:text-telegram-text'
                                }`}
                        >
                            Sign Up
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
                        {isSignUp && (
                            <>
                                <div>
                                    <label htmlFor="username" className="block text-sm font-medium text-telegram-text mb-2">
                                        Username *
                                    </label>
                                    <input
                                        id="username"
                                        type="text"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        className="input"
                                        placeholder="johndoe"
                                        required={isSignUp}
                                    />
                                </div>

                                <div>
                                    <label htmlFor="fullName" className="block text-sm font-medium text-telegram-text mb-2">
                                        Full Name
                                    </label>
                                    <input
                                        id="fullName"
                                        type="text"
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        className="input"
                                        placeholder="John Doe"
                                    />
                                </div>
                            </>
                        )}

                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-telegram-text mb-2">
                                Email
                            </label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="input"
                                placeholder="you@example.com"
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-telegram-text mb-2">
                                Password
                            </label>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="input"
                                placeholder="••••••••"
                                required
                            />
                        </div>

                        {error && (
                            <div className={`p-3 rounded-lg text-sm ${error.includes('Check your email')
                                ? 'bg-telegram-online bg-opacity-20 text-telegram-online'
                                : 'bg-red-500 bg-opacity-20 text-red-400'
                                }`}>
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn btn-primary w-full py-3 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <div className="flex items-center justify-center">
                                    <div className="spinner w-5 h-5 mr-2"></div>
                                    Loading...
                                </div>
                            ) : isSignUp ? (
                                'Create Account'
                            ) : (
                                'Sign In'
                            )}
                        </button>
                    </form>

                    <div className="mt-6 text-center text-sm text-telegram-text-secondary relative z-10">
                        {isSignUp ? (
                            <p>
                                Already have an account?{' '}
                                <button
                                    type="button"
                                    onClick={() => setIsSignUp(false)}
                                    className="text-telegram-blue hover:underline font-medium"
                                >
                                    Sign in
                                </button>
                            </p>
                        ) : (
                            <p>
                                Don't have an account?{' '}
                                <button
                                    type="button"
                                    onClick={() => setIsSignUp(true)}
                                    className="text-telegram-blue hover:underline font-medium"
                                >
                                    Sign up
                                </button>
                            </p>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="text-center mt-8 text-sm text-telegram-text-secondary">
                    <p>
                        By signing up, you agree to our{' '}
                        <a
                            href="/terms"
                            className="text-telegram-blue hover:underline"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            Terms of Service
                        </a>
                        {' '}and{' '}
                        <a
                            href="/privacy"
                            className="text-telegram-blue hover:underline"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            Privacy Policy
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
};

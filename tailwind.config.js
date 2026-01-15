/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                telegram: {
                    blue: 'var(--tg-blue)',
                    'blue-dark': 'var(--tg-blue-dark)',
                    'blue-light': 'var(--tg-blue-light)',
                    bg: 'var(--tg-bg)',
                    'bg-secondary': 'var(--tg-bg-secondary)',
                    'bg-tertiary': 'var(--tg-bg-tertiary)',
                    text: 'var(--tg-text)',
                    'text-secondary': 'var(--tg-text-secondary)',
                    border: 'var(--tg-border)',
                    online: 'var(--tg-online)',
                    unread: 'var(--tg-unread)',
                }
            },
            animation: {
                'fade-in': 'fadeIn 0.2s ease-in',
                'slide-up': 'slideUp 0.3s ease-out',
                'slide-in': 'slideIn 0.2s ease-out',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideUp: {
                    '0%': { transform: 'translateY(10px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
                slideIn: {
                    '0%': { transform: 'translateX(-10px)', opacity: '0' },
                    '100%': { transform: 'translateX(0)', opacity: '1' },
                },
            },
        },
    },
    plugins: [],
}

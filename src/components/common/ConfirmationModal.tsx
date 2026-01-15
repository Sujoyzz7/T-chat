import React from 'react';

interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    type?: 'danger' | 'info';
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    type = 'info'
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm animate-fade-in">
            <div className="bg-telegram-bg-secondary w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden border border-telegram-border animate-scale-in">
                <div className="p-6">
                    <h3 className={`text-xl font-bold mb-2 ${type === 'danger' ? 'text-red-500' : 'text-telegram-text'}`}>
                        {title}
                    </h3>
                    <p className="text-telegram-text-secondary mb-8 leading-relaxed">
                        {message}
                    </p>

                    <div className="flex flex-col gap-2">
                        <button
                            onClick={() => {
                                onConfirm();
                                onClose();
                            }}
                            className={`w-full py-3 rounded-xl font-bold transition-all active:scale-[0.98] ${type === 'danger'
                                    ? 'bg-red-500 text-white hover:bg-red-600'
                                    : 'bg-telegram-blue text-white hover:bg-opacity-90'
                                }`}
                        >
                            {confirmText}
                        </button>
                        <button
                            onClick={onClose}
                            className="w-full py-3 rounded-xl font-medium text-telegram-text-secondary hover:bg-black hover:bg-opacity-5 transition-all"
                        >
                            {cancelText}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

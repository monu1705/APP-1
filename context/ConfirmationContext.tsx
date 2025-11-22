import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { CloseIcon } from '../components/icons';

interface ConfirmationContextType {
    confirm: (message: string, title?: string) => Promise<boolean>;
}

const ConfirmationContext = createContext<ConfirmationContextType | undefined>(undefined);

export const ConfirmationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState('');
    const [title, setTitle] = useState('');
    const [resolveCallback, setResolveCallback] = useState<(value: boolean) => void>(() => { });

    const confirm = useCallback((msg: string, t: string = 'Confirm Action') => {
        setMessage(msg);
        setTitle(t);
        setIsOpen(true);
        return new Promise<boolean>((resolve) => {
            setResolveCallback(() => resolve);
        });
    }, []);

    const handleConfirm = () => {
        setIsOpen(false);
        resolveCallback(true);
    };

    const handleCancel = () => {
        setIsOpen(false);
        resolveCallback(false);
    };

    return (
        <ConfirmationContext.Provider value={{ confirm }}>
            {children}
            {isOpen && (
                <div className="fixed inset-0 bg-black/50 z-[60] modal-backdrop animate-fade-in flex items-center justify-center p-4" onClick={handleCancel}>
                    <div className="bg-light-card dark:bg-dark-card rounded-xl w-full max-w-sm shadow-2xl animate-scale-in relative glass textured-card p-6" onClick={e => e.stopPropagation()}>
                        <h3 className="text-lg font-bold text-light-text-primary dark:text-dark-text-primary mb-2">{title}</h3>
                        <p className="text-light-text-secondary dark:text-dark-text-secondary mb-6">{message}</p>
                        <div className="flex justify-end space-x-3">
                            <button onClick={handleCancel} className="px-4 py-2 rounded-lg text-light-text-secondary dark:text-dark-text-secondary hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors font-medium">
                                Cancel
                            </button>
                            <button onClick={handleConfirm} className="px-4 py-2 rounded-lg bg-danger text-white hover:bg-red-600 transition-colors font-medium shadow-md">
                                Confirm
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </ConfirmationContext.Provider>
    );
};

export const useConfirm = () => {
    const context = useContext(ConfirmationContext);
    if (context === undefined) {
        throw new Error('useConfirm must be used within a ConfirmationProvider');
    }
    return context;
};

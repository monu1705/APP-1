import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Transaction, Bank } from '../types';
import { localStorageService } from '../services/localStorage';
import { googleDriveService } from '../services/googleDrive';

interface AppContextType {
    theme: 'light' | 'dark';
    toggleTheme: () => void;
    transactions: Transaction[];
    banks: Bank[];
    isLoading: boolean;
    error: string | null;
    setError: (error: string | null) => void;
    isGoogleDriveConnected: boolean;
    isSyncing: boolean;
    lastSync: number | null;

    // Data Actions
    addTransaction: (transaction: Omit<Transaction, 'id'>) => Promise<void>;
    addTransactions: (transactions: Omit<Transaction, 'id'>[]) => Promise<void>;
    updateTransaction: (transaction: Transaction) => Promise<void>;
    deleteTransaction: (id: string) => Promise<void>;
    addBank: (name: string) => Promise<void>;
    deleteBank: (id: string) => Promise<void>;

    // Google Drive Actions
    connectGoogleDrive: () => Promise<void>;
    disconnectGoogleDrive: () => Promise<void>;
    syncToDrive: () => Promise<void>;
    syncFromDrive: () => Promise<void>;

    // Calendar State (Global for now to avoid prop drilling, though could be local)
    calendarConfig: {
        isOpen: boolean;
        mode: 'date' | 'month';
        onSelect: (date: string) => void;
        currentValue?: string;
    };
    openCalendar: (mode: 'date' | 'month', onSelect: (date: string) => void, currentValue?: string) => void;
    closeCalendar: () => void;

    // Date State
    currentDate: Date;
    changeMonth: (offset: number) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    // --- State ---
    const [theme, setTheme] = useState<'light' | 'dark'>(() => {
        const savedTheme = localStorage.getItem('m-track-theme');
        return (savedTheme === 'light' || savedTheme === 'dark') ? savedTheme : 'dark';
    });

    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [banks, setBanks] = useState<Bank[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isGoogleDriveConnected, setIsGoogleDriveConnected] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);

    const [calendarConfig, setCalendarConfig] = useState<{
        isOpen: boolean;
        mode: 'date' | 'month';
        onSelect: (date: string) => void;
        currentValue?: string;
    }>({ isOpen: false, mode: 'date', onSelect: () => { } });

    const [lastSync, setLastSync] = useState<number | null>(null);

    // --- Helpers ---
    const generateId = (): string => {
        // Use crypto.randomUUID if available, else fallback
        if (typeof crypto !== 'undefined' && crypto.randomUUID) {
            return crypto.randomUUID();
        }
        return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    };

    // --- Effects ---

    // Load initial data
    const loadData = useCallback(() => {
        try {
            const transactionsData = localStorageService.getTransactions();
            const banksData = localStorageService.getBanks();
            const lastSyncData = localStorageService.getLastSync();
            setTransactions(transactionsData);
            setBanks(banksData);
            setLastSync(lastSyncData);
        } catch (err: any) {
            setError(err.message || 'Failed to load data from local storage');
        }
    }, []);

    // Check Google Drive status
    const checkGoogleDriveStatus = useCallback(async () => {
        try {
            await googleDriveService.init();
            const isConnected = googleDriveService.isSignedIn();
            setIsGoogleDriveConnected(isConnected);
        } catch (error: any) {
            console.warn('Google Drive not available:', error?.message || 'Unknown error');
            setIsGoogleDriveConnected(false);
        }
    }, []);

    useEffect(() => {
        loadData();
        checkGoogleDriveStatus();
    }, [loadData, checkGoogleDriveStatus]);

    // Auto-sync effect
    useEffect(() => {
        if (isGoogleDriveConnected && transactions.length > 0) {
            const timeoutId = setTimeout(() => {
                syncToDrive();
            }, 5000); // Debounce sync for 5 seconds

            return () => clearTimeout(timeoutId);
        }
    }, [transactions, banks, isGoogleDriveConnected]); // Trigger on data changes

    // Theme effect
    useEffect(() => {
        localStorage.setItem('m-track-theme', theme);
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [theme]);

    // --- Actions ---

    const toggleTheme = () => {
        setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
    };

    const saveTransactions = useCallback((newTransactions: Transaction[]) => {
        try {
            localStorageService.saveTransactions(newTransactions);
            setTransactions(newTransactions);
        } catch (err: any) {
            setError(err.message || 'Failed to save transactions');
            throw err;
        }
    }, []);

    const saveBanks = useCallback((newBanks: Bank[]) => {
        try {
            localStorageService.saveBanks(newBanks);
            setBanks(newBanks);
        } catch (err: any) {
            setError(err.message || 'Failed to save banks');
            throw err;
        }
    }, []);

    const addTransaction = async (transaction: Omit<Transaction, 'id'>) => {
        try {
            const newTransaction: Transaction = {
                ...transaction,
                id: generateId(),
            };
            const updatedTransactions = [...transactions, newTransaction];
            saveTransactions(updatedTransactions);
        } catch (err: any) {
            setError(err.message || 'Failed to add transaction.');
        }
    };

    const addTransactions = async (newTransactionsData: Omit<Transaction, 'id'>[]) => {
        try {
            const newTransactions: Transaction[] = newTransactionsData.map(t => ({
                ...t,
                id: generateId(),
            }));
            const updatedTransactions = [...transactions, ...newTransactions];
            saveTransactions(updatedTransactions);
        } catch (err: any) {
            setError(err.message || 'Failed to add transactions.');
        }
    };

    const updateTransaction = async (updatedTransaction: Transaction) => {
        try {
            const updatedTransactions = transactions.map(t =>
                t.id === updatedTransaction.id ? updatedTransaction : t
            );
            saveTransactions(updatedTransactions);
        } catch (err: any) {
            setError(err.message || 'Failed to update transaction.');
        }
    };

    const deleteTransaction = async (id: string) => {
        try {
            const updatedTransactions = transactions.filter(t => t.id !== id);
            saveTransactions(updatedTransactions);
        } catch (err: any) {
            setError(err.message || 'Failed to delete transaction.');
        }
    };

    const addBank = async (name: string) => {
        try {
            const newBank: Bank = {
                id: generateId(),
                name: name.trim(),
            };
            const updatedBanks = [...banks, newBank];
            saveBanks(updatedBanks);
        } catch (err: any) {
            setError(err.message || 'Failed to add bank.');
        }
    };

    const deleteBank = async (id: string) => {
        try {
            const updatedBanks = banks.filter(b => b.id !== id);
            saveBanks(updatedBanks);
        } catch (err: any) {
            setError(err.message || 'Failed to delete bank.');
        }
    };

    // --- Google Drive Actions ---

    const connectGoogleDrive = async () => {
        try {
            setIsSyncing(true);
            setError(null);
            await googleDriveService.init();
            await googleDriveService.signIn();
            setIsGoogleDriveConnected(true);

            // Auto-upload after connect
            const data = localStorageService.exportData();
            await googleDriveService.syncToDrive(data);
            const now = Date.now();
            localStorageService.setLastSync(now);
            setLastSync(now);
        } catch (err: any) {
            console.error('Failed to connect Google Drive:', err);
            setError(err.message || 'Failed to connect to Google Drive');
            setIsGoogleDriveConnected(false);
        } finally {
            setIsSyncing(false);
        }
    };

    const disconnectGoogleDrive = async () => {
        try {
            await googleDriveService.signOut();
            setIsGoogleDriveConnected(false);
        } catch (err: any) {
            setError(err.message || 'Failed to disconnect from Google Drive');
        }
    };

    const syncToDrive = async () => {
        try {
            setIsSyncing(true);
            setError(null);
            if (!googleDriveService.isSignedIn()) {
                await googleDriveService.signIn();
                setIsGoogleDriveConnected(true);
            }
            const data = localStorageService.exportData();
            await googleDriveService.syncToDrive(data);
            const now = Date.now();
            localStorageService.setLastSync(now);
            setLastSync(now);
        } catch (err: any) {
            setError(err.message || 'Failed to sync to Google Drive');
        } finally {
            setIsSyncing(false);
        }
    };

    const syncFromDrive = async () => {
        try {
            setIsSyncing(true);
            setError(null);
            if (!googleDriveService.isSignedIn()) {
                await googleDriveService.signIn();
                setIsGoogleDriveConnected(true);
            }
            const data = await googleDriveService.syncFromDrive();
            localStorageService.importData(data);
            loadData(); // Reload from local storage
            const now = Date.now();
            localStorageService.setLastSync(now);
            setLastSync(now);
        } catch (err: any) {
            setError(err.message || 'Failed to sync from Google Drive');
        } finally {
            setIsSyncing(false);
        }
    };

    // --- Calendar Actions ---
    const openCalendar = (mode: 'date' | 'month', onSelect: (date: string) => void, currentValue?: string) => {
        setCalendarConfig({ isOpen: true, mode, onSelect, currentValue });
    };

    const closeCalendar = () => {
        setCalendarConfig(prev => ({ ...prev, isOpen: false }));
    };

    // --- Date State ---
    const [currentDate, setCurrentDate] = useState(new Date());

    const changeMonth = (offset: number) => {
        setCurrentDate(prevDate => {
            const newDate = new Date(prevDate);
            newDate.setDate(1);
            newDate.setMonth(newDate.getMonth() + offset);
            return newDate;
        });
    };

    return (
        <AppContext.Provider value={{
            theme,
            toggleTheme,
            transactions,
            banks,
            isLoading,
            error,
            setError,
            isGoogleDriveConnected,
            isSyncing,
            lastSync,
            addTransaction,
            addTransactions,
            updateTransaction,
            deleteTransaction,
            addBank,
            deleteBank,
            connectGoogleDrive,
            disconnectGoogleDrive,
            syncToDrive,
            syncFromDrive,
            calendarConfig,
            openCalendar,
            closeCalendar,
            currentDate,
            changeMonth
        }}>
            {children}
        </AppContext.Provider>
    );
};

export const useAppContext = () => {
    const context = useContext(AppContext);
    if (context === undefined) {
        throw new Error('useAppContext must be used within an AppProvider');
    }
    return context;
};

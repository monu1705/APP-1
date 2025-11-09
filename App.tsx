
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Transaction, TransactionType, PaymentMode, Bank } from './types';
import Dashboard from './components/Dashboard';
import TransactionList, { TransactionItem } from './components/TransactionList';
import { ChevronLeftIcon, ChevronRightIcon, SunIcon, MoonIcon, SettingsIcon, PlusIcon, CloseIcon, TrashIcon, BankIcon, ChartPieIcon, SearchIcon, DownloadIcon, GoogleDriveIcon, CloudIcon } from './components/icons';
import Calendar from './components/Calendar';
import { localStorageService } from './services/localStorage';
import { googleDriveService } from './services/googleDrive';

const App: React.FC = () => {
    const [theme, setTheme] = useState<'light' | 'dark'>(() => {
        const savedTheme = localStorage.getItem('m-track-theme');
        return (savedTheme === 'light' || savedTheme === 'dark') ? savedTheme : 'dark';
    });

    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [banks, setBanks] = useState<Bank[]>([]);
    const [currentDate, setCurrentDate] = useState(new Date());

    const [activeView, setActiveView] = useState<'dashboard' | 'history'>('dashboard');
    const [activeModal, setActiveModal] = useState<string | null>(null);
    const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
    const [searchResults, setSearchResults] = useState<Transaction[]>([]);
    const [searchTermForHighlight, setSearchTermForHighlight] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isGoogleDriveConnected, setIsGoogleDriveConnected] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);

    const [calendarConfig, setCalendarConfig] = useState<{
      isOpen: boolean;
      mode: 'date' | 'month';
      onSelect: (date: string) => void;
      currentValue?: string;
    }>({ isOpen: false, mode: 'date', onSelect: () => {} });

    const openCalendar = (mode: 'date' | 'month', onSelect: (date: string) => void, currentValue?: string) => {
        setCalendarConfig({ isOpen: true, mode, onSelect, currentValue });
    };

    // Load data from local storage
    const loadData = useCallback(() => {
        try {
            const transactionsData = localStorageService.getTransactions();
            const banksData = localStorageService.getBanks();
            setTransactions(transactionsData);
            setBanks(banksData);
        } catch (err: any) {
            setError(err.message || 'Failed to load data from local storage');
        }
    }, []);

    // Save transactions to local storage
    const saveTransactions = useCallback((newTransactions: Transaction[]) => {
        try {
            localStorageService.saveTransactions(newTransactions);
            setTransactions(newTransactions);
        } catch (err: any) {
            setError(err.message || 'Failed to save transactions');
            throw err;
        }
    }, []);

    // Save banks to local storage
    const saveBanks = useCallback((newBanks: Bank[]) => {
        try {
            localStorageService.saveBanks(newBanks);
            setBanks(newBanks);
        } catch (err: any) {
            setError(err.message || 'Failed to save banks');
            throw err;
        }
    }, []);

    // Check Google Drive connection status
    const checkGoogleDriveStatus = useCallback(async () => {
        try {
            await googleDriveService.init();
            const isConnected = googleDriveService.isSignedIn();
            setIsGoogleDriveConnected(isConnected);
        } catch (error: any) {
            // Silently handle errors - Google Drive is optional
            console.warn('Google Drive not available:', error?.message || 'Unknown error');
            setIsGoogleDriveConnected(false);
        }
    }, []);

    // Initialize Google Drive and load data
    useEffect(() => {
        loadData();
        checkGoogleDriveStatus();
    }, [loadData, checkGoogleDriveStatus]);


    useEffect(() => {
        localStorage.setItem('m-track-theme', theme);
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [theme]);

    // Google Drive sync functions
    const handleGoogleDriveConnect = async () => {
        try {
            setIsSyncing(true);
            setError(null);
            await googleDriveService.init();
            await googleDriveService.signIn();
            setIsGoogleDriveConnected(true);
            
            // After connecting, upload current data to Drive
            const data = localStorageService.exportData();
            await googleDriveService.syncToDrive(data);
            localStorageService.setLastSync(Date.now());
        } catch (err: any) {
            setError(err.message || 'Failed to connect to Google Drive');
            setIsGoogleDriveConnected(false);
        } finally {
            setIsSyncing(false);
        }
    };

    const handleGoogleDriveDisconnect = async () => {
        try {
            await googleDriveService.signOut();
            setIsGoogleDriveConnected(false);
        } catch (err: any) {
            setError(err.message || 'Failed to disconnect from Google Drive');
        }
    };

    const handleSyncToDrive = async () => {
        try {
            setIsSyncing(true);
            setError(null);
            if (!googleDriveService.isSignedIn()) {
                await googleDriveService.signIn();
                setIsGoogleDriveConnected(true);
            }
            const data = localStorageService.exportData();
            await googleDriveService.syncToDrive(data);
            localStorageService.setLastSync(Date.now());
            setError(null);
        } catch (err: any) {
            setError(err.message || 'Failed to sync to Google Drive');
        } finally {
            setIsSyncing(false);
        }
    };

    const handleSyncFromDrive = async () => {
        try {
            setIsSyncing(true);
            setError(null);
            if (!googleDriveService.isSignedIn()) {
                await googleDriveService.signIn();
                setIsGoogleDriveConnected(true);
            }
            const data = await googleDriveService.syncFromDrive();
            localStorageService.importData(data);
            loadData();
            localStorageService.setLastSync(Date.now());
            setError(null);
        } catch (err: any) {
            setError(err.message || 'Failed to sync from Google Drive');
        } finally {
            setIsSyncing(false);
        }
    };

    const toggleTheme = () => {
        setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
    };

    const handleMonthChange = (offset: number) => {
        setCurrentDate(prevDate => {
            const newDate = new Date(prevDate);
            newDate.setDate(1); 
            newDate.setMonth(newDate.getMonth() + offset);
            return newDate;
        });
        setActiveView('dashboard');
    };

    const monthlyTransactions = useMemo(() => {
        return transactions
            .filter(t => {
                const transactionDate = new Date(t.date);
                return transactionDate.getFullYear() === currentDate.getFullYear() &&
                       transactionDate.getMonth() === currentDate.getMonth();
            })
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [transactions, currentDate]);

    const generateId = (): string => {
        return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    };

    const handleAddTransaction = async (transaction: Omit<Transaction, 'id'>) => {
        try {
            const newTransaction: Transaction = {
                ...transaction,
                id: generateId(),
            };
            const updatedTransactions = [...transactions, newTransaction];
            saveTransactions(updatedTransactions);
        } catch (err: any) {
            setError(err.message || 'Failed to add transaction. Please try again.');
            console.error('Error adding transaction:', err);
        }
    };

    const handleUpdateTransaction = async (updatedTransaction: Transaction) => {
        try {
            const updatedTransactions = transactions.map(t => 
                t.id === updatedTransaction.id ? updatedTransaction : t
            );
            saveTransactions(updatedTransactions);
        } catch (err: any) {
            setError(err.message || 'Failed to update transaction. Please try again.');
            console.error('Error updating transaction:', err);
        }
    };

    const handleDeleteTransaction = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this transaction?')) {
            try {
                const updatedTransactions = transactions.filter(t => t.id !== id);
                saveTransactions(updatedTransactions);
            } catch (err: any) {
                setError(err.message || 'Failed to delete transaction. Please try again.');
                console.error('Error deleting transaction:', err);
            }
        }
    };
    
    const handleAddBank = async (name: string) => {
        try {
            const newBank: Bank = {
                id: generateId(),
                name: name.trim(),
            };
            const updatedBanks = [...banks, newBank];
            saveBanks(updatedBanks);
        } catch (err: any) {
            setError(err.message || 'Failed to add bank. Please try again.');
            console.error('Error adding bank:', err);
        }
    };

    const handleDeleteBank = async (id: string) => {
         if (window.confirm('Are you sure you want to delete this bank? This might affect existing transactions.')) {
            try {
                const updatedBanks = banks.filter(b => b.id !== id);
                saveBanks(updatedBanks);
            } catch (err: any) {
                setError(err.message || 'Failed to delete bank. Please try again.');
                console.error('Error deleting bank:', err);
            }
         }
    };

    const openAddModal = () => {
        setEditingTransaction(null);
        setActiveModal('transaction');
    };

    const openEditModal = (transaction: Transaction) => {
        setEditingTransaction(transaction);
        setActiveModal('transaction');
    };

    const monthYearFormat = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(currentDate);


    return (
        <div className="min-h-screen text-light-text-primary dark:text-dark-text-primary theme-transition font-sans">
            <div className="max-w-4xl mx-auto relative z-10">
                <header className="flex items-center justify-between p-3 sm:p-4 sticky top-0 bg-light-bg/95 dark:bg-dark-bg/95 backdrop-blur-md z-20 border-b border-light-border dark:border-dark-border shadow-sm glass">
                    <button onClick={() => setActiveModal('settings')} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-all duration-200 transform hover:scale-110 active:scale-95" aria-label="Settings">
                        <SettingsIcon className="w-6 h-6"/>
                    </button>
                    <div className="flex items-center">
                        <button onClick={() => handleMonthChange(-1)} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-all duration-200 transform hover:scale-110 active:scale-95" aria-label="Previous month">
                            <ChevronLeftIcon />
                        </button>
                        <h1 className="text-lg font-bold w-36 text-center cursor-pointer hover:text-primary dark:hover:text-primary transition-colors" onClick={() => setActiveView('dashboard')}>{monthYearFormat}</h1>
                        <button onClick={() => handleMonthChange(1)} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-all duration-200 transform hover:scale-110 active:scale-95" aria-label="Next month">
                            <ChevronRightIcon />
                        </button>
                    </div>
                    <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-all duration-200 transform hover:scale-110 active:scale-95" aria-label="Toggle theme">
                        {theme === 'light' ? <MoonIcon className="w-6 h-6"/> : <SunIcon className="w-6 h-6"/>}
                    </button>
                </header>
                
                {error && (
                    <div className="p-3 sm:p-4 m-3 sm:m-4 bg-red-100 dark:bg-red-900/30 text-danger rounded-lg text-center animate-slide-down border border-red-200 dark:border-red-800 shadow-md">
                        <p className="font-medium text-sm sm:text-base">{error}</p>
                        <button onClick={() => setError(null)} className="mt-2 text-xs sm:text-sm underline hover:no-underline">Dismiss</button>
                    </div>
                )}

                <main className="pb-20 sm:pb-24">
                    {activeView === 'dashboard' ? (
                        <>
                            <div className="p-3 sm:p-4 animate-fade-in">
                                <div className="p-4 sm:p-6 rounded-xl bg-gradient-to-br from-primary to-indigo-700 text-white shadow-xl card-hover textured-card pattern-overlay">
                                    <h2 className="text-xl sm:text-2xl font-bold mb-2">Welcome to M-track!</h2>
                                    <p className="opacity-90 text-sm sm:text-base">Here's your financial summary for the month.</p>
                                </div>
                            </div>
                            <Dashboard transactions={monthlyTransactions} />
                            {monthlyTransactions.length > 0 && (
                                <div className="p-3 sm:p-4 animate-fade-in" style={{animationDelay: '0.5s'}}>
                                    <button onClick={() => setActiveView('history')} className="w-full text-center p-2.5 sm:p-3 font-semibold text-primary hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all duration-200 border border-light-border dark:border-dark-border transform hover:scale-[1.01] active:scale-[0.99] card-hover text-sm sm:text-base">
                                        View All Transactions for {monthYearFormat}
                                    </button>
                                </div>
                            )}
                        </>
                    ) : (
                         <TransactionList 
                            transactions={monthlyTransactions} 
                            banks={banks} 
                            onEdit={openEditModal} 
                            onDelete={handleDeleteTransaction} 
                        />
                    )}
                </main>

                <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-30">
                    <button onClick={openAddModal} className="w-14 h-14 sm:w-16 sm:h-16 bg-primary rounded-full text-white shadow-xl flex items-center justify-center hover:bg-primary-focus transition-all duration-300 transform hover:scale-110 active:scale-95 hover:shadow-2xl shadow-glow" aria-label="Add transaction">
                        <PlusIcon className="w-7 h-7 sm:w-8 sm:h-8"/>
                    </button>
                </div>

                {calendarConfig.isOpen && <Calendar {...calendarConfig} onClose={() => setCalendarConfig(prev => ({ ...prev, isOpen: false }))} />}

                {activeModal === 'transaction' && <TransactionModal isOpen={true} onClose={() => setActiveModal(null)} onSave={(t) => { if(editingTransaction) { handleUpdateTransaction({ ...t, id: editingTransaction.id }); } else { handleAddTransaction(t); } }} banks={banks} transaction={editingTransaction} openCalendar={openCalendar} />}
                {activeModal === 'settings' && <SettingsModal isOpen={true} onClose={() => setActiveModal(null)} banks={banks} onAddBank={handleAddBank} onDeleteBank={handleDeleteBank} openSearch={() => setActiveModal('searchAndFilter')} openExport={() => setActiveModal('export')} transactions={transactions} isGoogleDriveConnected={isGoogleDriveConnected} isSyncing={isSyncing} onGoogleDriveConnect={handleGoogleDriveConnect} onGoogleDriveDisconnect={handleGoogleDriveDisconnect} onSyncToDrive={handleSyncToDrive} onSyncFromDrive={handleSyncFromDrive} />}
                {activeModal === 'searchAndFilter' && <SearchAndFilterModal isOpen={true} onClose={() => setActiveModal(null)} transactions={transactions} banks={banks} onSearch={(results, term) => { setSearchResults(results); setSearchTermForHighlight(term); setActiveModal('searchResults'); }} openCalendar={openCalendar}/>}
                {activeModal === 'export' && <ExportDataModal isOpen={true} onClose={() => setActiveModal(null)} transactions={transactions} banks={banks} openCalendar={openCalendar} />}
                {activeModal === 'searchResults' && <SearchResultsModal isOpen={true} onClose={() => setActiveModal(null)} results={searchResults} banks={banks} onEdit={openEditModal} onDelete={handleDeleteTransaction} searchTerm={searchTermForHighlight} />}
            </div>
        </div>
    );
};




// MODAL COMPONENTS
interface TransactionModalProps { isOpen: boolean; onClose: () => void; onSave: (transaction: Omit<Transaction, 'id'>) => void; banks: Bank[]; transaction: Transaction | null; openCalendar: (mode: 'date' | 'month', onSelect: (date: string) => void, currentValue?: string) => void; }
const TransactionModal: React.FC<TransactionModalProps> = ({ isOpen, onClose, onSave, banks, transaction, openCalendar }) => {
    const [type, setType] = useState<TransactionType>(TransactionType.EXPENSE);
    const [amount, setAmount] = useState<string>('');
    const [label, setLabel] = useState<string>('');
    const [mode, setMode] = useState<PaymentMode>(PaymentMode.UPI);
    const [bankId, setBankId] = useState<string>(banks.length > 0 ? banks[0].id : '');
    const [date, setDate] = useState<string>(new Date().toISOString().substring(0, 10));

    // Reset form when modal opens/closes or transaction changes
    useEffect(() => {
        if (isOpen) {
            if (transaction) {
                setType(transaction.type);
                setAmount(transaction.amount.toString());
                setLabel(transaction.label);
                setMode(transaction.mode);
                setBankId(transaction.bankId || (banks.length > 0 ? banks[0].id : ''));
                setDate(new Date(transaction.date).toISOString().substring(0, 10));
            } else {
                // Reset to defaults for new transaction
                setType(TransactionType.EXPENSE);
                setAmount('');
                setLabel('');
                setMode(PaymentMode.UPI);
                setBankId(banks.length > 0 ? banks[0].id : '');
                setDate(new Date().toISOString().substring(0, 10));
            }
        }
    }, [isOpen, transaction, banks]);

    // Update bankId when banks change
    useEffect(() => {
        if (banks.length > 0 && !bankId) {
            setBankId(banks[0].id);
        }
    }, [banks, bankId]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const numericAmount = parseFloat(amount);
        if (isNaN(numericAmount) || numericAmount <= 0 || !label.trim()) { 
            alert("Please fill all fields with valid data."); 
            return; 
        }
        onSave({ type, amount: numericAmount, label: label.trim(), mode, bankId: mode === PaymentMode.BANK_TRANSFER ? bankId : undefined, date: new Date(date).toISOString(), });
        onClose();
    };

    const handleClose = () => {
        onClose();
    };
    
    if(!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black/50 z-40 modal-backdrop animate-fade-in flex items-center justify-center p-3 sm:p-4" onClick={handleClose}>
            <div className="bg-light-card dark:bg-dark-card rounded-2xl w-full max-w-md shadow-2xl animate-scale-in relative glass textured-card max-h-[90vh] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                    <h2 className="text-lg font-bold text-light-text-primary dark:text-dark-text-primary">{transaction ? 'Edit Transaction' : 'Add Transaction'}</h2>
                    <button onClick={handleClose} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors" aria-label="Close modal">
                        <CloseIcon className="w-5 h-5"/>
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-3 sm:space-y-4 overflow-y-auto flex-1">
                    <div className="grid grid-cols-2 gap-2 p-1 bg-slate-200 dark:bg-slate-800 rounded-lg">
                        <button type="button" onClick={() => setType(TransactionType.EXPENSE)} className={`px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold rounded-md transition-all duration-200 ${type === TransactionType.EXPENSE ? 'bg-light-card dark:bg-dark-card text-danger shadow-md' : 'text-light-text-secondary dark:text-dark-text-secondary hover:bg-slate-300 dark:hover:bg-slate-700'}`}>
                            Expense
                        </button>
                        <button type="button" onClick={() => setType(TransactionType.INCOME)} className={`px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold rounded-md transition-all duration-200 ${type === TransactionType.INCOME ? 'bg-light-card dark:bg-dark-card text-secondary shadow-md' : 'text-light-text-secondary dark:text-dark-text-secondary hover:bg-slate-300 dark:hover:bg-slate-700'}`}>
                            Income
                        </button>
                    </div>
                    <div>
                        <label className="text-xs sm:text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">Amount</label>
                        <input type="number" step="0.01" min="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" required className="mt-1 w-full p-2.5 text-sm sm:text-base bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-md focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all" />
                    </div>
                    <div>
                        <label className="text-xs sm:text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">Label</label>
                        <input type="text" value={label} onChange={(e) => setLabel(e.target.value)} placeholder="e.g., Coffee, Salary" required className="mt-1 w-full p-2.5 text-sm sm:text-base bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-md focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all" />
                    </div>
                    <div>
                        <label className="text-xs sm:text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">Payment Mode</label>
                        <select value={mode} onChange={(e) => setMode(e.target.value as PaymentMode)} className="mt-1 w-full p-2.5 text-sm sm:text-base bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-md focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all cursor-pointer">
                            {Object.values(PaymentMode).map(pm => <option key={pm} value={pm}>{pm}</option>)}
                        </select>
                    </div>
                    {mode === PaymentMode.BANK_TRANSFER && (
                        <div className="animate-slide-down">
                            <label className="text-xs sm:text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">Bank</label>
                            <select value={bankId} onChange={(e) => setBankId(e.target.value)} className="mt-1 w-full p-2.5 text-sm sm:text-base bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-md focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all cursor-pointer">
                                {banks.length > 0 ? banks.map(b => <option key={b.id} value={b.id}>{b.name}</option>) : <option disabled>No banks available</option>}
                            </select>
                        </div>
                    )}
                    <div>
                        <label className="text-xs sm:text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">Date</label>
                        <input type="text" readOnly onClick={() => openCalendar('date', setDate, date)} value={date} required className="mt-1 w-full p-2.5 text-sm sm:text-base bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-md focus:ring-2 focus:ring-primary focus:border-primary outline-none cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-all" />
                    </div>
                    <button type="submit" className="w-full bg-primary text-white font-bold py-2.5 sm:py-3 rounded-lg hover:bg-primary-focus transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl text-sm sm:text-base">
                        {transaction ? 'Update Transaction' : 'Save Transaction'}
                    </button>
                </form>
            </div>
        </div>
    );
};


interface SettingsModalProps { 
    isOpen: boolean; 
    onClose: () => void; 
    openSearch: () => void; 
    openExport: () => void; 
    banks: Bank[]; 
    onAddBank: (name: string) => void; 
    onDeleteBank: (id: string) => void; 
    transactions: Transaction[]; 
    isGoogleDriveConnected: boolean;
    isSyncing: boolean;
    onGoogleDriveConnect: () => Promise<void>;
    onGoogleDriveDisconnect: () => Promise<void>;
    onSyncToDrive: () => Promise<void>;
    onSyncFromDrive: () => Promise<void>;
}
const SettingsModal: React.FC<SettingsModalProps> = ({ 
    isOpen, 
    onClose, 
    openSearch, 
    openExport, 
    banks, 
    onAddBank, 
    onDeleteBank, 
    transactions, 
    isGoogleDriveConnected,
    isSyncing,
    onGoogleDriveConnect,
    onGoogleDriveDisconnect,
    onSyncToDrive,
    onSyncFromDrive,
}) => {
    const [view, setView] = useState<'main' | 'banks' | 'reports' | 'data' | 'sync'>('main');
    
    useEffect(() => {
        if (!isOpen) {
            // Reset view when modal closes
            setTimeout(() => setView('main'), 300);
        }
    }, [isOpen]);
    
    const handleActionClick = (action: () => void) => { onClose(); setTimeout(action, 200); };
    
    const renderContent = () => {
        switch(view) {
            case 'banks': return <ManageBanksView banks={banks} onAddBank={onAddBank} onDeleteBank={onDeleteBank} />;
            case 'reports': return <ReportsView allTransactions={transactions} />;
            case 'data': return <DataManagementView onExportClick={() => handleActionClick(openExport)} />;
            case 'sync': return <GoogleDriveSyncView 
                isConnected={isGoogleDriveConnected}
                isSyncing={isSyncing}
                onConnect={onGoogleDriveConnect}
                onDisconnect={onGoogleDriveDisconnect}
                onSyncToDrive={onSyncToDrive}
                onSyncFromDrive={onSyncFromDrive}
            />;
            default: return (
                <div className="p-3 sm:p-4 space-y-2 animate-fade-in">
                    <SettingsButton icon={<BankIcon />} label="Manage Banks" onClick={() => setView('banks')} />
                    <SettingsButton icon={<ChartPieIcon />} label="Monthly Reports" onClick={() => setView('reports')} />
                    <SettingsButton icon={<SearchIcon />} label="Search & Filter" onClick={() => handleActionClick(openSearch)} />
                    <SettingsButton icon={<GoogleDriveIcon />} label="Google Drive Sync" onClick={() => setView('sync')} />
                    <div className="px-2"><div className="border-t border-light-border dark:border-dark-border my-2"></div></div>
                    <SettingsButton icon={<DownloadIcon />} label="Export Data" onClick={() => handleActionClick(openExport)} />
                </div>
            )
        }
    };
    
    if(!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black/50 z-40 modal-backdrop animate-fade-in flex items-center justify-center p-3 sm:p-4" onClick={onClose}>
            <div className="bg-light-card dark:bg-dark-card rounded-2xl w-full max-w-md shadow-2xl animate-scale-in relative glass textured-card max-h-[90vh] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="p-3 sm:p-4 border-b border-light-border dark:border-dark-border flex justify-between items-center flex-shrink-0">
                    <div className="flex items-center">
                        {view !== 'main' && (
                            <button onClick={() => setView('main')} className="p-1.5 sm:p-2 mr-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-all duration-200" aria-label="Back">
                                <ChevronLeftIcon className="w-5 h-5"/>
                            </button>
                        )}
                        <h2 className="text-base sm:text-lg font-bold capitalize text-light-text-primary dark:text-dark-text-primary">{view === 'main' ? 'Settings' : view}</h2>
                    </div>
                    <button onClick={onClose} className="p-1.5 sm:p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors" aria-label="Close modal">
                        <CloseIcon className="w-5 h-5"/>
                    </button>
                </div>
                <div className="overflow-y-auto flex-1">
                {renderContent()}
                </div>
            </div>
        </div>
    );
};

const SettingsButton: React.FC<{icon: React.ReactElement; label: string; onClick: () => void}> = ({icon, label, onClick}) => (
    <button onClick={onClick} className="w-full flex items-center p-2.5 sm:p-3 text-left rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200 transform hover:scale-[1.01] active:scale-[0.99] card-hover">
        <div className="p-2 bg-slate-200 dark:bg-slate-700 rounded-lg mr-3 sm:mr-4 text-primary transition-colors flex-shrink-0">{React.cloneElement(icon, { className: "w-5 h-5 sm:w-6 sm:h-6" })}</div>
        <span className="font-semibold text-sm sm:text-base text-light-text-primary dark:text-dark-text-primary">{label}</span>
    </button>
);
const ManageBanksView: React.FC<{banks: Bank[], onAddBank: (name: string) => void, onDeleteBank: (id: string) => void}> = ({ banks, onAddBank, onDeleteBank }) => { 
    const [newBankName, setNewBankName] = useState(''); 
    const handleAddBank = (e: React.FormEvent) => { 
        e.preventDefault(); 
        if (newBankName.trim()) { 
            onAddBank(newBankName.trim()); 
            setNewBankName(''); 
        } 
    }; 
    return (
        <div className="p-4 sm:p-6 space-y-3 sm:space-y-4 animate-fade-in">
            <form onSubmit={handleAddBank} className="flex space-x-2">
                <input type="text" value={newBankName} onChange={e => setNewBankName(e.target.value)} placeholder="New bank name" className="flex-1 p-2 sm:p-2.5 text-sm sm:text-base bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-md focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all" />
                <button type="submit" className="bg-primary text-white font-bold px-3 sm:px-4 py-2 rounded-lg hover:bg-primary-focus transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-md text-sm sm:text-base">Add</button>
            </form>
            <ul className="space-y-2 max-h-48 overflow-y-auto">
                {banks.length > 0 ? banks.map((bank, index) => (
                    <li key={bank.id} className="flex items-center justify-between p-2.5 sm:p-3 bg-light-bg dark:bg-dark-bg rounded-md card-hover textured-card stagger-item" style={{animationDelay: `${index * 0.03}s`}}>
                        <span className="text-sm sm:text-base text-light-text-primary dark:text-dark-text-primary font-medium">{bank.name}</span>
                        <button onClick={() => onDeleteBank(bank.id)} className="text-danger hover:text-danger-focus transition-colors p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20" aria-label={`Delete ${bank.name}`}>
                            <TrashIcon className="w-4 h-4" />
                        </button>
                    </li>
                )) : (
                    <p className="text-center text-sm text-light-text-secondary dark:text-dark-text-secondary py-4">No banks added yet.</p>
                )}
            </ul>
        </div>
    );
};
const ReportsView: React.FC<{allTransactions: Transaction[]}> = ({ allTransactions }) => { 
    const [reportDate, setReportDate] = useState(new Date().toISOString().substring(0, 7)); 
    const [isCalendarOpen, setCalendarOpen] = useState(false); 
    const monthlyTransactions = useMemo(() => { 
        const [year, month] = reportDate.split('-').map(Number); 
        return allTransactions.filter(t => { 
            const transactionDate = new Date(t.date); 
            return transactionDate.getFullYear() === year && transactionDate.getMonth() === month - 1; 
        }); 
    }, [allTransactions, reportDate]); 
    return (
        <div className="p-4 sm:p-6 animate-fade-in">
            <label className="text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">Select Month</label>
            <input type="text" readOnly onClick={() => setCalendarOpen(true)} value={new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(new Date(reportDate + '-02'))} className="mt-1 w-full p-2.5 bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-md cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-all text-sm sm:text-base" />
            {isCalendarOpen && <Calendar isOpen={true} mode="month" onClose={() => setCalendarOpen(false)} onSelect={(val) => {setReportDate(val); setCalendarOpen(false); }} currentValue={reportDate} />}
            <div className="mt-4">
                {monthlyTransactions.length > 0 ? (
                    <Dashboard transactions={monthlyTransactions} />
                ) : (
                    <div className="text-center py-10 animate-fade-in">
                        <p className="text-light-text-secondary dark:text-dark-text-secondary">No data for this month.</p>
                    </div>
                )}
            </div>
        </div>
    );
};
const DataManagementView: React.FC<{onExportClick: () => void}> = ({ onExportClick }) => (
    <div className="p-4 sm:p-6 space-y-3 sm:space-y-4 animate-fade-in">
        <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">Export your transaction data as a CSV file for backup or use in other applications like Excel.</p>
        <button onClick={onExportClick} className="w-full bg-secondary text-white font-bold py-2.5 sm:py-3 rounded-lg hover:bg-emerald-600 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl flex items-center justify-center space-x-2 text-sm sm:text-base">
            <DownloadIcon className="w-5 h-5" />
            <span>Export to CSV</span>
        </button>
    </div>
);

const GoogleDriveSyncView: React.FC<{
    isConnected: boolean;
    isSyncing: boolean;
    onConnect: () => Promise<void>;
    onDisconnect: () => Promise<void>;
    onSyncToDrive: () => Promise<void>;
    onSyncFromDrive: () => Promise<void>;
}> = ({ isConnected, isSyncing, onConnect, onDisconnect, onSyncToDrive, onSyncFromDrive }) => {
    const lastSync = localStorageService.getLastSync();
    const lastSyncDate = lastSync ? new Date(lastSync).toLocaleString() : 'Never';

    return (
        <div className="p-4 sm:p-6 space-y-3 sm:space-y-4 animate-fade-in">
            <div className="flex items-center space-x-3 mb-3 sm:mb-4">
                <GoogleDriveIcon className="w-7 h-7 sm:w-8 sm:h-8 text-blue-500 flex-shrink-0" />
                <div>
                    <h3 className="text-base sm:text-lg font-bold text-light-text-primary dark:text-dark-text-primary">Google Drive Sync</h3>
                    <p className="text-xs sm:text-sm text-light-text-secondary dark:text-dark-text-secondary">
                        {isConnected ? 'Connected' : 'Not connected'}
                    </p>
                </div>
            </div>

            {isConnected && (
                <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                    <p className="text-xs sm:text-sm text-green-700 dark:text-green-300">
                        ✓ Your data is synced to Google Drive. You can access it on any device.
                    </p>
                    <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                        Last synced: {lastSyncDate}
                    </p>
                </div>
            )}

            {!isConnected && (
                <div className="p-3 sm:p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <p className="text-xs sm:text-sm text-light-text-secondary dark:text-dark-text-secondary mb-3">
                        Connect your Google Drive to sync your transaction data across all your devices. Your data will be stored securely in your Google Drive.
                    </p>
                    <button 
                        onClick={onConnect} 
                        disabled={isSyncing}
                        className="w-full bg-blue-500 text-white font-bold py-2.5 sm:py-3 rounded-lg hover:bg-blue-600 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 text-sm sm:text-base"
                    >
                        {isSyncing ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                <span>Connecting...</span>
                            </>
                        ) : (
                            <>
                                <GoogleDriveIcon className="w-5 h-5" />
                                <span>Connect to Google Drive</span>
                            </>
                        )}
                    </button>
                </div>
            )}

            {isConnected && (
                <div className="space-y-3">
                    <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                        <button 
                            onClick={onSyncToDrive} 
                            disabled={isSyncing}
                            className="flex-1 bg-primary text-white font-bold py-2.5 sm:py-2 rounded-lg hover:bg-primary-focus transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 text-sm sm:text-base"
                        >
                            {isSyncing ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    <span>Syncing...</span>
                                </>
                            ) : (
                                <>
                                    <CloudIcon className="w-4 h-4" />
                                    <span className="hidden sm:inline">Upload to Drive</span>
                                    <span className="sm:hidden">Upload</span>
                                </>
                            )}
                        </button>
                        <button 
                            onClick={onSyncFromDrive} 
                            disabled={isSyncing}
                            className="flex-1 bg-secondary text-white font-bold py-2.5 sm:py-2 rounded-lg hover:bg-emerald-600 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 text-sm sm:text-base"
                        >
                            {isSyncing ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    <span>Syncing...</span>
                                </>
                            ) : (
                                <>
                                    <DownloadIcon className="w-4 h-4" />
                                    <span className="hidden sm:inline">Download from Drive</span>
                                    <span className="sm:hidden">Download</span>
                                </>
                            )}
                        </button>
                    </div>
                    <button 
                        onClick={onDisconnect} 
                        disabled={isSyncing}
                        className="w-full text-danger font-semibold py-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                    >
                        Disconnect from Google Drive
                    </button>
                </div>
            )}
        </div>
    );
};

const convertToCSV = (transactions: Transaction[], banks: Bank[]): string => { const headers = ['ID', 'Date', 'Label', 'Type', 'Amount', 'Mode', 'Bank']; const bankMap = new Map(banks.map(b => [b.id, b.name])); const rows = transactions.map(t => { const row = [ t.id, new Date(t.date).toLocaleDateString(), `"${t.label.replace(/"/g, '""')}"`, t.type, t.amount, t.mode, t.bankId ? bankMap.get(t.bankId) || 'Unknown Bank' : '' ]; return row.join(','); }); return [headers.join(','), ...rows].join('\n'); };
interface ExportDataModalProps { isOpen: boolean; onClose: () => void; transactions: Transaction[]; banks: Bank[]; openCalendar: (mode: 'date' | 'month', onSelect: (date: string) => void, currentValue?: string) => void; }
const ExportDataModal: React.FC<ExportDataModalProps> = ({ isOpen, onClose, transactions, banks, openCalendar }) => { 
    const [startDate, setStartDate] = useState(''); 
    const [endDate, setEndDate] = useState(''); 
    
    useEffect(() => {
        if (!isOpen) {
            setStartDate('');
            setEndDate('');
        }
    }, [isOpen]);
    
    const handleExport = () => { 
        if (!startDate || !endDate) { 
            alert("Please select a start and end date."); 
            return; 
        } 
        const start = new Date(startDate).getTime(); 
        const end = new Date(endDate).getTime() + (24 * 60 * 60 * 1000 - 1); 
        if (start > end) { 
            alert("Start date cannot be after end date."); 
            return; 
        } 
        const filtered = transactions.filter(t => { 
            const tDate = new Date(t.date).getTime(); 
            return tDate >= start && tDate <= end; 
        }); 
        if (filtered.length === 0) { 
            alert("No transactions found in the selected date range."); 
            return; 
        } 
        const csvString = convertToCSV(filtered, banks); 
        const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8,' }); 
        const link = document.createElement("a"); 
        const url = URL.createObjectURL(blob); 
        link.setAttribute("href", url); 
        link.setAttribute("download", `m-track-export-${startDate}-to-${endDate}.csv`); 
        link.style.visibility = 'hidden'; 
        document.body.appendChild(link); 
        link.click(); 
        document.body.removeChild(link); 
        URL.revokeObjectURL(url);
        onClose(); 
    }; 
    
    if (!isOpen) return null; 
    return (
        <div className="fixed inset-0 bg-black/50 z-50 modal-backdrop animate-fade-in flex items-center justify-center p-3 sm:p-4" onClick={onClose}>
            <div className="bg-light-card dark:bg-dark-card rounded-2xl w-full max-w-md shadow-2xl animate-scale-in relative glass textured-card max-h-[90vh] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="p-3 sm:p-4 border-b border-light-border dark:border-dark-border flex justify-between items-center flex-shrink-0">
                    <h2 className="text-base sm:text-lg font-bold text-light-text-primary dark:text-dark-text-primary">Export Data to CSV</h2>
                    <button onClick={onClose} className="p-1.5 sm:p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors" aria-label="Close modal">
                        <CloseIcon className="w-5 h-5"/>
                    </button>
                </div>
                <div className="p-4 sm:p-6 space-y-3 sm:space-y-4 overflow-y-auto flex-1">
                    <div>
                        <label className="text-xs sm:text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">Start Date</label>
                        <input type="text" readOnly onClick={() => openCalendar('date', setStartDate, startDate)} value={startDate} required className="mt-1 w-full p-2.5 text-sm sm:text-base bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-md cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-all" />
                    </div>
                    <div>
                        <label className="text-xs sm:text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">End Date</label>
                        <input type="text" readOnly onClick={() => openCalendar('date', setEndDate, endDate)} value={endDate} required className="mt-1 w-full p-2.5 text-sm sm:text-base bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-md cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-all" />
                    </div>
                    <button onClick={handleExport} className="w-full bg-primary text-white font-bold py-2.5 sm:py-3 rounded-lg hover:bg-primary-focus transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl text-sm sm:text-base">
                        Export
                    </button>
                </div>
            </div>
        </div>
    );
};
interface SearchAndFilterModalProps { isOpen: boolean; onClose: () => void; transactions: Transaction[]; banks: Bank[]; onSearch: (results: Transaction[], searchTerm: string) => void; openCalendar: (mode: 'date' | 'month', onSelect: (date: string) => void, currentValue?: string) => void; }
const SearchAndFilterModal: React.FC<SearchAndFilterModalProps> = ({ isOpen, onClose, transactions, banks, onSearch, openCalendar }) => { 
    const [searchTerm, setSearchTerm] = useState(''); 
    const [startDate, setStartDate] = useState(''); 
    const [endDate, setEndDate] = useState(''); 
    const [typeFilter, setTypeFilter] = useState<'ALL' | TransactionType>('ALL'); 
    const [modeFilter, setModeFilter] = useState<'ALL' | PaymentMode>('ALL'); 
    const [bankFilter, setBankFilter] = useState('ALL');
    const [minAmount, setMinAmount] = useState('');
    const [maxAmount, setMaxAmount] = useState('');
    
    useEffect(() => {
        if (!isOpen) {
            // Reset filters when modal closes
            setTimeout(() => {
                setSearchTerm('');
                setStartDate('');
                setEndDate('');
                setTypeFilter('ALL');
                setModeFilter('ALL');
                setBankFilter('ALL');
                setMinAmount('');
                setMaxAmount('');
            }, 300);
        }
    }, [isOpen]);

    const handleSearch = () => {
        const min = minAmount ? parseFloat(minAmount) : null;
        const max = maxAmount ? parseFloat(maxAmount) : null;

        const results = transactions.filter(t => {
            const tDate = new Date(t.date); tDate.setHours(0,0,0,0); 
            const start = startDate ? new Date(startDate) : null; 
            if(start) start.setHours(0,0,0,0); 
            const end = endDate ? new Date(endDate) : null; 
            if(end) end.setHours(0,0,0,0); 
            
            if (start && tDate < start) return false; 
            if (end && tDate > end) return false;
            if (min !== null && t.amount < min) return false;
            if (max !== null && t.amount > max) return false;
            if (searchTerm && !t.label.toLowerCase().includes(searchTerm.toLowerCase())) return false; 
            if (typeFilter !== 'ALL' && t.type !== typeFilter) return false; 
            if (modeFilter !== 'ALL' && t.mode !== modeFilter) return false; 
            if (bankFilter !== 'ALL' && t.bankId !== bankFilter) return false; 
            
            return true; 
        }).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()); 
        
        onSearch(results, searchTerm); 
    }; 
    
    if (!isOpen) return null; 
    
    return ( 
        <div className="fixed inset-0 bg-black/50 z-50 modal-backdrop animate-fade-in flex items-center justify-center p-3 sm:p-4" onClick={onClose}>
            <div className="bg-light-card dark:bg-dark-card rounded-2xl w-full max-w-md shadow-2xl animate-scale-in relative glass textured-card max-h-[90vh] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="p-3 sm:p-4 border-b border-light-border dark:border-dark-border flex justify-between items-center flex-shrink-0">
                    <h2 className="text-base sm:text-lg font-bold text-light-text-primary dark:text-dark-text-primary">Search & Filter</h2>
                    <button onClick={onClose} className="p-1.5 sm:p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors" aria-label="Close modal">
                        <CloseIcon className="w-5 h-5"/>
                    </button>
                </div>
                <div className="p-4 sm:p-6 space-y-3 sm:space-y-4 overflow-y-auto flex-1">
                    <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Search by label..." className="w-full p-2.5 text-sm sm:text-base bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-md focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all" /> 
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                        <div>
                            <label className="text-xs sm:text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">Start Date</label>
                            <input type="text" readOnly onClick={() => openCalendar('date', setStartDate, startDate)} value={startDate} className="mt-1 w-full p-2.5 text-sm sm:text-base bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-md cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-all" />
                        </div>
                        <div>
                            <label className="text-xs sm:text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">End Date</label>
                             <input type="text" readOnly onClick={() => openCalendar('date', setEndDate, endDate)} value={endDate} className="mt-1 w-full p-2.5 text-sm sm:text-base bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-md cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-all" />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                        <div>
                            <label className="text-xs sm:text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">Min Amount</label>
                            <input type="number" value={minAmount} onChange={e => setMinAmount(e.target.value)} placeholder="e.g. 100" className="mt-1 w-full p-2.5 text-sm sm:text-base bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-md focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all" />
                        </div>
                        <div>
                            <label className="text-xs sm:text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">Max Amount</label>
                            <input type="number" value={maxAmount} onChange={e => setMaxAmount(e.target.value)} placeholder="e.g. 5000" className="mt-1 w-full p-2.5 text-sm sm:text-base bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-md focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all" />
                        </div>
                    </div>
                    <div>
                        <label className="text-xs sm:text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">Type</label>
                        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value as any)} className="mt-1 w-full p-2.5 text-sm sm:text-base bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-md focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all cursor-pointer">
                            <option value="ALL">All Types</option>
                            <option value={TransactionType.INCOME}>Income</option>
                            <option value={TransactionType.EXPENSE}>Expense</option>
                        </select>
                    </div>
                    <div>
                        <label className="text-xs sm:text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">Payment Mode</label>
                        <select value={modeFilter} onChange={e => setModeFilter(e.target.value as any)} className="mt-1 w-full p-2.5 text-sm sm:text-base bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-md focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all cursor-pointer">
                            <option value="ALL">All Modes</option>
                            {Object.values(PaymentMode).map(pm => <option key={pm} value={pm}>{pm}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="text-xs sm:text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">Bank</label>
                        <select value={bankFilter} onChange={e => setBankFilter(e.target.value)} className="mt-1 w-full p-2.5 text-sm sm:text-base bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-md focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed" disabled={modeFilter !== PaymentMode.BANK_TRANSFER && modeFilter !== 'ALL'}>
                            <option value="ALL">All Banks</option>
                            {banks.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                        </select>
                    </div>
                    <button onClick={handleSearch} className="w-full bg-primary text-white font-bold py-2.5 sm:py-3 rounded-lg hover:bg-primary-focus transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl text-sm sm:text-base">Search</button>
                </div>
            </div>
        </div> 
    ) 
}

interface SearchResultsModalProps { isOpen: boolean; onClose: () => void; results: Transaction[]; banks: Bank[]; onEdit: (t: Transaction) => void; onDelete: (id: string) => void; searchTerm: string; }
const SearchResultsModal: React.FC<SearchResultsModalProps> = ({ isOpen, onClose, results, banks, onEdit, onDelete, searchTerm }) => { 
    const getBankName = (bankId?: string) => banks.find(b => b.id === bankId)?.name; 
    const { totalIncome, totalExpense } = useMemo(() => { 
        let income = 0, expense = 0; 
        results.forEach(t => { 
            if (t.type === TransactionType.INCOME) income += t.amount; 
            else expense += t.amount; 
        }); 
        return { totalIncome: income, totalExpense: expense }; 
    }, [results]); 
    if (!isOpen) return null; 
    return (
        <div className="fixed inset-0 bg-black/50 z-50 modal-backdrop animate-fade-in flex items-end justify-center sm:items-center p-0 sm:p-4" onClick={onClose}>
            <div className="bg-light-bg dark:bg-dark-bg h-[90vh] sm:h-auto sm:max-h-[85vh] flex flex-col rounded-t-2xl sm:rounded-2xl w-full max-w-lg shadow-2xl animate-slide-up relative glass" onClick={e => e.stopPropagation()}>
                <div className="p-3 sm:p-4 border-b border-light-border dark:border-dark-border flex justify-between items-center sticky top-0 bg-light-bg/95 dark:bg-dark-bg/95 backdrop-blur-md rounded-t-2xl z-10">
                    <h2 className="text-base sm:text-lg font-bold text-light-text-primary dark:text-dark-text-primary">Search Results ({results.length})</h2>
                    <button onClick={onClose} className="p-1.5 sm:p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors" aria-label="Close modal">
                        <CloseIcon className="w-5 h-5"/>
                    </button>
                </div>
                <div className="p-3 sm:p-4 border-b border-light-border dark:border-dark-border flex justify-around text-center bg-light-card dark:bg-dark-card">
                    <div className="animate-fade-in">
                        <h4 className="text-xs text-secondary font-medium">Income</h4>
                        <p className="font-bold text-secondary text-base sm:text-lg">₹{totalIncome.toFixed(2)}</p>
                    </div>
                    <div className="animate-fade-in" style={{animationDelay: '0.1s', opacity: 0, animation: 'fade-in 0.3s ease-in-out forwards'}}>
                        <h4 className="text-xs text-danger font-medium">Expense</h4>
                        <p className="font-bold text-danger text-base sm:text-lg">₹{totalExpense.toFixed(2)}</p>
                    </div>
                    <div className="animate-fade-in" style={{animationDelay: '0.2s', opacity: 0, animation: 'fade-in 0.3s ease-in-out forwards'}}>
                        <h4 className="text-xs text-light-text-secondary dark:text-dark-text-secondary font-medium">Net</h4>
                        <p className={`font-bold text-base sm:text-lg ${totalIncome - totalExpense >= 0 ? 'text-light-text-primary dark:text-dark-text-primary' : 'text-danger'}`}>₹{(totalIncome - totalExpense).toFixed(2)}</p>
                    </div>
                </div>
                <div className="overflow-y-auto p-3 sm:p-4 flex-1">
                    {results.length > 0 ? (
                        <ul className="space-y-2 sm:space-y-3">
                            {results.map((t, index) => (
                                <li key={t.id} className="stagger-item" style={{animationDelay: `${index * 0.03}s`}}>
                                    <TransactionItem transaction={t} bankName={getBankName(t.bankId)} onEdit={() => onEdit(t)} onDelete={() => onDelete(t.id)} searchTerm={searchTerm} />
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="text-center py-10 animate-fade-in">
                            <p className="text-light-text-secondary dark:text-dark-text-secondary">No transactions found.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default App;

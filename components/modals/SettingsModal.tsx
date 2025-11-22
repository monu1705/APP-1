import React, { useState, useMemo } from 'react';
import { Bank, Transaction, TransactionType } from '../../types';
import { CloseIcon, ChevronRightIcon, TrashIcon, GoogleIcon, DownloadIcon, UploadIcon, SearchIcon, FileTextIcon, DatabaseIcon, LinkIcon } from '../icons';
import { useAppContext } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';
import BankSelector from '../BankSelector';
import { motion, AnimatePresence } from 'framer-motion';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    openSearch: () => void;
    openExport: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({
    isOpen,
    onClose,
    openSearch,
    openExport,
}) => {
    const {
        banks,
        addBank,
        deleteBank,
        transactions,
        isGoogleDriveConnected,
        isSyncing,
        lastSync,
        connectGoogleDrive,
        disconnectGoogleDrive,
        syncToDrive,
        syncFromDrive,
    } = useAppContext();

    const { showToast } = useToast();
    const [view, setView] = useState<'main' | 'banks' | 'reports' | 'data' | 'sync'>('main');

    const renderContent = () => {
        switch (view) {
            case 'banks':
                return <ManageBanksView
                    banks={banks}
                    onAddBank={async (name, balance) => {
                        await addBank(name, balance);
                        showToast('Bank added successfully', 'success');
                    }}
                    onDeleteBank={async (id) => {
                        await deleteBank(id);
                        showToast('Bank deleted successfully', 'success');
                    }}
                    onBack={() => setView('main')}
                />;
            case 'reports':
                return <ReportsView transactions={transactions} onBack={() => setView('main')} />;
            case 'data':
                return <DataManagementView
                    onExport={() => { onClose(); openExport(); }}
                    onImport={() => { /* Import logic handled in DataManagementView or separate modal */ }}
                    onBack={() => setView('main')}
                />;
            case 'sync':
                return <GoogleDriveSyncView
                    isConnected={isGoogleDriveConnected}
                    isSyncing={isSyncing}
                    lastSync={lastSync}
                    onConnect={connectGoogleDrive}
                    onDisconnect={disconnectGoogleDrive}
                    onSyncTo={async () => {
                        try {
                            await syncToDrive();
                            showToast('Synced to Drive successfully', 'success');
                        } catch (e) {
                            showToast('Failed to sync to Drive', 'error');
                        }
                    }}
                    onSyncFrom={async () => {
                        try {
                            await syncFromDrive();
                            showToast('Synced from Drive successfully', 'success');
                        } catch (e) {
                            showToast('Failed to sync from Drive', 'error');
                        }
                    }}
                    onBack={() => setView('main')}
                />;
            default:
                return (
                    <div className="space-y-3">
                        <MenuItem icon={<DatabaseIcon />} label="Manage Banks" onClick={() => setView('banks')} />
                        <MenuItem icon={<FileTextIcon />} label="Reports & Analytics" onClick={() => setView('reports')} />
                        <MenuItem icon={<SearchIcon />} label="Search & Filter" onClick={() => { onClose(); openSearch(); }} />
                        <MenuItem icon={<LinkIcon />} label="Google Drive Sync" onClick={() => setView('sync')} />
                        <MenuItem icon={<DownloadIcon />} label="Data Management" onClick={() => setView('data')} />
                    </div>
                );
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/40 z-50 backdrop-blur-sm flex items-center justify-center p-4"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.95, opacity: 0, y: 20 }}
                        className="bg-surface rounded-2xl w-full max-w-md shadow-2xl relative max-h-[90vh] overflow-hidden flex flex-col border border-border"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="p-5 border-b border-border flex justify-between items-center bg-surface">
                            <h2 className="text-xl font-bold text-primary">
                                {view === 'main' ? 'Settings' : view === 'banks' ? 'Manage Banks' : view === 'reports' ? 'Reports' : view === 'data' ? 'Data Management' : 'Google Drive Sync'}
                            </h2>
                            <button onClick={onClose} className="p-2 rounded-full hover:bg-surface-secondary transition-colors">
                                <CloseIcon className="w-5 h-5 text-secondary" />
                            </button>
                        </div>
                        <div className="p-5 overflow-y-auto flex-1 bg-base">
                            {renderContent()}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

const MenuItem: React.FC<{ icon: React.ReactNode, label: string, onClick: () => void }> = ({ icon, label, onClick }) => (
    <motion.button
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        onClick={onClick}
        className="w-full flex items-center justify-between p-4 bg-surface hover:bg-surface-secondary rounded-xl transition-all duration-200 group border border-border shadow-sm hover:shadow-md"
    >
        <div className="flex items-center space-x-4">
            <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors">
                {icon}
            </div>
            <span className="font-medium text-primary">{label}</span>
        </div>
        <ChevronRightIcon className="w-5 h-5 text-tertiary group-hover:translate-x-1 transition-transform duration-200" />
    </motion.button>
);

const ManageBanksView: React.FC<{ banks: Bank[], onAddBank: (name: string, balance: number) => void, onDeleteBank: (id: string) => void, onBack: () => void }> = ({ banks, onAddBank, onDeleteBank, onBack }) => {
    const { showToast } = useToast();

    const handleBankSelect = (bank: any) => {
        // Instant add with 0 balance
        onAddBank(bank.name, 0);
        showToast(`${bank.name} added successfully`, 'success');
    };

    const handleCustomBank = (name: string) => {
        if (name.trim()) {
            onAddBank(name, 0);
            showToast(`${name} added successfully`, 'success');
        }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <button onClick={onBack} className="mb-2 text-sm text-primary hover:underline flex items-center font-medium">
                <ChevronLeftIcon className="w-4 h-4 mr-1" /> Back to Settings
            </button>

            <div className="space-y-4">
                <h3 className="text-sm font-semibold text-secondary uppercase tracking-wider">Your Accounts</h3>
                <ul className="space-y-2">
                    {banks.map(bank => (
                        <li key={bank.id} className="flex justify-between items-center p-3 bg-surface rounded-xl border border-border shadow-sm">
                            <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                                    {bank.name.charAt(0)}
                                </div>
                                <div>
                                    <p className="font-semibold text-primary">{bank.name}</p>
                                    <p className="text-xs text-secondary">Balance: ₹{bank.balance.toFixed(2)}</p>
                                </div>
                            </div>
                            <button onClick={() => onDeleteBank(bank.id)} className="text-red-500 hover:bg-red-50 p-2 rounded-full transition-colors">
                                <TrashIcon className="w-4 h-4" />
                            </button>
                        </li>
                    ))}
                    {banks.length === 0 && (
                        <p className="text-center text-secondary text-sm py-2">No banks added yet.</p>
                    )}
                </ul>
            </div>

            <div className="space-y-4 pt-4 border-t border-border">
                <h3 className="text-sm font-semibold text-secondary uppercase tracking-wider">Add New Bank</h3>
                <BankSelector onSelect={handleBankSelect} onCustomBank={handleCustomBank} />
            </div>
        </div>
    );
};

const ReportsView: React.FC<{ transactions: Transaction[], onBack: () => void }> = ({ transactions, onBack }) => {
    const stats = useMemo(() => {
        let income = 0, expense = 0;
        transactions.forEach(t => {
            if (t.type === TransactionType.INCOME) income += t.amount;
            else expense += t.amount;
        });
        return { income, expense, net: income - expense };
    }, [transactions]);

    return (
        <div className="space-y-4 animate-fade-in">
            <button onClick={onBack} className="mb-2 text-sm text-primary hover:underline flex items-center font-medium"><ChevronLeftIcon className="w-4 h-4 mr-1" /> Back</button>
            <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-green-50 rounded-xl border border-green-100">
                    <p className="text-xs text-green-600 font-bold uppercase mb-1">Total Income</p>
                    <p className="text-xl font-bold text-green-700">₹{stats.income.toFixed(2)}</p>
                </div>
                <div className="p-4 bg-red-50 rounded-xl border border-red-100">
                    <p className="text-xs text-red-600 font-bold uppercase mb-1">Total Expense</p>
                    <p className="text-xl font-bold text-red-700">₹{stats.expense.toFixed(2)}</p>
                </div>
            </div>
            <div className="p-6 bg-surface rounded-2xl border border-border shadow-sm">
                <p className="text-xs text-secondary font-bold uppercase mb-1">Net Balance</p>
                <p className="text-3xl font-bold text-primary">₹{stats.net.toFixed(2)}</p>
            </div>
        </div>
    );
};

const DataManagementView: React.FC<{ onExport: () => void, onImport: () => void, onBack: () => void }> = ({ onExport, onImport, onBack }) => (
    <div className="space-y-4 animate-fade-in">
        <button onClick={onBack} className="mb-2 text-sm text-primary hover:underline flex items-center font-medium"><ChevronLeftIcon className="w-4 h-4 mr-1" /> Back</button>
        <div className="space-y-3">
            <button onClick={onExport} className="w-full flex items-center justify-between p-4 bg-surface hover:bg-surface-secondary rounded-xl transition-all border border-border shadow-sm hover:shadow-md">
                <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                        <DownloadIcon className="w-5 h-5" />
                    </div>
                    <div className="text-left">
                        <span className="font-medium block text-primary">Export Data</span>
                        <span className="text-xs text-secondary">Download as CSV/Excel</span>
                    </div>
                </div>
                <ChevronRightIcon className="w-5 h-5 text-tertiary" />
            </button>
        </div>
    </div>
);

const GoogleDriveSyncView: React.FC<{
    isConnected: boolean,
    isSyncing: boolean,
    lastSync: number | null,
    onConnect: () => void,
    onDisconnect: () => void,
    onSyncTo: () => void,
    onSyncFrom: () => void,
    onBack: () => void
}> = ({ isConnected, isSyncing, lastSync, onConnect, onDisconnect, onSyncTo, onSyncFrom, onBack }) => (
    <div className="space-y-6 animate-fade-in">
        <button onClick={onBack} className="mb-2 text-sm text-primary hover:underline flex items-center font-medium"><ChevronLeftIcon className="w-4 h-4 mr-1" /> Back</button>

        <div className="flex flex-col items-center space-y-4 p-6 bg-surface rounded-2xl border border-border shadow-sm">
            <div className={`p-4 rounded-full ${isConnected ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                <GoogleIcon className="w-12 h-12" />
            </div>
            <div className="text-center">
                <h3 className="font-bold text-lg text-primary">{isConnected ? 'Google Drive Connected' : 'Not Connected'}</h3>
                <p className="text-sm text-secondary mt-1">
                    {isConnected
                        ? 'Your data is backed up to your personal Google Drive.'
                        : 'Connect to securely backup and sync your data.'}
                </p>
            </div>
            {isConnected ? (
                <button onClick={onDisconnect} className="px-6 py-2 border border-red-200 text-red-500 rounded-lg hover:bg-red-50 transition-colors text-sm font-medium">
                    Disconnect
                </button>
            ) : (
                <button onClick={onConnect} className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors text-sm font-medium shadow-lg hover:shadow-primary/30">
                    Connect Google Drive
                </button>
            )}
        </div>

        {isConnected && (
            <div className="space-y-4">
                <div className="p-4 bg-surface-secondary rounded-xl border border-border">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-primary">Last Backup</span>
                        <span className="text-xs text-secondary">
                            {lastSync ? new Date(lastSync).toLocaleString() : 'Never'}
                        </span>
                    </div>
                    <button
                        onClick={onSyncTo}
                        disabled={isSyncing}
                        className="w-full flex items-center justify-center space-x-2 p-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-green-600/30"
                    >
                        <UploadIcon className={`w-5 h-5 ${isSyncing ? 'animate-spin' : ''}`} />
                        <span className="font-medium">{isSyncing ? 'Backing up...' : 'Back Up Now'}</span>
                    </button>
                    <p className="text-xs text-center text-tertiary mt-2">
                        Backups include all your transactions and bank accounts.
                    </p>
                </div>

                <div className="pt-2 border-t border-border">
                    <h4 className="text-sm font-medium text-secondary mb-3 uppercase tracking-wider">Restore Data</h4>
                    <button
                        onClick={onSyncFrom}
                        disabled={isSyncing}
                        className="w-full flex items-center justify-center space-x-2 p-3 bg-surface border border-border hover:bg-surface-secondary rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
                    >
                        <DownloadIcon className={`w-5 h-5 ${isSyncing ? 'animate-spin' : ''}`} />
                        <span className="font-medium">{isSyncing ? 'Restoring...' : 'Restore from Last Backup'}</span>
                    </button>
                </div>
            </div>
        )}
    </div>
);

const ChevronLeftIcon = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
);

export default SettingsModal;

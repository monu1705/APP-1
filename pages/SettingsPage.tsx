import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeftIcon, ChevronRightIcon, SearchIcon, FileTextIcon, DatabaseIcon, LinkIcon, TagIcon, TrashIcon, DownloadIcon } from '../components/icons';
import { useAppContext } from '../context/AppContext';
import { useToast } from '../context/ToastContext';
import ManageBanksView from '../components/settings/ManageBanksView';
import GoogleDriveSyncView from '../components/settings/GoogleDriveSyncView';
import ReportsView from '../components/settings/ReportsView';
import DataManagementView from '../components/settings/DataManagementView';

const SettingsPage: React.FC = () => {
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
    const navigate = useNavigate();

    const { showToast } = useToast();
    const [view, setView] = useState<'main' | 'banks' | 'categories' | 'reports' | 'data' | 'sync'>('main');

    // Mock Categories for now (In a real app, this would be in Context)
    const [categories, setCategories] = useState<string[]>(['Food', 'Transport', 'Shopping', 'Bills', 'Entertainment', 'Health', 'Education', 'Salary', 'Investment', 'Other']);
    const [newCategory, setNewCategory] = useState('');

    const handleAddCategory = () => {
        if (newCategory.trim() && !categories.includes(newCategory.trim())) {
            setCategories([...categories, newCategory.trim()]);
            setNewCategory('');
            showToast('Category added', 'success');
        }
    };

    const handleDeleteCategory = (cat: string) => {
        if (window.confirm(`Delete category "${cat}"?`)) {
            setCategories(categories.filter(c => c !== cat));
            showToast('Category deleted', 'success');
        }
    };

    const renderContent = () => {
        switch (view) {
            case 'banks':
                return <ManageBanksView
                    banks={banks}
                    onAddBank={async (name, balance) => {
                        await addBank(name);
                        showToast('Bank added successfully', 'success');
                    }}
                    onDeleteBank={async (id) => {
                        await deleteBank(id);
                        showToast('Bank deleted successfully', 'success');
                    }}
                    onBack={() => setView('main')}
                />;
            case 'categories':
                return (
                    <div className="space-y-6 animate-fade-in">
                        <button onClick={() => setView('main')} className="mb-2 text-sm text-primary hover:underline flex items-center font-medium">
                            <ChevronLeftIcon className="w-4 h-4 mr-1" /> Back to Settings
                        </button>
                        <div className="card p-6 bg-surface">
                            <h3 className="text-lg font-bold text-primary mb-4">Manage Categories</h3>
                            <div className="flex space-x-2 mb-6">
                                <input
                                    type="text"
                                    value={newCategory}
                                    onChange={(e) => setNewCategory(e.target.value)}
                                    placeholder="New Category Name"
                                    className="flex-1 px-4 py-2 bg-surface border border-border rounded-xl focus:ring-2 focus:ring-primary outline-none"
                                />
                                <button onClick={handleAddCategory} className="btn-primary px-4 py-2 rounded-xl">Add</button>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {categories.map(cat => (
                                    <div key={cat} className="flex justify-between items-center p-3 bg-surface-secondary rounded-xl border border-border">
                                        <span className="font-medium text-primary">{cat}</span>
                                        <button onClick={() => handleDeleteCategory(cat)} className="text-secondary hover:text-red-600 p-1">
                                            <TrashIcon className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                );
            case 'reports':
                return <ReportsView transactions={transactions} onBack={() => setView('main')} />;
            case 'data':
                return <DataManagementView
                    onExport={() => navigate('/export')}
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
                    <div className="space-y-4 animate-fade-in">
                        <button onClick={() => navigate('/')} className="mb-2 text-sm text-primary hover:underline flex items-center font-medium">
                            <ChevronLeftIcon className="w-4 h-4 mr-1" /> Back to Dashboard
                        </button>
                        <div className="space-y-3">
                            <MenuItem icon={<DatabaseIcon />} label="Manage Banks" onClick={() => setView('banks')} />
                            <MenuItem icon={<TagIcon />} label="Manage Categories" onClick={() => setView('categories')} />
                            <MenuItem icon={<FileTextIcon />} label="Reports & Analytics" onClick={() => setView('reports')} />
                            <MenuItem icon={<SearchIcon />} label="Search & Filter" onClick={() => navigate('/search')} />
                            <MenuItem icon={<LinkIcon />} label="Google Drive Sync" onClick={() => setView('sync')} />
                            <MenuItem icon={<DownloadIcon />} label="Data Management" onClick={() => setView('data')} />
                        </div>
                    </div>
                );
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            {renderContent()}
        </div>
    );
};

const MenuItem: React.FC<{ icon: React.ReactNode, label: string, onClick: () => void }> = ({ icon, label, onClick }) => (
    <button
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
    </button>
);

export default SettingsPage;

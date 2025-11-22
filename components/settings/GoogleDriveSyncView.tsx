import React from 'react';
import { ChevronLeftIcon, GoogleIcon, UploadIcon, DownloadIcon } from '../icons';

interface GoogleDriveSyncViewProps {
    isConnected: boolean;
    isSyncing: boolean;
    lastSync: number | null;
    onConnect: () => void;
    onDisconnect: () => void;
    onSyncTo: () => void;
    onSyncFrom: () => void;
    onBack: () => void;
}

const GoogleDriveSyncView: React.FC<GoogleDriveSyncViewProps> = ({
    isConnected,
    isSyncing,
    lastSync,
    onConnect,
    onDisconnect,
    onSyncTo,
    onSyncFrom,
    onBack
}) => {
    return (
        <div className="space-y-6 animate-fade-in">
            <button onClick={onBack} className="mb-2 text-sm text-primary hover:underline flex items-center font-medium">
                <ChevronLeftIcon className="w-4 h-4 mr-1" /> Back to Settings
            </button>

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
};

export default GoogleDriveSyncView;

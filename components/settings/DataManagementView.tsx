import React from 'react';
import { ChevronLeftIcon, ChevronRightIcon, DownloadIcon } from '../icons';

interface DataManagementViewProps {
    onExport: () => void;
    onBack: () => void;
}

const DataManagementView: React.FC<DataManagementViewProps> = ({ onExport, onBack }) => (
    <div className="space-y-4 animate-fade-in">
        <button onClick={onBack} className="mb-2 text-sm text-primary hover:underline flex items-center font-medium">
            <ChevronLeftIcon className="w-4 h-4 mr-1" /> Back
        </button>
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

export default DataManagementView;

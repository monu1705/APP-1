import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import { useAppContext } from '../context/AppContext';
import { ChevronLeftIcon, DownloadIcon } from '../components/icons';

const ExportPage: React.FC = () => {
    const { transactions } = useAppContext();
    const navigate = useNavigate();
    const [format, setFormat] = useState<'csv' | 'excel'>('excel');

    const handleExport = () => {
        const data = transactions.map(t => ({
            Date: new Date(t.date).toLocaleDateString(),
            Description: t.description,
            Amount: t.amount,
            Type: t.type,
            Category: t.category || 'N/A',
            Mode: t.mode,
            Bank: t.bankId || 'N/A'
        }));

        if (format === 'excel') {
            const ws = XLSX.utils.json_to_sheet(data);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Transactions");
            XLSX.writeFile(wb, "m-track-export.xlsx");
        } else {
            // Simple CSV export
            const headers = Object.keys(data[0]).join(',');
            const rows = data.map(row => Object.values(row).join(',')).join('\n');
            const csvContent = `data:text/csv;charset=utf-8,${headers}\n${rows}`;
            const encodedUri = encodeURI(csvContent);
            const link = document.createElement("a");
            link.setAttribute("href", encodedUri);
            link.setAttribute("download", "m-track-export.csv");
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    return (
        <div className="max-w-md mx-auto animate-fade-in">
            <button onClick={() => navigate('/settings')} className="mb-6 flex items-center text-sm font-medium text-secondary hover:text-primary transition-colors">
                <ChevronLeftIcon className="w-4 h-4 mr-1" /> Back to Settings
            </button>

            <div className="card p-8 bg-surface text-center">
                <div className="w-16 h-16 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mx-auto mb-4">
                    <DownloadIcon className="w-8 h-8" />
                </div>
                <h2 className="text-2xl font-bold text-primary mb-2">Export Data</h2>
                <p className="text-secondary mb-8">Download your transaction history for external analysis.</p>

                <div className="space-y-4 text-left">
                    <div>
                        <label className="block text-sm font-medium text-secondary mb-2">Format</label>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={() => setFormat('excel')}
                                className={`p-3 rounded-xl border text-sm font-medium transition-all ${format === 'excel' ? 'bg-primary/10 border-primary text-primary' : 'bg-surface border-border text-secondary hover:border-primary/50'}`}
                            >
                                Excel (.xlsx)
                            </button>
                            <button
                                onClick={() => setFormat('csv')}
                                className={`p-3 rounded-xl border text-sm font-medium transition-all ${format === 'csv' ? 'bg-primary/10 border-primary text-primary' : 'bg-surface border-border text-secondary hover:border-primary/50'}`}
                            >
                                CSV (.csv)
                            </button>
                        </div>
                    </div>

                    <button
                        onClick={handleExport}
                        className="w-full btn-primary py-3 shadow-lg shadow-primary/20 flex items-center justify-center space-x-2"
                    >
                        <DownloadIcon className="w-5 h-5" />
                        <span>Download File</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ExportPage;

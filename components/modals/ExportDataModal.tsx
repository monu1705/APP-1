import React, { useState } from 'react';
import { CloseIcon, DownloadIcon, FileTextIcon } from '../icons';
import { useAppContext } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';
import * as XLSX from 'xlsx';
import { motion, AnimatePresence } from 'framer-motion';

interface ExportDataModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const ExportDataModal: React.FC<ExportDataModalProps> = ({ isOpen, onClose }) => {
    const { transactions, banks, openCalendar } = useAppContext();
    const { showToast } = useToast();
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const handleExport = () => {
        if (!startDate || !endDate) {
            showToast('Please select both start and end dates.', 'error');
            return;
        }

        const start = new Date(startDate);
        const end = new Date(endDate);
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);

        const filteredTransactions = transactions.filter(t => {
            const tDate = new Date(t.date);
            return tDate >= start && tDate <= end;
        });

        if (filteredTransactions.length === 0) {
            showToast('No transactions found in the selected date range.', 'warning');
            return;
        }

        // Prepare data for Excel
        const dataToExport = filteredTransactions.map(t => ({
            Date: new Date(t.date).toLocaleDateString(),
            Type: t.type,
            Amount: t.amount,
            Bank: banks.find(b => b.id === t.bankId)?.name || 'Unknown Bank',
            Description: t.description,
            Category: t.category || 'Uncategorized'
        }));

        const worksheet = XLSX.utils.json_to_sheet(dataToExport);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Transactions");

        // Generate Excel file
        XLSX.writeFile(workbook, `M-Track_Export_${startDate}_to_${endDate}.xlsx`);

        showToast(`Successfully exported ${filteredTransactions.length} transactions to Excel.`, 'success');
        onClose();
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
                        className="bg-surface rounded-2xl w-full max-w-md shadow-2xl relative overflow-hidden flex flex-col border border-border"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="p-5 border-b border-border flex justify-between items-center bg-surface">
                            <h2 className="text-xl font-bold text-primary">Export Data</h2>
                            <button onClick={onClose} className="p-2 rounded-full hover:bg-surface-secondary transition-colors">
                                <CloseIcon className="w-5 h-5 text-secondary" />
                            </button>
                        </div>
                        <div className="p-6 space-y-6 bg-base">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-secondary mb-1">Start Date</label>
                                    <input
                                        type="text"
                                        readOnly
                                        onClick={() => openCalendar('date', setStartDate, startDate)}
                                        value={startDate}
                                        className="w-full p-3 bg-surface border border-border rounded-xl cursor-pointer hover:bg-surface-secondary transition-all focus:ring-2 focus:ring-primary outline-none text-primary"
                                        placeholder="Select start date"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-secondary mb-1">End Date</label>
                                    <input
                                        type="text"
                                        readOnly
                                        onClick={() => openCalendar('date', setEndDate, endDate)}
                                        value={endDate}
                                        className="w-full p-3 bg-surface border border-border rounded-xl cursor-pointer hover:bg-surface-secondary transition-all focus:ring-2 focus:ring-primary outline-none text-primary"
                                        placeholder="Select end date"
                                    />
                                </div>
                            </div>

                            <button
                                onClick={handleExport}
                                className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold py-3.5 rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all shadow-lg hover:shadow-green-500/30 transform hover:scale-[1.02] active:scale-[0.98]"
                            >
                                <FileTextIcon className="w-5 h-5" />
                                <span>Download Excel Report</span>
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default ExportDataModal;

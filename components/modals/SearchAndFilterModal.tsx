import React, { useState, useEffect } from 'react';
import { Transaction, Bank, TransactionType, PaymentMode } from '../../types';
import { CloseIcon } from '../icons';
import { useAppContext } from '../../context/AppContext';

interface SearchAndFilterModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSearch: (results: Transaction[], searchTerm: string) => void;
}

const SearchAndFilterModal: React.FC<SearchAndFilterModalProps> = ({ isOpen, onClose, onSearch }) => {
    const { transactions, banks, openCalendar } = useAppContext();
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
            const tDate = new Date(t.date); tDate.setHours(0, 0, 0, 0);
            const start = startDate ? new Date(startDate) : null;
            if (start) start.setHours(0, 0, 0, 0);
            const end = endDate ? new Date(endDate) : null;
            if (end) end.setHours(0, 0, 0, 0);

            if (start && tDate < start) return false;
            if (end && tDate > end) return false;
            if (min !== null && t.amount < min) return false;
            if (max !== null && t.amount > max) return false;
            if (searchTerm && !t.label.toLowerCase().includes(searchTerm.toLowerCase())) return false;
            if (typeFilter !== 'ALL' && t.type !== typeFilter) return false;
            if (modeFilter !== 'ALL' && t.mode !== modeFilter) return false;
            if (bankFilter !== 'ALL' && t.bankId !== bankFilter) return false;

            return true;
        }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        onSearch(results, searchTerm);
    };

    if (!isOpen) return null;

    return (

        <div className="fixed inset-0 bg-black/40 z-50 modal-backdrop animate-fade-in flex items-center justify-center p-3 sm:p-4" onClick={onClose}>
            <div className="bg-surface rounded-2xl w-full max-w-md shadow-2xl animate-scale-in relative max-h-[90vh] overflow-hidden flex flex-col border border-border" onClick={e => e.stopPropagation()}>
                <div className="p-3 sm:p-4 border-b border-border flex justify-between items-center flex-shrink-0 bg-surface">
                    <h2 className="text-base sm:text-lg font-bold text-primary">Search & Filter</h2>
                    <button onClick={onClose} className="p-1.5 sm:p-2 rounded-full hover:bg-surface-secondary transition-colors" aria-label="Close modal">
                        <CloseIcon className="w-5 h-5 text-secondary" />
                    </button>
                </div>
                <div className="p-4 sm:p-6 space-y-3 sm:space-y-4 overflow-y-auto flex-1 bg-base">
                    <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Search by label..." className="w-full p-2.5 text-sm sm:text-base bg-surface border border-border rounded-md focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all text-primary placeholder-tertiary" />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                        <div>
                            <label className="text-xs sm:text-sm font-medium text-secondary">Start Date</label>
                            <input type="text" readOnly onClick={() => openCalendar('date', setStartDate, startDate)} value={startDate} className="mt-1 w-full p-2.5 text-sm sm:text-base bg-surface border border-border rounded-md cursor-pointer hover:bg-surface-secondary transition-all text-primary" />
                        </div>
                        <div>
                            <label className="text-xs sm:text-sm font-medium text-secondary">End Date</label>
                            <input type="text" readOnly onClick={() => openCalendar('date', setEndDate, endDate)} value={endDate} className="mt-1 w-full p-2.5 text-sm sm:text-base bg-surface border border-border rounded-md cursor-pointer hover:bg-surface-secondary transition-all text-primary" />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                        <div>
                            <label className="text-xs sm:text-sm font-medium text-secondary">Min Amount</label>
                            <input type="number" value={minAmount} onChange={e => setMinAmount(e.target.value)} placeholder="e.g. 100" className="mt-1 w-full p-2.5 text-sm sm:text-base bg-surface border border-border rounded-md focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all text-primary placeholder-tertiary" />
                        </div>
                        <div>
                            <label className="text-xs sm:text-sm font-medium text-secondary">Max Amount</label>
                            <input type="number" value={maxAmount} onChange={e => setMaxAmount(e.target.value)} placeholder="e.g. 5000" className="mt-1 w-full p-2.5 text-sm sm:text-base bg-surface border border-border rounded-md focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all text-primary placeholder-tertiary" />
                        </div>
                    </div>
                    <div>
                        <label className="text-xs sm:text-sm font-medium text-secondary">Type</label>
                        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value as any)} className="mt-1 w-full p-2.5 text-sm sm:text-base bg-surface border border-border rounded-md focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all cursor-pointer text-primary">
                            <option value="ALL">All Types</option>
                            <option value={TransactionType.INCOME}>Income</option>
                            <option value={TransactionType.EXPENSE}>Expense</option>
                        </select>
                    </div>
                    <div>
                        <label className="text-xs sm:text-sm font-medium text-secondary">Payment Mode</label>
                        <select value={modeFilter} onChange={e => setModeFilter(e.target.value as any)} className="mt-1 w-full p-2.5 text-sm sm:text-base bg-surface border border-border rounded-md focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all cursor-pointer text-primary">
                            <option value="ALL">All Modes</option>
                            {Object.values(PaymentMode).map(pm => <option key={pm} value={pm}>{pm}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="text-xs sm:text-sm font-medium text-secondary">Bank</label>
                        <select value={bankFilter} onChange={e => setBankFilter(e.target.value)} className="mt-1 w-full p-2.5 text-sm sm:text-base bg-surface border border-border rounded-md focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed text-primary" disabled={modeFilter !== PaymentMode.BANK_TRANSFER && modeFilter !== 'ALL'}>
                            <option value="ALL">All Banks</option>
                            {banks.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                        </select>
                    </div>
                    <button onClick={handleSearch} className="w-full btn-primary py-2.5 sm:py-3 shadow-lg shadow-primary/20 text-sm sm:text-base">Search</button>
                </div>
            </div>
        </div>
    );
};

export default SearchAndFilterModal;

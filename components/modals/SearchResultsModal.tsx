import React, { useMemo } from 'react';
import { Transaction, TransactionType } from '../../types';
import { CloseIcon } from '../icons';
import { TransactionItem } from '../TransactionList';
import { useAppContext } from '../../context/AppContext';

interface SearchResultsModalProps {
    isOpen: boolean;
    onClose: () => void;
    results: Transaction[];
    onEdit: (t: Transaction) => void;
    onDelete: (id: string) => void;
    searchTerm: string;
}

const SearchResultsModal: React.FC<SearchResultsModalProps> = ({ isOpen, onClose, results, onEdit, onDelete, searchTerm }) => {
    const { banks } = useAppContext();

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

        <div className="fixed inset-0 bg-black/40 z-50 modal-backdrop animate-fade-in flex items-end justify-center sm:items-center p-0 sm:p-4" onClick={onClose}>
            <div className="bg-base h-[90vh] sm:h-auto sm:max-h-[85vh] flex flex-col rounded-t-2xl sm:rounded-2xl w-full max-w-lg shadow-2xl animate-slide-up relative border border-border" onClick={e => e.stopPropagation()}>
                <div className="p-3 sm:p-4 border-b border-border flex justify-between items-center sticky top-0 bg-surface z-10 rounded-t-2xl">
                    <h2 className="text-base sm:text-lg font-bold text-primary">Search Results ({results.length})</h2>
                    <button onClick={onClose} className="p-1.5 sm:p-2 rounded-full hover:bg-surface-secondary transition-colors" aria-label="Close modal">
                        <CloseIcon className="w-5 h-5 text-secondary" />
                    </button>
                </div>
                <div className="p-3 sm:p-4 border-b border-border flex justify-around text-center bg-surface-secondary">
                    <div className="animate-fade-in">
                        <h4 className="text-xs text-secondary font-medium">Income</h4>
                        <p className="font-bold text-green-600 text-base sm:text-lg">₹{totalIncome.toFixed(2)}</p>
                    </div>
                    <div className="animate-fade-in" style={{ animationDelay: '0.1s', opacity: 0, animation: 'fade-in 0.3s ease-in-out forwards' }}>
                        <h4 className="text-xs text-red-600 font-medium">Expense</h4>
                        <p className="font-bold text-red-600 text-base sm:text-lg">₹{totalExpense.toFixed(2)}</p>
                    </div>
                    <div className="animate-fade-in" style={{ animationDelay: '0.2s', opacity: 0, animation: 'fade-in 0.3s ease-in-out forwards' }}>
                        <h4 className="text-xs text-secondary font-medium">Net</h4>
                        <p className={`font-bold text-base sm:text-lg ${totalIncome - totalExpense >= 0 ? 'text-primary' : 'text-red-600'}`}>₹{(totalIncome - totalExpense).toFixed(2)}</p>
                    </div>
                </div>
                <div className="overflow-y-auto p-3 sm:p-4 flex-1 bg-base">
                    {results.length > 0 ? (
                        <ul className="space-y-2 sm:space-y-3">
                            {results.map((t, index) => (
                                <li key={t.id} className="stagger-item" style={{ animationDelay: `${index * 0.03}s` }}>
                                    <TransactionItem transaction={t} bankName={getBankName(t.bankId)} onEdit={() => onEdit(t)} onDelete={() => onDelete(t.id)} searchTerm={searchTerm} />
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="text-center py-10 animate-fade-in">
                            <p className="text-secondary">No transactions found.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SearchResultsModal;

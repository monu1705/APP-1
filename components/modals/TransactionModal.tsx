import React, { useState, useEffect } from 'react';
import { Transaction, TransactionType, PaymentMode } from '../../types';
import { CloseIcon } from '../icons';
import { useAppContext } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';

interface TransactionModalProps {
    isOpen: boolean;
    onClose: () => void;
    transaction: Transaction | null;
}

const TransactionModal: React.FC<TransactionModalProps> = ({ isOpen, onClose, transaction }) => {
    const { banks, addTransaction, updateTransaction, openCalendar } = useAppContext();
    const { showToast } = useToast();

    const [type, setType] = useState<TransactionType>(TransactionType.EXPENSE);
    const [amount, setAmount] = useState<string>('');
    const [label, setLabel] = useState<string>('');
    const [mode, setMode] = useState<PaymentMode>(PaymentMode.UPI);
    const [bankId, setBankId] = useState<string>('');
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const numericAmount = parseFloat(amount);
        if (isNaN(numericAmount) || numericAmount <= 0 || !label.trim()) {
            showToast("Please fill all fields with valid data.", 'error');
            return;
        }

        const transactionData = {
            type,
            amount: numericAmount,
            label: label.trim(),
            mode,
            bankId: mode === PaymentMode.BANK_TRANSFER ? bankId : undefined,
            date: new Date(date).toISOString(),
        };

        if (transaction) {
            await updateTransaction({ ...transactionData, id: transaction.id });
            showToast("Transaction updated successfully", 'success');
        } else {
            await addTransaction(transactionData);
            showToast("Transaction added successfully", 'success');
        }

        onClose();
    };

    if (!isOpen) return null;

    return (

        <div className="fixed inset-0 bg-black/40 z-40 modal-backdrop animate-fade-in flex items-center justify-center p-3 sm:p-4" onClick={onClose}>
            <div className="bg-surface rounded-2xl w-full max-w-md shadow-2xl animate-scale-in relative max-h-[90vh] overflow-hidden flex flex-col border border-border" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b border-border flex justify-between items-center bg-surface">
                    <h2 className="text-lg font-bold text-primary">{transaction ? 'Edit Transaction' : 'Add Transaction'}</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-surface-secondary transition-colors" aria-label="Close modal">
                        <CloseIcon className="w-5 h-5 text-secondary" />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-3 sm:space-y-4 overflow-y-auto flex-1 bg-base">
                    <div className="grid grid-cols-2 gap-2 p-1 bg-surface-secondary rounded-lg border border-border">
                        <button type="button" onClick={() => setType(TransactionType.EXPENSE)} className={`px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold rounded-md transition-all duration-200 ${type === TransactionType.EXPENSE ? 'bg-surface text-red-600 shadow-sm border border-border' : 'text-secondary hover:text-primary'}`}>
                            Expense
                        </button>
                        <button type="button" onClick={() => setType(TransactionType.INCOME)} className={`px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold rounded-md transition-all duration-200 ${type === TransactionType.INCOME ? 'bg-surface text-green-600 shadow-sm border border-border' : 'text-secondary hover:text-primary'}`}>
                            Income
                        </button>
                    </div>
                    <div>
                        <label className="text-xs sm:text-sm font-medium text-secondary">Amount</label>
                        <input type="number" step="0.01" min="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" required className="mt-1 w-full p-2.5 text-sm sm:text-base bg-surface border border-border rounded-md focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all text-primary placeholder-tertiary" />
                    </div>
                    <div>
                        <label className="text-xs sm:text-sm font-medium text-secondary">Label</label>
                        <input type="text" value={label} onChange={(e) => setLabel(e.target.value)} placeholder="e.g., Coffee, Salary" required className="mt-1 w-full p-2.5 text-sm sm:text-base bg-surface border border-border rounded-md focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all text-primary placeholder-tertiary" />
                    </div>
                    <div>
                        <label className="text-xs sm:text-sm font-medium text-secondary">Payment Mode</label>
                        <select value={mode} onChange={(e) => setMode(e.target.value as PaymentMode)} className="mt-1 w-full p-2.5 text-sm sm:text-base bg-surface border border-border rounded-md focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all cursor-pointer text-primary">
                            {Object.values(PaymentMode).map(pm => <option key={pm} value={pm}>{pm}</option>)}
                        </select>
                    </div>
                    {mode === PaymentMode.BANK_TRANSFER && (
                        <div className="animate-slide-down">
                            <label className="text-xs sm:text-sm font-medium text-secondary">Bank</label>
                            <select value={bankId} onChange={(e) => setBankId(e.target.value)} className="mt-1 w-full p-2.5 text-sm sm:text-base bg-surface border border-border rounded-md focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all cursor-pointer text-primary">
                                {banks.length > 0 ? banks.map(b => <option key={b.id} value={b.id}>{b.name}</option>) : <option disabled>No banks available</option>}
                            </select>
                        </div>
                    )}
                    <div>
                        <label className="text-xs sm:text-sm font-medium text-secondary">Date</label>
                        <input type="text" readOnly onClick={() => openCalendar('date', setDate, date)} value={date} required className="mt-1 w-full p-2.5 text-sm sm:text-base bg-surface border border-border rounded-md focus:ring-2 focus:ring-primary focus:border-primary outline-none cursor-pointer hover:bg-surface-secondary transition-all text-primary" />
                    </div>
                    <button type="submit" className="w-full btn-primary py-2.5 sm:py-3 shadow-lg shadow-primary/20 text-sm sm:text-base">
                        {transaction ? 'Update Transaction' : 'Save Transaction'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default TransactionModal;

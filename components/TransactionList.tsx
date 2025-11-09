
import React, { useState, useMemo } from 'react';
import { Transaction, TransactionType, PaymentMode, Bank } from '../types';
import { CashIcon, CardIcon, UpiIcon, BankIcon, EditIcon, TrashIcon, IncomeIcon, ExpenseIcon } from './icons';

interface TransactionListProps {
  transactions: Transaction[];
  banks: Bank[];
  onEdit: (transaction: Transaction) => void;
  onDelete: (id: string) => void;
}

const getPaymentModeIcon = (mode: PaymentMode) => {
    switch(mode) {
        case PaymentMode.CASH: return <CashIcon className="w-6 h-6" />;
        case PaymentMode.CARD: return <CardIcon className="w-6 h-6" />;
        case PaymentMode.UPI: return <UpiIcon className="w-6 h-6" />;
        case PaymentMode.BANK_TRANSFER: return <BankIcon className="w-6 h-6" />;
        default: return null;
    }
};

export const TransactionItem: React.FC<{ transaction: Transaction; bankName?: string; onEdit: () => void; onDelete: () => void; searchTerm?: string; }> = ({ transaction, bankName, onEdit, onDelete, searchTerm }) => {
    const isIncome = transaction.type === TransactionType.INCOME;
    const amountColor = isIncome ? 'text-secondary' : 'text-danger';
    const sign = isIncome ? '+' : '-';

    const highlightedLabel = useMemo(() => {
        if (!searchTerm?.trim()) {
            return transaction.label;
        }
        const escapedSearchTerm = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        if (!escapedSearchTerm) {
            return transaction.label;
        }
        const regex = new RegExp(`(${escapedSearchTerm})`, 'gi');
        const parts = transaction.label.split(regex);
        
        return (
            <>
                {parts.map((part, index) =>
                    part.toLowerCase() === searchTerm.toLowerCase() ? (
                        <mark key={index} className="bg-primary/30 rounded p-0 m-0">
                            {part}
                        </mark>
                    ) : (
                        <span key={index}>{part}</span>
                    )
                )}
            </>
        );
    }, [transaction.label, searchTerm]);

    return (
        <li className="flex items-center p-3 sm:p-4 bg-light-card dark:bg-dark-card rounded-lg shadow-sm hover:shadow-md card-hover textured-card transition-all duration-200 border border-transparent hover:border-light-border dark:hover:border-dark-border">
            <div className={`mr-3 sm:mr-4 p-2 sm:p-3 rounded-full transition-transform duration-200 hover:scale-110 ${isIncome ? 'bg-green-100 dark:bg-green-900/50' : 'bg-red-100 dark:bg-red-900/50'}`}>
                {isIncome ? <IncomeIcon className="w-5 h-5 sm:w-6 sm:h-6 text-secondary" /> : <ExpenseIcon className="w-5 h-5 sm:w-6 sm:h-6 text-danger" />}
            </div>
            <div className="flex-1 min-w-0">
                <p className="font-bold text-sm sm:text-base text-light-text-primary dark:text-dark-text-primary mb-1 truncate">{highlightedLabel}</p>
                <div className="flex items-center text-xs text-light-text-secondary dark:text-dark-text-secondary space-x-1 sm:space-x-2 flex-wrap">
                    <span className="flex items-center">{getPaymentModeIcon(transaction.mode)}</span>
                    <span className="hidden sm:inline">{transaction.mode} {bankName ? `(${bankName})` : ''}</span>
                    <span className="sm:hidden">{transaction.mode}</span>
                    <span className="hidden sm:inline">•</span>
                    <span className="hidden sm:inline">{new Date(transaction.date).toLocaleDateString()}</span>
                    <span className="sm:hidden text-xs">{new Date(transaction.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                </div>
            </div>
            <div className="text-right mr-2 sm:mr-4 flex-shrink-0">
                <p className={`font-bold text-base sm:text-lg ${amountColor} transition-colors`}>{sign}₹{transaction.amount.toFixed(2)}</p>
            </div>
            <div className="flex space-x-1 flex-shrink-0">
                <button onClick={onEdit} className="p-1.5 sm:p-2 text-light-text-secondary dark:text-dark-text-secondary hover:text-primary dark:hover:text-primary-focus hover:bg-primary/10 dark:hover:bg-primary/20 rounded-lg transition-all duration-200" aria-label="Edit transaction">
                    <EditIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
                <button onClick={onDelete} className="p-1.5 sm:p-2 text-light-text-secondary dark:text-dark-text-secondary hover:text-danger dark:hover:text-danger-focus hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-200" aria-label="Delete transaction">
                    <TrashIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
            </div>
        </li>
    );
};


const TransactionList: React.FC<TransactionListProps> = ({ transactions, banks, onEdit, onDelete }) => {
  const [filter, setFilter] = useState<'ALL' | TransactionType>('ALL');
  
  const filteredTransactions = transactions.filter(t => filter === 'ALL' || t.type === filter);
  
  const getBankName = (bankId?: string) => {
    return banks.find(b => b.id === bankId)?.name;
  };

  return (
    <div className="p-3 sm:p-4">
        <div className="mb-3 sm:mb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <h2 className="text-lg sm:text-xl font-bold text-light-text-primary dark:text-dark-text-primary">History</h2>
            <div className="flex space-x-1 sm:space-x-2 p-1 bg-slate-200 dark:bg-slate-800 rounded-lg w-full sm:w-auto">
                <button onClick={() => setFilter('ALL')} className={`flex-1 sm:flex-none px-2 sm:px-3 py-1.5 sm:py-1 text-xs sm:text-sm font-semibold rounded-md transition-all duration-200 ${filter === 'ALL' ? 'bg-light-card dark:bg-dark-card text-primary shadow-sm' : 'text-light-text-secondary dark:text-dark-text-secondary hover:bg-slate-300 dark:hover:bg-slate-700'}`}>All</button>
                <button onClick={() => setFilter(TransactionType.INCOME)} className={`flex-1 sm:flex-none px-2 sm:px-3 py-1.5 sm:py-1 text-xs sm:text-sm font-semibold rounded-md transition-all duration-200 ${filter === TransactionType.INCOME ? 'bg-light-card dark:bg-dark-card text-secondary shadow-sm' : 'text-light-text-secondary dark:text-dark-text-secondary hover:bg-slate-300 dark:hover:bg-slate-700'}`}>Income</button>
                <button onClick={() => setFilter(TransactionType.EXPENSE)} className={`flex-1 sm:flex-none px-2 sm:px-3 py-1.5 sm:py-1 text-xs sm:text-sm font-semibold rounded-md transition-all duration-200 ${filter === TransactionType.EXPENSE ? 'bg-light-card dark:bg-dark-card text-danger shadow-sm' : 'text-light-text-secondary dark:text-dark-text-secondary hover:bg-slate-300 dark:hover:bg-slate-700'}`}>Expense</button>
            </div>
        </div>
      {filteredTransactions.length > 0 ? (
        <ul className="space-y-2 sm:space-y-3">
          {filteredTransactions.map((t, index) => (
            <li key={t.id} className="stagger-item" style={{animationDelay: `${index * 0.03}s`}}>
              <TransactionItem transaction={t} bankName={getBankName(t.bankId)} onEdit={() => onEdit(t)} onDelete={() => onDelete(t.id)} />
            </li>
          ))}
        </ul>
      ) : (
        <div className="text-center py-10 animate-fade-in">
          <p className="text-light-text-secondary dark:text-dark-text-secondary">No transactions for this month.</p>
        </div>
      )}
    </div>
  );
};

export default TransactionList;
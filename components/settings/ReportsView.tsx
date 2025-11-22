import React, { useMemo } from 'react';
import { Transaction, TransactionType } from '../../types';
import { ChevronLeftIcon } from '../icons';

interface ReportsViewProps {
    transactions: Transaction[];
    onBack: () => void;
}

const ReportsView: React.FC<ReportsViewProps> = ({ transactions, onBack }) => {
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
            <button onClick={onBack} className="mb-2 text-sm text-primary hover:underline flex items-center font-medium">
                <ChevronLeftIcon className="w-4 h-4 mr-1" /> Back
            </button>
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

export default ReportsView;

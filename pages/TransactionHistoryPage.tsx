import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import TransactionList from '../components/TransactionList';
import { ChevronLeftIcon } from '../components/icons';

const TransactionHistoryPage: React.FC = () => {
    const { transactions, banks, deleteTransaction, currentDate } = useAppContext();
    const navigate = useNavigate();

    const monthlyTransactions = useMemo(() => {
        return transactions
            .filter(t => {
                const transactionDate = new Date(t.date);
                return transactionDate.getFullYear() === currentDate.getFullYear() &&
                    transactionDate.getMonth() === currentDate.getMonth();
            })
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [transactions, currentDate]);

    const handleDeleteTransaction = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this transaction?')) {
            await deleteTransaction(id);
        }
    };

    return (
        <div className="animate-fade-in">
            <button onClick={() => navigate('/')} className="mb-6 flex items-center text-sm font-medium text-secondary hover:text-primary transition-colors">
                <ChevronLeftIcon className="w-4 h-4 mr-1" /> Back to Dashboard
            </button>
            <div className="card p-6 bg-surface">
                <TransactionList
                    transactions={monthlyTransactions}
                    banks={banks}
                    onEdit={(t) => navigate(`/edit/${t.id}`)}
                    onDelete={handleDeleteTransaction}
                />
            </div>
        </div>
    );
};

export default TransactionHistoryPage;

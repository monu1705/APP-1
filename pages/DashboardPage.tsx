import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import Dashboard from '../components/Dashboard';
import { TransactionType } from '../types';
import { ChevronRightIcon, PlusIcon } from '../components/icons';

const DashboardPage: React.FC = () => {
    const { transactions, currentDate } = useAppContext();
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

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Dashboard Stats & Charts */}
            <Dashboard transactions={monthlyTransactions} />

            {/* Quick Actions / Recent Transactions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 card p-6 bg-surface">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold text-primary">Recent Activity</h3>
                        <button onClick={() => navigate('/history')} className="text-sm font-medium text-accent hover:text-primary-dark transition-colors flex items-center">
                            View All <ChevronRightIcon className="w-4 h-4 ml-1" />
                        </button>
                    </div>

                    {monthlyTransactions.length > 0 ? (
                        <div className="space-y-3">
                            {monthlyTransactions.slice(0, 5).map(t => (
                                <div key={t.id} className="flex justify-between items-center p-3 hover:bg-surface-secondary rounded-lg transition-colors border border-transparent hover:border-border cursor-pointer" onClick={() => navigate(`/edit/${t.id}`)}>
                                    <div className="flex items-center space-x-3">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${t.type === TransactionType.INCOME ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                            {t.type === TransactionType.INCOME ? <PlusIcon className="w-5 h-5" /> : <div className="w-2 h-2 bg-current rounded-full" />}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-primary">{t.description}</p>
                                            <p className="text-xs text-secondary">{new Date(t.date).toLocaleDateString()} • {t.category}</p>
                                        </div>
                                    </div>
                                    <span className={`font-bold ${t.type === TransactionType.INCOME ? 'text-green-600' : 'text-red-600'}`}>
                                        {t.type === TransactionType.INCOME ? '+' : '-'}₹{t.amount.toFixed(2)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-10 text-secondary">
                            <p>No transactions yet.</p>
                            <button onClick={() => navigate('/add')} className="mt-2 text-accent font-medium hover:underline">Add one now</button>
                        </div>
                    )}
                </div>

                <div className="card p-6 bg-surface flex flex-col justify-center items-center text-center space-y-4">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-2">
                        <PlusIcon className="w-8 h-8" />
                    </div>
                    <h3 className="text-lg font-bold text-primary">Quick Add</h3>
                    <p className="text-sm text-secondary">Record a new expense or income instantly.</p>
                    <button onClick={() => navigate('/add')} className="btn-primary w-full shadow-lg shadow-primary/20">
                        Add Transaction
                    </button>
                    <button onClick={() => navigate('/bulk-add')} className="btn-secondary w-full text-sm">
                        Bulk Add
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;

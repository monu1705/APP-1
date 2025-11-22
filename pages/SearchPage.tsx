import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Transaction, TransactionType } from '../types';
import { useAppContext } from '../context/AppContext';
import { ChevronLeftIcon, SearchIcon } from '../components/icons';
import TransactionList from '../components/TransactionList';

const SearchPage: React.FC = () => {
    const { transactions, banks, deleteTransaction } = useAppContext();
    const navigate = useNavigate();

    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState<'ALL' | TransactionType>('ALL');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [minAmount, setMinAmount] = useState('');
    const [maxAmount, setMaxAmount] = useState('');

    const filteredTransactions = useMemo(() => {
        if (!searchTerm && !startDate && !endDate && !minAmount && !maxAmount && filterType === 'ALL') {
            return [];
        }

        return transactions.filter(t => {
            const matchesSearch = t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                t.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                t.amount.toString().includes(searchTerm);
            const matchesType = filterType === 'ALL' || t.type === filterType;
            const matchesStartDate = !startDate || new Date(t.date) >= new Date(startDate);
            const matchesEndDate = !endDate || new Date(t.date) <= new Date(endDate);
            const matchesMinAmount = !minAmount || t.amount >= parseFloat(minAmount);
            const matchesMaxAmount = !maxAmount || t.amount <= parseFloat(maxAmount);

            return matchesSearch && matchesType && matchesStartDate && matchesEndDate && matchesMinAmount && matchesMaxAmount;
        }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [transactions, searchTerm, filterType, startDate, endDate, minAmount, maxAmount]);

    const handleDeleteTransaction = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this transaction?')) {
            await deleteTransaction(id);
        }
    };

    return (
        <div className="max-w-4xl mx-auto animate-fade-in">
            <button onClick={() => navigate('/')} className="mb-6 flex items-center text-sm font-medium text-secondary hover:text-primary transition-colors">
                <ChevronLeftIcon className="w-4 h-4 mr-1" /> Back to Dashboard
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Filters Panel */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="card p-5 bg-surface">
                        <h3 className="font-bold text-primary mb-4">Filters</h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-secondary mb-1">Search</label>
                                <div className="relative">
                                    <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-tertiary" />
                                    <input
                                        type="text"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        placeholder="Search..."
                                        className="w-full pl-9 pr-3 py-2 bg-surface-secondary border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-secondary mb-1">Type</label>
                                <select
                                    value={filterType}
                                    onChange={(e) => setFilterType(e.target.value as any)}
                                    className="w-full p-2 bg-surface-secondary border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none"
                                >
                                    <option value="ALL">All</option>
                                    <option value={TransactionType.INCOME}>Income</option>
                                    <option value={TransactionType.EXPENSE}>Expense</option>
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="block text-xs font-medium text-secondary mb-1">From</label>
                                    <input
                                        type="date"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        className="w-full p-2 bg-surface-secondary border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-secondary mb-1">To</label>
                                    <input
                                        type="date"
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                        className="w-full p-2 bg-surface-secondary border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="block text-xs font-medium text-secondary mb-1">Min Amount</label>
                                    <input
                                        type="number"
                                        value={minAmount}
                                        onChange={(e) => setMinAmount(e.target.value)}
                                        placeholder="0"
                                        className="w-full p-2 bg-surface-secondary border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-secondary mb-1">Max Amount</label>
                                    <input
                                        type="number"
                                        value={maxAmount}
                                        onChange={(e) => setMaxAmount(e.target.value)}
                                        placeholder="∞"
                                        className="w-full p-2 bg-surface-secondary border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Results Panel */}
                <div className="lg:col-span-2">
                    <div className="card p-6 bg-surface min-h-[400px]">
                        <h3 className="font-bold text-primary mb-4">
                            Results ({filteredTransactions.length})
                        </h3>

                        {filteredTransactions.length > 0 ? (
                            <TransactionList
                                transactions={filteredTransactions}
                                banks={banks}
                                onEdit={(t) => navigate(`/edit/${t.id}`)}
                                onDelete={handleDeleteTransaction}
                            />
                        ) : (
                            <div className="flex flex-col items-center justify-center h-64 text-secondary">
                                <SearchIcon className="w-12 h-12 mb-3 opacity-20" />
                                <p>No transactions found matching your filters.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SearchPage;

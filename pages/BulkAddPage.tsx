import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Transaction, TransactionType } from '../types';
import { useAppContext } from '../context/AppContext';
import { useToast } from '../context/ToastContext';
import { ChevronLeftIcon, PlusIcon, TrashIcon, SaveIcon } from '../components/icons';

interface BulkRow {
    id: string;
    date: string;
    description: string;
    amount: string;
    type: TransactionType;
    category: string;
    bankId: string;
}

const BulkAddPage: React.FC = () => {
    const { banks, addTransactions } = useAppContext();
    const { showToast } = useToast();
    const navigate = useNavigate();
    const [rows, setRows] = useState<BulkRow[]>([]);

    useEffect(() => {
        if (rows.length === 0) {
            addNewRow();
        }
    }, []);

    const addNewRow = () => {
        setRows(prev => [
            ...prev,
            {
                id: Math.random().toString(36).substr(2, 9),
                date: new Date().toISOString().split('T')[0],
                description: '',
                amount: '',
                type: TransactionType.EXPENSE,
                category: 'Food',
                bankId: banks.length > 0 ? banks[0].id : '',
            }
        ]);
    };

    const removeRow = (id: string) => {
        if (rows.length > 1) {
            setRows(prev => prev.filter(row => row.id !== id));
        }
    };

    const updateRow = (id: string, field: keyof BulkRow, value: any) => {
        setRows(prev => prev.map(row => row.id === id ? { ...row, [field]: value } : row));
    };

    const handleSave = async () => {
        // Validate
        const validRows = rows.filter(row => row.description && row.amount && row.bankId);
        if (validRows.length === 0) {
            showToast('Please fill in at least one transaction', 'error');
            return;
        }

        const transactionsToAdd: Omit<Transaction, 'id'>[] = validRows.map(row => ({
            date: row.date,
            description: row.description,
            amount: parseFloat(row.amount),
            type: row.type,
            category: row.category,
            bankId: row.bankId,
        }));

        await addTransactions(transactionsToAdd);
        showToast(`${transactionsToAdd.length} transactions added successfully`, 'success');
        navigate('/');
    };

    return (
        <div className="animate-fade-in">
            <button onClick={() => navigate('/')} className="mb-6 flex items-center text-sm font-medium text-secondary hover:text-primary transition-colors">
                <ChevronLeftIcon className="w-4 h-4 mr-1" /> Back to Dashboard
            </button>

            <div className="card bg-surface border border-border shadow-lg overflow-hidden">
                <div className="p-6 border-b border-border flex justify-between items-center bg-surface">
                    <h2 className="text-xl font-bold text-primary">
                        Bulk Add Transactions
                    </h2>
                    <button
                        onClick={handleSave}
                        className="btn-primary px-4 py-2 text-sm shadow-lg shadow-primary/20 flex items-center space-x-2"
                    >
                        <SaveIcon className="w-4 h-4" />
                        <span>Save All</span>
                    </button>
                </div>

                <div className="p-6 overflow-x-auto">
                    <div className="min-w-[800px]">
                        <div className="grid grid-cols-12 gap-3 mb-2 px-2 text-xs font-semibold text-secondary uppercase tracking-wider">
                            <div className="col-span-2">Date</div>
                            <div className="col-span-3">Description</div>
                            <div className="col-span-2">Amount</div>
                            <div className="col-span-1">Type</div>
                            <div className="col-span-2">Category</div>
                            <div className="col-span-2">Bank</div>
                        </div>

                        <div className="space-y-2">
                            {rows.map((row, index) => (
                                <motion.div
                                    key={row.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="grid grid-cols-12 gap-3 items-center p-2 bg-surface rounded-xl border border-border shadow-sm group"
                                >
                                    <div className="col-span-2">
                                        <input
                                            type="date"
                                            value={row.date}
                                            onChange={e => updateRow(row.id, 'date', e.target.value)}
                                            className="w-full p-2 rounded-lg bg-surface-secondary border border-border focus:ring-2 focus:ring-primary/50 outline-none text-sm text-primary"
                                        />
                                    </div>
                                    <div className="col-span-3">
                                        <input
                                            type="text"
                                            placeholder="Description"
                                            value={row.description}
                                            onChange={e => updateRow(row.id, 'description', e.target.value)}
                                            className="w-full p-2 rounded-lg bg-surface-secondary border border-border focus:ring-2 focus:ring-primary/50 outline-none text-sm text-primary placeholder-tertiary"
                                        />
                                    </div>
                                    <div className="col-span-2">
                                        <input
                                            type="number"
                                            placeholder="0.00"
                                            value={row.amount}
                                            onChange={e => updateRow(row.id, 'amount', e.target.value)}
                                            className="w-full p-2 rounded-lg bg-surface-secondary border border-border focus:ring-2 focus:ring-primary/50 outline-none text-sm text-primary placeholder-tertiary"
                                        />
                                    </div>
                                    <div className="col-span-1">
                                        <select
                                            value={row.type}
                                            onChange={e => updateRow(row.id, 'type', e.target.value as TransactionType)}
                                            className={`w-full p-2 rounded-lg border border-border focus:ring-2 focus:ring-primary/50 outline-none text-sm ${row.type === TransactionType.INCOME
                                                ? 'bg-green-50 text-green-700'
                                                : 'bg-red-50 text-red-700'
                                                }`}
                                        >
                                            <option value={TransactionType.EXPENSE}>Exp</option>
                                            <option value={TransactionType.INCOME}>Inc</option>
                                        </select>
                                    </div>
                                    <div className="col-span-2">
                                        <select
                                            value={row.category}
                                            onChange={e => updateRow(row.id, 'category', e.target.value)}
                                            className="w-full p-2 rounded-lg bg-surface-secondary border border-border focus:ring-2 focus:ring-primary/50 outline-none text-sm text-primary"
                                        >
                                            <option value="Food">Food</option>
                                            <option value="Transport">Transport</option>
                                            <option value="Shopping">Shopping</option>
                                            <option value="Bills">Bills</option>
                                            <option value="Entertainment">Entertainment</option>
                                            <option value="Health">Health</option>
                                            <option value="Education">Education</option>
                                            <option value="Salary">Salary</option>
                                            <option value="Investment">Investment</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>
                                    <div className="col-span-2 flex items-center space-x-2">
                                        <select
                                            value={row.bankId}
                                            onChange={e => updateRow(row.id, 'bankId', e.target.value)}
                                            className="w-full p-2 rounded-lg bg-surface-secondary border border-border focus:ring-2 focus:ring-primary/50 outline-none text-sm text-primary"
                                        >
                                            {banks.map(bank => (
                                                <option key={bank.id} value={bank.id}>{bank.name}</option>
                                            ))}
                                        </select>
                                        <button
                                            onClick={() => removeRow(row.id)}
                                            className="p-1.5 text-tertiary hover:text-red-500 hover:bg-red-50 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                                            disabled={rows.length === 1}
                                        >
                                            <TrashIcon className="w-4 h-4" />
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    <div className="mt-6 flex justify-center">
                        <button
                            onClick={addNewRow}
                            className="flex items-center space-x-2 px-4 py-2 bg-surface hover:bg-surface-secondary rounded-full border border-dashed border-border text-sm font-medium text-secondary transition-all"
                        >
                            <PlusIcon className="w-4 h-4" />
                            <span>Add Another Row</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BulkAddPage;

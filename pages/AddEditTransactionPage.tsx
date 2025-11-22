import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { useToast } from '../context/ToastContext';
import { TransactionType, PaymentMode } from '../types';
import { ChevronLeftIcon } from '../components/icons';

const AddEditTransactionPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { banks, addTransaction, updateTransaction, transactions, openCalendar } = useAppContext();
    const { showToast } = useToast();

    const [type, setType] = useState<TransactionType>(TransactionType.EXPENSE);
    const [amount, setAmount] = useState<string>('');
    const [label, setLabel] = useState<string>('');
    const [mode, setMode] = useState<PaymentMode>(PaymentMode.UPI);
    const [bankId, setBankId] = useState<string>('');
    const [date, setDate] = useState<string>(new Date().toISOString().substring(0, 10));
    const [category, setCategory] = useState<string>('Food'); // Default category

    // Load transaction if editing
    useEffect(() => {
        if (id) {
            const transaction = transactions.find(t => t.id === id);
            if (transaction) {
                setType(transaction.type);
                setAmount(transaction.amount.toString());
                setLabel(transaction.label); // Assuming label maps to description
                setMode(transaction.mode);
                setBankId(transaction.bankId || (banks.length > 0 ? banks[0].id : ''));
                setDate(new Date(transaction.date).toISOString().substring(0, 10));
                setCategory(transaction.category || 'Food');
            }
        } else {
            // Defaults for new transaction
            setBankId(banks.length > 0 ? banks[0].id : '');
        }
    }, [id, transactions, banks]);

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
            label: label.trim(), // Mapping label to description/label
            description: label.trim(), // Ensure description is also set if needed by types
            mode,
            bankId: mode === PaymentMode.BANK_TRANSFER ? bankId : undefined,
            date: new Date(date).toISOString(),
            category: category
        };

        if (id) {
            await updateTransaction({ ...transactionData, id });
            showToast("Transaction updated successfully", 'success');
        } else {
            await addTransaction(transactionData);
            showToast("Transaction added successfully", 'success');
        }

        navigate('/');
    };

    return (
        <div className="max-w-2xl mx-auto animate-fade-in">
            <button onClick={() => navigate(-1)} className="mb-6 flex items-center text-sm font-medium text-secondary hover:text-primary transition-colors">
                <ChevronLeftIcon className="w-4 h-4 mr-1" /> Back
            </button>

            <div className="card p-6 sm:p-8 bg-surface">
                <h2 className="text-2xl font-bold text-primary mb-6">{id ? 'Edit Transaction' : 'Add Transaction'}</h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Type Selection */}
                    <div className="grid grid-cols-2 gap-3 p-1.5 bg-surface-secondary rounded-xl border border-border">
                        <button type="button" onClick={() => setType(TransactionType.EXPENSE)} className={`py-2.5 text-sm font-bold rounded-lg transition-all duration-200 ${type === TransactionType.EXPENSE ? 'bg-surface text-red-600 shadow-sm border border-border' : 'text-secondary hover:text-primary'}`}>
                            Expense
                        </button>
                        <button type="button" onClick={() => setType(TransactionType.INCOME)} className={`py-2.5 text-sm font-bold rounded-lg transition-all duration-200 ${type === TransactionType.INCOME ? 'bg-surface text-green-600 shadow-sm border border-border' : 'text-secondary hover:text-primary'}`}>
                            Income
                        </button>
                    </div>

                    {/* Amount */}
                    <div>
                        <label className="block text-sm font-medium text-secondary mb-2">Amount</label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-bold text-tertiary">₹</span>
                            <input type="number" step="0.01" min="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" required className="w-full pl-10 pr-4 py-3 text-lg font-bold bg-surface border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all text-primary placeholder-tertiary" />
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-secondary mb-2">Description</label>
                        <input type="text" value={label} onChange={(e) => setLabel(e.target.value)} placeholder="e.g., Coffee, Salary" required className="w-full px-4 py-3 text-base bg-surface border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all text-primary placeholder-tertiary" />
                    </div>

                    {/* Category */}
                    <div>
                        <label className="block text-sm font-medium text-secondary mb-2">Category</label>
                        <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full px-4 py-3 text-base bg-surface border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all cursor-pointer text-primary appearance-none">
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

                    {/* Payment Mode */}
                    <div>
                        <label className="block text-sm font-medium text-secondary mb-2">Payment Mode</label>
                        <select value={mode} onChange={(e) => setMode(e.target.value as PaymentMode)} className="w-full px-4 py-3 text-base bg-surface border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all cursor-pointer text-primary appearance-none">
                            {Object.values(PaymentMode).map(pm => <option key={pm} value={pm}>{pm}</option>)}
                        </select>
                    </div>

                    {/* Bank Selection (Conditional) */}
                    {mode === PaymentMode.BANK_TRANSFER && (
                        <div className="animate-slide-down">
                            <label className="block text-sm font-medium text-secondary mb-2">Bank</label>
                            <select value={bankId} onChange={(e) => setBankId(e.target.value)} className="w-full px-4 py-3 text-base bg-surface border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all cursor-pointer text-primary appearance-none">
                                {banks.length > 0 ? banks.map(b => <option key={b.id} value={b.id}>{b.name}</option>) : <option disabled>No banks available</option>}
                            </select>
                        </div>
                    )}

                    {/* Date */}
                    <div>
                        <label className="block text-sm font-medium text-secondary mb-2">Date</label>
                        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required className="w-full px-4 py-3 text-base bg-surface border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none cursor-pointer hover:bg-surface-secondary transition-all text-primary" />
                    </div>

                    {/* Submit Button */}
                    <button type="submit" className="w-full btn-primary py-3.5 text-lg shadow-xl shadow-primary/20 mt-4">
                        {id ? 'Update Transaction' : 'Save Transaction'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AddEditTransactionPage;

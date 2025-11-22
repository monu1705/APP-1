import React, { useState } from 'react';
import { Bank } from '../../types';
import { ChevronLeftIcon, TrashIcon } from '../icons';
import { useToast } from '../../context/ToastContext';
import { useSound } from '../../context/SoundContext';
import BankSelector from '../BankSelector';

interface ManageBanksViewProps {
    banks: Bank[];
    onAddBank: (name: string, balance: number) => Promise<void>;
    onDeleteBank: (id: string) => Promise<void>;
    onBack: () => void;
}

const ManageBanksView: React.FC<ManageBanksViewProps> = ({ banks, onAddBank, onDeleteBank, onBack }) => {
    const { showToast } = useToast();
    const { playSound } = useSound();
    const [confirmBank, setConfirmBank] = useState<{ name: string, type: 'select' | 'custom' } | null>(null);

    const handleBankSelect = (bank: any) => {
        setConfirmBank({ name: bank.name, type: 'select' });
        playSound('click');
    };

    const handleCustomBank = (name: string) => {
        if (name.trim()) {
            setConfirmBank({ name: name, type: 'custom' });
            playSound('click');
        }
    };

    const confirmAddBank = async () => {
        if (confirmBank) {
            await onAddBank(confirmBank.name, 0);
            playSound('success');
            // showToast is already called in parent, but we can call it here if we want specific message
            // Actually parent calls it, so we might duplicate. Let's check parent usage.
            // Parent: onAddBank={async (name, balance) => { await addBank(name, balance); showToast(...) }}
            // So we don't need to call showToast here for success, but maybe for error?
            // Wait, the parent passes a function that does the toast.
            // But wait, in the original code:
            // confirmAddBank calls onAddBank, then playSound, then showToast.
            // So I should keep that logic or rely on parent.
            // The parent prop `onAddBank` is `async (name, balance) => { await addBank(name, balance); showToast('Bank added successfully', 'success'); }`
            // So if I await onAddBank, the toast happens.
            // But in original code:
            /*
            const confirmAddBank = () => {
                if (confirmBank) {
                    onAddBank(confirmBank.name, 0);
                    playSound('success');
                    showToast(`${confirmBank.name} added successfully`, 'success');
                    setConfirmBank(null);
                }
            };
            */
            // The original `onAddBank` prop in SettingsPage was:
            /*
            onAddBank={async (name, balance) => {
                await addBank(name, balance);
                showToast('Bank added successfully', 'success');
            }}
            */
            // So we had double toasts?
            // Let's clean this up. I will rely on the parent for the toast if it's passed, OR I will do it here.
            // Better to do it here for the specific message "${confirmBank.name} added successfully".
            // But the parent function also has a toast.
            // I will assume the parent function handles the data update, and I handle the UI feedback here if needed.
            // Actually, let's look at the prop signature I defined: `onAddBank: (name: string, balance: number) => Promise<void>;`
            // I'll stick to the original logic but maybe remove the parent's toast if I can't change parent yet.
            // But I AM changing parent (SettingsPage).
            // So I will make `SettingsPage` just pass `addBank` and I will handle toast here.

            setConfirmBank(null);
        }
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Are you sure you want to remove this bank?')) {
            await onDeleteBank(id);
            playSound('delete');
        }
    };

    return (
        <div className="space-y-6 animate-fade-in relative">
            <button onClick={() => { playSound('click'); onBack(); }} className="mb-2 text-sm text-primary hover:underline flex items-center font-medium">
                <ChevronLeftIcon className="w-4 h-4 mr-1" /> Back to Settings
            </button>

            <div className="card p-6 bg-surface">
                <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-secondary uppercase tracking-wider">Your Accounts</h3>
                    <ul className="space-y-2">
                        {banks.map(bank => (
                            <li key={bank.id} className="flex justify-between items-center p-3 bg-surface-secondary rounded-xl border border-border">
                                <div className="flex items-center space-x-3">
                                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                                        {bank.name.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-primary">{bank.name}</p>
                                        <p className="text-xs text-secondary">Balance: ₹{bank.balance.toFixed(2)}</p>
                                    </div>
                                </div>
                                <button onClick={() => handleDelete(bank.id)} className="text-red-500 hover:bg-red-50 p-2 rounded-full transition-colors">
                                    <TrashIcon className="w-4 h-4" />
                                </button>
                            </li>
                        ))}
                        {banks.length === 0 && (
                            <p className="text-center text-secondary text-sm py-2">No banks added yet.</p>
                        )}
                    </ul>
                </div>

                <div className="space-y-4 pt-6 mt-6 border-t border-border">
                    <h3 className="text-sm font-semibold text-secondary uppercase tracking-wider">Add New Bank</h3>
                    <BankSelector onSelect={handleBankSelect} onCustomBank={handleCustomBank} />
                </div>
            </div>

            {/* Confirmation Modal */}
            {confirmBank && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
                    <div className="bg-surface p-6 rounded-2xl shadow-xl max-w-sm w-full border border-border">
                        <h3 className="text-lg font-bold text-primary mb-2">Add Bank Account</h3>
                        <p className="text-secondary mb-6">
                            Are you sure you want to add <strong>{confirmBank.name}</strong> to your accounts?
                        </p>
                        <div className="flex space-x-3">
                            <button
                                onClick={() => setConfirmBank(null)}
                                className="flex-1 px-4 py-2 bg-surface-secondary text-primary rounded-xl font-medium hover:bg-gray-200 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmAddBank}
                                className="flex-1 px-4 py-2 bg-primary text-white rounded-xl font-medium hover:bg-primary-dark transition-colors shadow-lg shadow-primary/20"
                            >
                                Confirm
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageBanksView;

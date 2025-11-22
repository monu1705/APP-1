import React, { useState, useMemo } from 'react';
import { popularBanks, BankData } from '../data/indianBanks';
import { SearchIcon, PlusIcon } from './icons';
import { useSound } from '../context/SoundContext';

interface BankSelectorProps {
    onSelect: (bank: BankData) => void;
    onCustomBank: (name: string) => void;
}

const BankLogo: React.FC<{ bank: BankData }> = ({ bank }) => {
    const [error, setError] = useState(false);
    const [loading, setLoading] = useState(true);

    if (error) {
        return (
            <div
                className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm"
                style={{ backgroundColor: bank.color || '#6366f1' }}
            >
                {bank.initials}
            </div>
        );
    }

    return (
        <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm border border-gray-100 overflow-hidden p-2 relative">
            {loading && (
                <div className="absolute inset-0 bg-gray-100 animate-pulse" />
            )}
            <img
                src={bank.logo}
                alt={bank.name}
                className={`w-full h-full object-contain transition-opacity duration-300 ${loading ? 'opacity-0' : 'opacity-100'}`}
                onLoad={() => setLoading(false)}
                onError={() => {
                    setError(true);
                    setLoading(false);
                }}
            />
        </div>
    );
};

const BankSelector: React.FC<BankSelectorProps> = ({ onSelect, onCustomBank }) => {
    const [search, setSearch] = useState('');
    const { playSound } = useSound();

    const filteredBanks = useMemo(() => {
        if (!popularBanks) return [];
        return popularBanks.filter(bank =>
            bank.name.toLowerCase().includes(search.toLowerCase())
        );
    }, [search]);

    return (
        <div className="space-y-4">
            {/* Search Input */}
            <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                    type="text"
                    placeholder="Search for your bank..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-gray-900 placeholder-gray-400"
                />
            </div>

            {/* Bank Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[350px] overflow-y-auto p-1">
                {filteredBanks.map((bank) => (
                    <button
                        key={bank.id}
                        onClick={() => { playSound('click'); onSelect(bank); }}
                        className="flex flex-col items-center justify-center p-4 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all gap-3 h-32 group"
                    >
                        <BankLogo bank={bank} />
                        <span className="text-xs font-semibold text-center text-gray-700 group-hover:text-indigo-600 line-clamp-2 leading-tight">
                            {bank.name}
                        </span>
                    </button>
                ))}

                {/* Custom Bank Option */}
                {search && (
                    <button
                        onClick={() => { playSound('click'); onCustomBank(search); }}
                        className="col-span-full flex items-center justify-center p-4 bg-indigo-50 text-indigo-700 rounded-xl border border-indigo-100 hover:bg-indigo-100 transition-all gap-2 h-16"
                    >
                        <PlusIcon className="w-5 h-5" />
                        <span className="font-medium">Add "{search}" manually</span>
                    </button>
                )}
            </div>
        </div>
    );
};

export default BankSelector;

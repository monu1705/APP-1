import { Transaction, Bank } from '../types';

const TRANSACTIONS_KEY = 'm-track-transactions';
const BANKS_KEY = 'm-track-banks';
const LAST_SYNC_KEY = 'm-track-last-sync';

export const localStorageService = {
  // Transactions
  getTransactions: (): Transaction[] => {
    try {
      const data = localStorage.getItem(TRANSACTIONS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error reading transactions from localStorage:', error);
      return [];
    }
  },

  saveTransactions: (transactions: Transaction[]): void => {
    try {
      localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(transactions));
    } catch (error) {
      console.error('Error saving transactions to localStorage:', error);
      throw new Error('Failed to save transactions. Storage may be full.');
    }
  },

  // Banks
  getBanks: (): Bank[] => {
    try {
      const data = localStorage.getItem(BANKS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error reading banks from localStorage:', error);
      return [];
    }
  },

  saveBanks: (banks: Bank[]): void => {
    try {
      localStorage.setItem(BANKS_KEY, JSON.stringify(banks));
    } catch (error) {
      console.error('Error saving banks to localStorage:', error);
      throw new Error('Failed to save banks. Storage may be full.');
    }
  },

  // Last sync timestamp
  getLastSync: (): number | null => {
    try {
      const data = localStorage.getItem(LAST_SYNC_KEY);
      return data ? parseInt(data, 10) : null;
    } catch {
      return null;
    }
  },

  setLastSync: (timestamp: number): void => {
    try {
      localStorage.setItem(LAST_SYNC_KEY, timestamp.toString());
    } catch (error) {
      console.error('Error saving last sync timestamp:', error);
    }
  },

  // Export all data
  exportData: (): { transactions: Transaction[]; banks: Bank[]; lastSync: number | null } => {
    return {
      transactions: localStorageService.getTransactions(),
      banks: localStorageService.getBanks(),
      lastSync: localStorageService.getLastSync(),
    };
  },

  // Import data
  importData: (data: { transactions: Transaction[]; banks: Bank[] }): void => {
    localStorageService.saveTransactions(data.transactions);
    localStorageService.saveBanks(data.banks);
    localStorageService.setLastSync(Date.now());
  },

  // Clear all data
  clearAll: (): void => {
    localStorage.removeItem(TRANSACTIONS_KEY);
    localStorage.removeItem(BANKS_KEY);
    localStorage.removeItem(LAST_SYNC_KEY);
  },
};



export enum TransactionType {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE',
}

export enum PaymentMode {
  CASH = 'Cash',
  CARD = 'Card',
  UPI = 'UPI',
  BANK_TRANSFER = 'Bank Transfer',
}

export interface Bank {
  id: string;
  name: string;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  label: string;
  mode: PaymentMode;
  bankId?: string; // Optional, only for Bank Transfer
  date: string; // ISO string format
}

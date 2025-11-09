
import React, { useMemo } from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { Transaction, TransactionType, PaymentMode } from '../types';

interface DashboardProps {
  transactions: Transaction[];
}

const COLORS: { [key in PaymentMode]: string } = {
  [PaymentMode.CASH]: '#10b981',
  [PaymentMode.CARD]: '#3b82f6',
  [PaymentMode.UPI]: '#8b5cf6',
  [PaymentMode.BANK_TRANSFER]: '#f97316',
};

const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="p-3 bg-light-card/95 dark:bg-dark-card/95 backdrop-blur-md border border-light-border dark:border-dark-border rounded-lg shadow-xl glass">
          <p className="font-bold text-light-text-primary dark:text-dark-text-primary text-sm">{`${payload[0].name}: ₹${payload[0].value.toFixed(2)}`}</p>
          <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary mt-1">{`(${(payload[0].percent * 100).toFixed(0)}%)`}</p>
        </div>
      );
    }
    return null;
};

const Dashboard: React.FC<DashboardProps> = ({ transactions }) => {
  const { totalIncome, totalExpense, balance } = useMemo(() => {
    let income = 0;
    let expense = 0;
    transactions.forEach(t => {
      if (t.type === TransactionType.INCOME) {
        income += t.amount;
      } else {
        expense += t.amount;
      }
    });
    return { totalIncome: income, totalExpense: expense, balance: income - expense };
  }, [transactions]);

  const expenseData = useMemo(() => {
    const expenseByMode: { [key in PaymentMode]?: number } = {};
    transactions
      .filter(t => t.type === TransactionType.EXPENSE)
      .forEach(t => {
        expenseByMode[t.mode] = (expenseByMode[t.mode] || 0) + t.amount;
      });
    
    return Object.entries(expenseByMode).map(([name, value]) => ({
      name: name as PaymentMode,
      value: value || 0,
    }));
  }, [transactions]);

  return (
    <div className="p-3 sm:p-4 space-y-3 sm:space-y-4 page-transition">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <div className="p-4 sm:p-5 rounded-xl bg-light-card dark:bg-dark-card shadow-md card-hover textured-card animate-fade-in" style={{animationDelay: '0.1s'}}>
          <h3 className="text-xs sm:text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary mb-2">Total Income</h3>
          <p className="text-2xl sm:text-3xl font-bold text-secondary">₹{totalIncome.toFixed(2)}</p>
        </div>
        <div className="p-4 sm:p-5 rounded-xl bg-light-card dark:bg-dark-card shadow-md card-hover textured-card animate-fade-in" style={{animationDelay: '0.2s'}}>
          <h3 className="text-xs sm:text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary mb-2">Total Expense</h3>
          <p className="text-2xl sm:text-3xl font-bold text-danger">₹{totalExpense.toFixed(2)}</p>
        </div>
        <div className="p-4 sm:p-5 rounded-xl bg-light-card dark:bg-dark-card shadow-md card-hover textured-card animate-fade-in" style={{animationDelay: '0.3s'}}>
          <h3 className="text-xs sm:text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary mb-2">Balance</h3>
          <p className={`text-2xl sm:text-3xl font-bold ${balance >= 0 ? 'text-light-text-primary dark:text-dark-text-primary' : 'text-danger'}`}>
            ₹{balance.toFixed(2)}
          </p>
        </div>
      </div>

      {expenseData.length > 0 && (
        <div className="p-4 sm:p-5 rounded-xl bg-light-card dark:bg-dark-card shadow-md card-hover textured-card animate-fade-in" style={{animationDelay: '0.4s'}}>
          <h3 className="text-base sm:text-lg font-bold mb-3 sm:mb-4 text-light-text-primary dark:text-dark-text-primary">Expense Distribution</h3>
          <div className="w-full" style={{ height: '250px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={expenseData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius="70%"
                  fill="#8884d8"
                  dataKey="value"
                  nameKey="name"
                  animationBegin={0}
                  animationDuration={1000}
                  animationEasing="ease-out"
                >
                  {expenseData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[entry.name]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  iconType="circle" 
                  wrapperStyle={{ fontSize: '11px' }}
                  formatter={(value) => <span style={{ fontSize: '11px' }}>{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;

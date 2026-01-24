import React from 'react';
import { Transaction } from '../../types';
import { TransactionHistory } from '../TransactionHistory';

interface HistoryViewProps {
  transactions: Transaction[];
  currentUserId: string;
}

export const HistoryView: React.FC<HistoryViewProps> = ({ transactions, currentUserId }) => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-900">Transaction History</h2>
        <button className="text-sm text-emerald-600 font-medium hover:text-emerald-700">Download CSV</button>
      </div>
      <TransactionHistory transactions={transactions} currentUserId={currentUserId} />
    </div>
  );
};

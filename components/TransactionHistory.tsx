import React from 'react';
import { Card } from './ui/Card';
import { EditTransactionButton } from './EditTransactionButton';

// Minimal shape needed for display; keeps component decoupled from Prisma types
type TransactionHistoryItem = {
  id: string;
  amount: number;
  fee?: number;
  senderId: string;
  receiverId: string;
  senderEmail?: string | null;
  receiverEmail?: string | null;
  status: string;
  timestamp: Date;
};

interface TransactionHistoryProps {
  transactions: TransactionHistoryItem[];
  currentUserId: string;
}

export const TransactionHistory: React.FC<TransactionHistoryProps> = ({ transactions, currentUserId }) => {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    }).format(date);
  };

  return (
    <Card className="h-full" noPadding>
      <div className="p-6 border-b border-slate-100">
         <h3 className="text-lg font-semibold text-slate-900">Recent Transactions</h3>
      </div>

      {/* Desktop table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500 font-medium">
            <tr>
              <th className="px-6 py-3">Type</th>
              <th className="px-6 py-3">Counterparty</th>
              <th className="px-6 py-3">Date</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3 text-right">Amount</th>
              <th className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {transactions.length === 0 ? (
                <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                        No transactions found.
                    </td>
                </tr>
            ) : transactions.map((tx) => {
              const isReceived = tx.receiverId === currentUserId;
              const counterparty = isReceived ? tx.senderEmail : tx.receiverEmail;
              const canEdit = !isReceived && (tx.status === 'COMPLETED' || tx.status === 'PENDING_CLAIM');

              return (
                <tr key={tx.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${isReceived ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-600'}`}>
                        {isReceived ? (
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                          </svg>
                        ) : (
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                          </svg>
                        )}
                      </div>
                      <span className="font-medium text-slate-900">
                        {isReceived ? 'Received' : 'Sent'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-600">
                    {counterparty || 'Unknown'}
                  </td>
                  <td className="px-6 py-4 text-slate-500">
                    {formatDate(tx.timestamp)}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusClass(tx.status)}`}>
                      {tx.status}
                    </span>
                  </td>
                  <td className={`px-6 py-4 text-right font-medium ${isReceived ? 'text-emerald-600' : 'text-slate-900'}`}>
                    {isReceived ? '+' : '-'}${tx.amount.toFixed(2)}
                    {!isReceived && tx.fee ? (
                      <div className="text-xs text-slate-400 font-normal">+${tx.fee.toFixed(2)} fee</div>
                    ) : null}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {canEdit && counterparty ? (
                      <EditTransactionButton
                        transactionId={tx.id}
                        originalAmount={tx.amount}
                        originalReceiverEmail={counterparty}
                      />
                    ) : null}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden divide-y divide-slate-100">
        {transactions.length === 0 ? (
          <div className="px-6 py-8 text-center text-slate-500">No transactions found.</div>
        ) : transactions.map((tx) => {
          const isReceived = tx.receiverId === currentUserId;
          const counterparty = isReceived ? tx.senderEmail : tx.receiverEmail;
          const canEdit = !isReceived && (tx.status === 'COMPLETED' || tx.status === 'PENDING_CLAIM');

          return (
            <div key={tx.id} className="p-4 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`p-2 rounded-full ${isReceived ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-600'}`}>
                    {isReceived ? (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                      </svg>
                    )}
                  </div>
                  <span className="font-medium text-slate-900">{isReceived ? 'Received' : 'Sent'}</span>
                </div>
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusClass(tx.status)}`}>
                  {tx.status}
                </span>
              </div>
              <div className="text-sm text-slate-600 truncate">{counterparty || 'Unknown'}</div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">{formatDate(tx.timestamp)}</span>
                <span className={`text-lg font-bold ${isReceived ? 'text-emerald-600' : 'text-slate-900'}`}>
                  {isReceived ? '+' : '-'}${tx.amount.toFixed(2)}
                </span>
              </div>
              {!isReceived && tx.fee ? (
                <div className="text-xs text-slate-400">Bank fee: ${tx.fee.toFixed(2)}</div>
              ) : null}
              {canEdit && counterparty ? (
                <div className="pt-1">
                  <EditTransactionButton
                    transactionId={tx.id}
                    originalAmount={tx.amount}
                    originalReceiverEmail={counterparty}
                  />
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </Card>
  );
};

function statusClass(status: string) {
  switch (status) {
    case 'COMPLETED':
      return 'bg-emerald-100 text-emerald-800';
    case 'PENDING_CLAIM':
      return 'bg-amber-100 text-amber-800';
    case 'PENDING_EDIT':
      return 'bg-blue-100 text-blue-800';
    case 'EDITED':
      return 'bg-slate-200 text-slate-700';
    case 'REVERSED':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-yellow-100 text-yellow-800';
  }
}
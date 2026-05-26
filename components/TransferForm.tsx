import React, { useState } from 'react';
import { Card, CardHeader } from './ui/Card';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { calcTransferFee } from '@/lib/fees';

interface TransferFormProps {
  onReview: (email: string, amount: number) => void;
  isLoading?: boolean;
}

export const TransferForm: React.FC<TransferFormProps> = ({ onReview, isLoading }) => {
  const [email, setEmail] = useState('');
  const [amount, setAmount] = useState('');
  const [error, setError] = useState<string | null>(null);

  const numAmount = parseFloat(amount);
  const validAmount = !isNaN(numAmount) && numAmount > 0 ? numAmount : 0;
  const fee = calcTransferFee(validAmount);
  const total = Math.round((validAmount + fee) * 100) / 100;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !amount) {
        setError('Please fill in all fields');
        return;
    }
    
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
        setError('Please enter a valid amount');
        return;
    }

    onReview(email, numAmount);
    // Reset handled by parent or manual clear if needed, 
    // but typically we wait for success. For this demo, we'll keep values until success.
  };

  // Exposed method to clear form, could be done via ref or effect, but simplifying by just re-rendering component
  // or letting parent manage key.
  
  return (
    <Card>
      <CardHeader 
        title="Quick Transfer" 
        subtitle="Send money securely to any email address."
      />
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input 
          label="Recipient Email" 
          type="email" 
          placeholder="e.g. tendai@home.co.zw"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          }
        />
        
        <Input 
          label="Amount (USD)" 
          type="number" 
          min="1"
          step="0.01"
          placeholder="0.00"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          icon={
            <span className="text-slate-400 font-bold">$</span>
          }
        />

        {validAmount > 0 && (
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm space-y-1">
            <div className="flex justify-between text-slate-600">
              <span>Amount</span>
              <span>${validAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Bank fee (2.5%)</span>
              <span>${fee.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-semibold text-slate-900 border-t border-slate-200 pt-1 mt-1">
              <span>Total debit</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>
        )}

        {error && (
          <div className="p-3 rounded-lg text-sm bg-red-50 text-red-700 border border-red-200">
            {error}
          </div>
        )}

        <Button 
          type="submit" 
          className="w-full" 
          variant="secondary"
          isLoading={isLoading}
        >
          Review Transfer
        </Button>
      </form>
    </Card>
  );
};

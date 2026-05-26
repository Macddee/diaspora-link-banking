'use client';

import React, { useState } from 'react';
import { Modal } from './ui/Modal';
import { Input } from './ui/Input';
import { Toast } from './ui/Toast';
import { requestTransactionEdit } from '@/app/actions';
import { useRouter } from 'next/navigation';

interface EditTransactionButtonProps {
  transactionId: string;
  originalAmount: number;
  originalReceiverEmail: string;
}

const FEE_RATE = 0.025;

export const EditTransactionButton: React.FC<EditTransactionButtonProps> = ({
  transactionId,
  originalAmount,
  originalReceiverEmail,
}) => {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState(String(originalAmount));
  const [email, setEmail] = useState(originalReceiverEmail);
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const num = parseFloat(amount);
  const validAmount = !isNaN(num) && num > 0 ? num : 0;
  const fee = Math.round(validAmount * FEE_RATE * 100) / 100;

  const submit = async () => {
    if (!validAmount || !email.trim()) {
      setToast({ message: 'Please enter a valid amount and recipient email.', type: 'error' });
      return;
    }
    setLoading(true);
    try {
      const res = await requestTransactionEdit(transactionId, validAmount, email.trim(), reason.trim() || undefined);
      if (res.success) {
        setToast({ message: res.message || 'Edit request submitted.', type: 'success' });
        setOpen(false);
        router.refresh();
      } else {
        setToast({ message: res.message || 'Could not submit edit request.', type: 'error' });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-xs font-medium text-blue-600 hover:text-blue-700 underline"
      >
        Edit
      </button>

      <Modal
        isOpen={open}
        onClose={() => setOpen(false)}
        title="Request Transaction Edit"
        confirmText={loading ? 'Submitting...' : 'Submit for Approval'}
        onConfirm={submit}
        isLoading={loading}
      >
        <div className="space-y-4">
          <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-xs text-amber-800">
            Edits require admin approval. While your request is pending, the recipient&apos;s
            funds will be placed on hold and cannot be cashed out.
          </div>

          <Input
            label="New Recipient Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <Input
            label="New Amount (USD)"
            type="number"
            min="0.01"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Reason (optional)</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={2}
              className="block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900"
              placeholder="e.g. Wrong amount entered"
            />
          </div>

          {validAmount > 0 && (
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm space-y-1">
              <div className="flex justify-between text-slate-600">
                <span>New amount</span>
                <span>${validAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>New bank fee (2.5%)</span>
                <span>${fee.toFixed(2)}</span>
              </div>
            </div>
          )}
        </div>
      </Modal>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </>
  );
};
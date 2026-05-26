
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { TransferForm } from '@/components/TransferForm';
import { transferFunds } from '@/app/actions';
import { Toast } from '@/components/ui/Toast';
import { Modal } from '@/components/ui/Modal';
import { calcTransferFee } from '@/lib/fees';

export default function TransfersPage() {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pendingTransfer, setPendingTransfer] = useState<{email: string; amount: number} | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [toast, setToast] = useState<{message: string; type: 'success' | 'error'} | null>(null);
  const [pendingClaimNotice, setPendingClaimNotice] = useState<string | null>(null);

  const initiateTransfer = (email: string, amount: number) => {
    setPendingTransfer({ email, amount });
    setIsModalOpen(true);
  };

  const confirmTransfer = async () => {
    if (!pendingTransfer) return;
    setIsProcessing(true);
    try {
        const result = await transferFunds(pendingTransfer.email, pendingTransfer.amount);
        if (result.success) {
            setIsModalOpen(false);
            if (result.pendingClaim) {
              // Recipient is not registered; funds are on hold.
              setPendingClaimNotice(
                `${pendingTransfer.email} is not a registered user yet. The funds have been placed on hold in our system and will be released to them once they sign up using this email.`
              );
              setToast({ message: 'Transfer placed on hold (recipient not registered).', type: 'success' });
              router.refresh();
            } else {
              setToast({ message: 'Transfer successful!', type: 'success' });
              router.push('/dashboard');
              router.refresh();
            }
        } else {
            setToast({ message: result.message, type: 'error' });
        }
    } catch (_e) {
        setToast({ message: 'System error occurred', type: 'error' });
    } finally {
        setIsProcessing(false);
    }
  };

  const amount = pendingTransfer?.amount ?? 0;
  const fee = calcTransferFee(amount);
  const total = Math.round((amount + fee) * 100) / 100;

  return (
    <div className="max-w-xl mx-auto space-y-6 mt-10">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-slate-900">Send Money</h2>
        <p className="text-slate-500 mt-2">Send to any email. A flat 2.5% bank fee applies.</p>
      </div>

      {pendingClaimNotice && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            </svg>
            <div className="flex-1">
              <p className="font-semibold mb-1">Recipient not registered</p>
              <p>{pendingClaimNotice}</p>
            </div>
            <button
              onClick={() => setPendingClaimNotice(null)}
              className="text-amber-700 hover:text-amber-900"
              aria-label="Dismiss"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      <TransferForm onReview={initiateTransfer} />

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title="Confirm Transfer"
        onConfirm={confirmTransfer}
        isLoading={isProcessing}
        confirmText="Confirm & Pay"
      >
         <div className="space-y-4">
            <div className="bg-slate-50 p-4 rounded-lg">
                <p className="text-sm text-slate-500">You are sending</p>
                <p className="text-3xl font-bold text-slate-900">${amount.toFixed(2)}</p>
            </div>
            <div>
                <p className="text-sm font-medium text-slate-900">Recipient</p>
                <p className="text-slate-600">{pendingTransfer?.email}</p>
            </div>
            <div className="rounded-lg border border-slate-200 p-3 text-sm space-y-1">
              <div className="flex justify-between text-slate-600">
                <span>Amount</span>
                <span>${amount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Bank fee (2.5%)</span>
                <span>${fee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-semibold text-slate-900 border-t border-slate-200 pt-1 mt-1">
                <span>Total to be debited</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
            <p className="text-xs text-slate-500">
              If the recipient isn&apos;t registered, the funds will be held by the bank and released to them after they sign up using this email.
            </p>
        </div>
      </Modal>

      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}
    </div>
  );
}

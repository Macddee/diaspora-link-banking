
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { TransferForm } from '@/components/TransferForm';
import { transferFunds } from '@/app/actions';
import { Toast } from '@/components/ui/Toast';
import { Modal } from '@/components/ui/Modal';

export default function TransfersPage() {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pendingTransfer, setPendingTransfer] = useState<{email: string; amount: number} | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [toast, setToast] = useState<{message: string; type: 'success' | 'error'} | null>(null);

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
            setToast({ message: 'Transfer successful!', type: 'success' });
            setIsModalOpen(false);
          // Navigate to dashboard and refresh to show latest data
          router.push('/dashboard');
          router.refresh();
        } else {
            setToast({ message: result.message, type: 'error' });
        }
    } catch (_e) {
        setToast({ message: 'System error occurred', type: 'error' });
    } finally {
        setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-6 mt-10">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-slate-900">Send Money</h2>
        <p className="text-slate-500 mt-2">Fast, secure, and fee-free transfers within the network.</p>
      </div>
      
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
                <p className="text-3xl font-bold text-slate-900">${pendingTransfer?.amount.toFixed(2)}</p>
            </div>
            <div>
                <p className="text-sm font-medium text-slate-900">Recipient</p>
                <p className="text-slate-600">{pendingTransfer?.email}</p>
            </div>
        </div>
      </Modal>

      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}
    </div>
  );
}

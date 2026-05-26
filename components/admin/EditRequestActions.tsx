'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Toast } from '@/components/ui/Toast';
import { approveTransactionEdit, rejectTransactionEdit } from '@/app/actions';
import { useRouter } from 'next/navigation';

export default function EditRequestActions({ requestId }: { requestId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState<null | 'approve' | 'reject'>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const run = async (action: 'approve' | 'reject') => {
    setLoading(action);
    try {
      const res = action === 'approve'
        ? await approveTransactionEdit(requestId)
        : await rejectTransactionEdit(requestId);
      if (res.success) {
        setToast({ message: action === 'approve' ? 'Edit approved.' : 'Edit rejected.', type: 'success' });
        router.refresh();
      } else {
        setToast({ message: res.message || 'Action failed.', type: 'error' });
      }
    } finally {
      setLoading(null);
    }
  };

  return (
    <>
      <div className="flex gap-2 justify-end">
        <Button
          variant="secondary"
          className="px-3 py-1 h-auto text-xs"
          onClick={() => run('approve')}
          isLoading={loading === 'approve'}
          disabled={loading !== null}
        >
          Approve
        </Button>
        <Button
          variant="danger"
          className="px-3 py-1 h-auto text-xs"
          onClick={() => run('reject')}
          isLoading={loading === 'reject'}
          disabled={loading !== null}
        >
          Reject
        </Button>
      </div>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </>
  );
}
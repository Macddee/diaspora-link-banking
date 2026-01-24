"use client";

import React from 'react';
import { Button } from '@/components/ui/Button';
import { reverseTransaction } from '@/app/actions';

export default function ReverseButton({ transactionId }: { transactionId: string }) {
  const [loading, setLoading] = React.useState(false);
  const onClick = async () => {
    if (!confirm('Reverse this transaction? This will move funds back.')) return;
    setLoading(true);
    try {
      await reverseTransaction(transactionId);
      // no-op: server action revalidates; optionally add local toast
    } finally {
      setLoading(false);
    }
  };
  return (
    <Button variant="outline" className="px-2 py-1 h-auto text-xs" onClick={onClick} isLoading={loading}>
      Reverse
    </Button>
  );
}

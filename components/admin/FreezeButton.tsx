"use client";

import React from 'react';
import { Button } from '@/components/ui/Button';
import { toggleFreezeUser } from '@/app/actions';

export default function FreezeButton({ userId, isFrozen, small = false }: { userId: string; isFrozen: boolean; small?: boolean }) {
  const [loading, setLoading] = React.useState(false);
  const onClick = async () => {
    setLoading(true);
    try {
      await toggleFreezeUser(userId);
    } finally {
      setLoading(false);
    }
  };
  return (
    <Button
      variant={isFrozen ? 'secondary' : 'danger'}
      className={small ? 'px-2 py-1 h-auto text-xs' : ''}
      onClick={onClick}
      isLoading={loading}
    >
      {isFrozen ? 'Unfreeze' : 'Freeze'}
    </Button>
  );
}

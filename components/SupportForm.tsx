
'use client';

import React, { useState } from 'react';
import { Card, CardHeader } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { submitSupportTicket } from '@/app/actions';

export const SupportForm = () => {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || !message) return;

    setIsSubmitting(true);
    await submitSupportTicket(subject, message);
    setIsSubmitting(false);
    setSubject('');
    setMessage('');
    // Note: revalidatePath in action will update the list automatically
  };

  return (
    <Card>
        <CardHeader title="New Ticket" />
        <form onSubmit={handleSubmit} className="space-y-4">
            <Input 
                label="Subject" 
                value={subject} 
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Briefly describe the issue"
            />
            <div className="space-y-1.5">
                <label className="block text-sm font-medium text-slate-700">Message</label>
                <textarea 
                    className="block w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm placeholder-slate-400 focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition-shadow shadow-sm min-h-[120px]"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Tell us what happened..."
                />
            </div>
            <Button type="submit" isLoading={isSubmitting} disabled={!subject || !message}>
                Submit Ticket
            </Button>
        </form>
    </Card>
  );
};

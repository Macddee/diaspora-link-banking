import React, { useState, useEffect } from 'react';
import { Card, CardHeader } from '../ui/Card';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { SupportTicket } from '../../types';
import { submitSupportTicket, getUserTickets } from '@/app/actions';

interface SupportViewProps {
  userId: string;
}

export const SupportView: React.FC<SupportViewProps> = ({ userId }) => {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Load initial tickets
    const fetchTickets = async () => {
        const data = await getUserTickets(userId);
        setTickets(data as any);
    };
    fetchTickets();
  }, [userId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || !message) return;

    setIsSubmitting(true);
    try {
        const result = await submitSupportTicket(subject, message);
        if (result.success && result.ticket) {
            setTickets([result.ticket as any, ...tickets]);
            setSubject('');
            setMessage('');
        }
    } finally {
        setIsSubmitting(false);
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    }).format(new Date(date));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Support Center</h2>
        <p className="text-slate-500">Need help? Submit a ticket below.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Submit Form */}
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

        {/* History List */}
        <Card className="max-h-[500px] flex flex-col" noPadding>
            <div className="p-6 border-b border-slate-100">
                <h3 className="text-lg font-semibold text-slate-900">Your Tickets</h3>
            </div>
            <div className="overflow-y-auto flex-1 p-0">
                {tickets.length === 0 ? (
                    <div className="p-6 text-center text-slate-500 text-sm">You haven't submitted any tickets yet.</div>
                ) : (
                    <div className="divide-y divide-slate-100">
                        {tickets.map((t: SupportTicket) => (
                            <div key={t.id} className="p-4 hover:bg-slate-50 transition-colors">
                                <div className="flex justify-between items-start mb-1">
                                    <h4 className="font-medium text-slate-900 text-sm">{t.subject}</h4>
                                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${t.status === 'RESOLVED' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}>
                                        {t.status}
                                    </span>
                                </div>
                                <p className="text-slate-600 text-xs mb-2 line-clamp-2">{t.message}</p>
                                <p className="text-slate-400 text-[10px]">{formatDate(t.createdAt)}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </Card>
      </div>
    </div>
  );
};
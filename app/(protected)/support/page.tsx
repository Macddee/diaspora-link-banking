
import { getDbUser } from '@/app/actions';
import db from '@/lib/prisma';
import { Card, CardHeader } from '@/components/ui/Card';
import { SupportForm } from '@/components/SupportForm';

export default async function SupportPage() {
  const user = await getDbUser();
  if (!user) return null;

  const tickets = await db.supportTicket.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Support Center</h2>
        <p className="text-slate-500">Need help? Submit a ticket below.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Client Side Form Component */}
        <SupportForm />

        {/* Server Side Ticket List */}
        <Card className="max-h-[500px] flex flex-col" noPadding>
            <div className="p-6 border-b border-slate-100">
                <h3 className="text-lg font-semibold text-slate-900">Your Tickets</h3>
            </div>
            <div className="overflow-y-auto flex-1 p-0">
                {tickets.length === 0 ? (
                    <div className="p-6 text-center text-slate-500 text-sm">You haven't submitted any tickets yet.</div>
                ) : (
                    <div className="divide-y divide-slate-100">
                        {tickets.map((t: typeof tickets[0]) => (
                            <div key={t.id} className="p-4 hover:bg-slate-50 transition-colors">
                                <div className="flex justify-between items-start mb-1">
                                    <h4 className="font-medium text-slate-900 text-sm">{t.subject}</h4>
                                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${t.status === 'RESOLVED' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}>
                                        {t.status}
                                    </span>
                                </div>
                                <p className="text-slate-600 text-xs mb-2 line-clamp-2">{t.message}</p>
                                <p className="text-slate-400 text-[10px]">{t.createdAt.toLocaleDateString()}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </Card>
      </div>
    </div>
  );
}

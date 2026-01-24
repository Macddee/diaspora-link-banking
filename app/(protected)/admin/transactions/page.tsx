import { getDbUser, getAllTransactions } from '@/app/actions';
import ReverseButton from '@/components/admin/ReverseButton';
import { Card } from '@/components/ui/Card';
import { redirect } from 'next/navigation';

export const revalidate = 0;

export default async function AdminTransactionsPage() {
  const user = await getDbUser();
  if (!user || user.role !== 'admin') redirect('/dashboard');

  const txs = await getAllTransactions();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Transaction History</h1>
      </div>

      <Card noPadding>
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-6 py-3">Sender</th>
                <th className="px-6 py-3">Receiver</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3 text-right">Amount</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {txs.map(t => (
                <tr key={t.id}>
                  <td className="px-6 py-4">{t.senderEmail}</td>
                  <td className="px-6 py-4">{t.receiverEmail}</td>
                  <td className="px-6 py-4">{t.status}</td>
                  <td className="px-6 py-4 text-right font-bold">${t.amount.toFixed(2)}</td>
                  <td className="px-6 py-4 text-right">
                    {t.status === 'COMPLETED' && <ReverseButton transactionId={t.id} />}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <div className="md:hidden divide-y divide-slate-100">
          {txs.map(t => (
            <div key={t.id} className="p-4 space-y-2">
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium text-slate-900 truncate">{t.senderEmail}</div>
                <div className="text-lg font-bold">${t.amount.toFixed(2)}</div>
              </div>
              <div className="text-xs text-slate-500 truncate">→ {t.receiverEmail}</div>
              <div className="flex items-center justify-between">
                <span className={`px-2 py-1 rounded-full text-xs font-bold ${t.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'}`}>{t.status}</span>
                {t.status === 'COMPLETED' && <ReverseButton transactionId={t.id} />}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

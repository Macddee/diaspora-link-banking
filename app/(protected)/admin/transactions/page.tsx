import { getDbUser, getAllTransactions, getPendingEditRequests } from '@/app/actions';
import ReverseButton from '@/components/admin/ReverseButton';
import EditRequestActions from '@/components/admin/EditRequestActions';
import { Card } from '@/components/ui/Card';
import { redirect } from 'next/navigation';

export const revalidate = 0;

export default async function AdminTransactionsPage() {
  const user = await getDbUser();
  if (!user || user.role !== 'admin') redirect('/dashboard');

  const [txs, editRequests] = await Promise.all([
    getAllTransactions(),
    getPendingEditRequests(),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Transaction History</h1>
      </div>

      {editRequests.length > 0 && (
        <Card noPadding>
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Pending Edit Requests</h2>
              <p className="text-xs text-slate-500 mt-1">
                Funds for these transactions are on hold until you approve or reject the edit.
              </p>
            </div>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
              {editRequests.length} pending
            </span>
          </div>

          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="px-6 py-3">Sender</th>
                  <th className="px-6 py-3">Original</th>
                  <th className="px-6 py-3">Requested</th>
                  <th className="px-6 py-3">Reason</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {editRequests.map((r) => (
                  <tr key={r.id}>
                    <td className="px-6 py-4">{r.originalSenderEmail}</td>
                    <td className="px-6 py-4 text-slate-600">
                      <div>${r.originalAmount.toFixed(2)}</div>
                      <div className="text-xs text-slate-400">to {r.originalReceiverEmail}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-900">${r.newAmount.toFixed(2)}</div>
                      <div className="text-xs text-slate-500">to {r.newReceiverEmail}</div>
                    </td>
                    <td className="px-6 py-4 text-slate-600 max-w-xs truncate">{r.reason || '—'}</td>
                    <td className="px-6 py-4 text-right">
                      <EditRequestActions requestId={r.id} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="md:hidden divide-y divide-slate-100">
            {editRequests.map((r) => (
              <div key={r.id} className="p-4 space-y-2">
                <div className="text-sm font-semibold text-slate-900 truncate">{r.originalSenderEmail}</div>
                <div className="text-xs text-slate-500">
                  Was <span className="font-medium text-slate-700">${r.originalAmount.toFixed(2)}</span> to {r.originalReceiverEmail}
                </div>
                <div className="text-xs text-slate-700">
                  Now <span className="font-semibold">${r.newAmount.toFixed(2)}</span> to {r.newReceiverEmail}
                </div>
                {r.reason && <div className="text-xs text-slate-500 italic">“{r.reason}”</div>}
                <EditRequestActions requestId={r.id} />
              </div>
            ))}
          </div>
        </Card>
      )}

      <Card noPadding>
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-6 py-3">Sender</th>
                <th className="px-6 py-3">Receiver</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3 text-right">Amount</th>
                <th className="px-6 py-3 text-right">Fee</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {txs.map((t: typeof txs[0]) => (
                <tr key={t.id}>
                  <td className="px-6 py-4">{t.senderEmail}</td>
                  <td className="px-6 py-4">{t.receiverEmail}</td>
                  <td className="px-6 py-4">{t.status}</td>
                  <td className="px-6 py-4 text-right font-bold">${t.amount.toFixed(2)}</td>
                  <td className="px-6 py-4 text-right text-slate-500">${(t.fee ?? 0).toFixed(2)}</td>
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
          {txs.map((t: typeof txs[0]) => (
            <div key={t.id} className="p-4 space-y-2">
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium text-slate-900 truncate">{t.senderEmail}</div>
                <div className="text-lg font-bold">${t.amount.toFixed(2)}</div>
              </div>
              <div className="text-xs text-slate-500 truncate">→ {t.receiverEmail}</div>
              <div className="text-xs text-slate-400">Fee: ${(t.fee ?? 0).toFixed(2)}</div>
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

export const revalidate = 0;

import { getDbUser } from '@/app/actions';
import { Card } from '@/components/ui/Card';
import db from '@/lib/prisma';
import Link from 'next/link';

export default async function DashboardPage() {
  const user = await getDbUser();
  if (!user) return null;

  // Fetch fresh account data directly to ensure monthly fields are included
  const account = await db.account.findFirst({
    where: { userId: user.id },
  });

  const transactions = await db.transaction.findMany({
    where: {
      OR: [{ senderId: user.id }, { receiverId: user.id }]
    },
    orderBy: { createdAt: 'desc' },
    take: 5,
    include: { sender: true, receiver: true }
  });

  const balance = account?.balance || 0;
  const monthlyIn = account?.monthlyIn || 0;
  const monthlyOut = account?.monthlyOut || 0;

  return (
    <>
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="bg-slate-900 text-white border-none relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white opacity-10 rounded-full blur-xl"></div>
          <div className="relative z-10">
              <p className="text-slate-400 text-sm font-medium mb-1">Total Balance</p>
              <div className="text-3xl font-semibold text-blue-500 bg">
                  ${(balance || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className="mt-4 flex items-center gap-2 text-xs text-slate-400">
                  <span className={`inline-block w-2 h-2 rounded-full ${user.isFrozen ? 'bg-red-500' : 'bg-emerald-500'}`}></span>
                  {user.isFrozen ? 'Account Frozen' : 'Active Account'}
              </div>
          </div>
        </Card>
        <Card>
          <p className="text-slate-500 text-sm font-medium mb-1">Monthly In</p>
          <div className="text-2xl font-semibold text-emerald-600">+${monthlyIn.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
        </Card>
        <Card>
          <p className="text-slate-500 text-sm font-medium mb-1">Monthly Out</p>
          <div className="text-2xl font-semibold text-slate-900">-${monthlyOut.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Recent Activity</h3>
            <Card noPadding>
              {/* Desktop table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-slate-500">
                    <tr>
                      <th className="px-6 py-3">User</th>
                      <th className="px-6 py-3">Status</th>
                      <th className="px-6 py-3 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {transactions.map(tx => {
                      const isReceived = tx.receiverId === user.id;
                      return (
                        <tr key={tx.id}>
                          <td className="px-6 py-4">
                            {isReceived ? tx.sender.email : tx.receiver.email}
                          </td>
                          <td className="px-6 py-4">{tx.status}</td>
                          <td className={`px-6 py-4 text-right font-bold ${isReceived ? 'text-emerald-600' : 'text-slate-900'}`}>
                            {isReceived ? '+' : '-'}${tx.amount.toFixed(2)}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div className="md:hidden divide-y divide-slate-100">
                {transactions.map(tx => {
                const isReceived = tx.receiverId === user.id;
                return (
                  <div key={tx.id} className="p-4 space-y-2">
                  <div className="flex items-center justify-between text-sm text-slate-700">
                    <span className="font-semibold text-slate-900">{isReceived ? tx.sender.email : tx.receiver.email}</span>
                    <span className={`text-xs px-2 py-1 rounded-full ${isReceived ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-700'}`}>
                    {tx.status}
                    </span>
                  </div>
                  <div className={`text-lg font-bold ${isReceived ? 'text-emerald-600' : 'text-slate-900'}`}>
                    {isReceived ? '+' : '-'}${tx.amount.toFixed(2)}
                  </div>
                  </div>
                );
                })}
              </div>
            </Card>
        </div>
        <div>
            <div className="p-6 bg-blue-50 rounded-xl border border-blue-100 text-center">
                <h4 className="text-blue-900 font-bold mb-2">Quick Transfer</h4>
                <p className="text-sm text-blue-800 mb-4">Send money instantly to anyone.</p>
                <Link href="/transfers" className="inline-block w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
                    Go to Transfers
                </Link>
            </div>
        </div>
      </div>
    </>
  );
}

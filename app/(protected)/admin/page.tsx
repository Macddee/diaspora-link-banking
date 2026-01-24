import { getDbUser } from '@/app/actions';
import db from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import FreezeButton from '@/components/admin/FreezeButton';
// We would implement client-side buttons (Freeze/Verify) in a separate Client Component 
// for full interactivity, but for this demo structure, we display data.

export default async function AdminPage() {
  const user = await getDbUser();
  if (!user || user.role !== 'admin') redirect('/dashboard');

  const totalUsers = await db.user.count();
  const accounts = await db.account.aggregate({ _sum: { balance: true }});
  const openTickets = await db.supportTicket.count({ where: { status: 'OPEN' }});
  const users = await db.user.findMany({ take: 20, orderBy: { createdAt: 'desc' }});

  return (
    <div className="space-y-6">
        <h1 className="text-2xl font-bold text-slate-900">Admin Portal</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6">
                <p className="text-sm font-medium text-slate-500">Total Users</p>
                <p className="text-3xl font-bold text-slate-900">{totalUsers}</p>
            </Card>
            <Card className="p-6">
                <p className="text-sm font-medium text-slate-500">System Funds</p>
                <p className="text-3xl font-bold text-emerald-600">${accounts._sum.balance?.toFixed(2) || '0.00'}</p>
            </Card>
            <Card className="p-6">
                <p className="text-sm font-medium text-slate-500">Open Tickets</p>
                <p className="text-3xl font-bold text-orange-600">{openTickets}</p>
            </Card>
        </div>

        <Card noPadding>
            <div className="p-4 border-b border-slate-100 font-semibold text-slate-900">User Management</div>

            {/* Desktop table */}
            <div className="hidden md:block">
              <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-slate-500">
                      <tr>
                          <th className="px-6 py-3">Email</th>
                          <th className="px-6 py-3">Role</th>
                          <th className="px-6 py-3">Frozen?</th>
                          <th className="px-6 py-3">KYC</th>
                          <th className="px-6 py-3 text-right">Actions</th>
                      </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                      {users.map((u: { id: string; email: string; role: string; isFrozen: boolean; kycStatus: string; }) => (
                          <tr key={u.id}>
                              <td className="px-6 py-4">{u.email}</td>
                              <td className="px-6 py-4">{u.role}</td>
                              <td className="px-6 py-4 text-red-500 font-medium">{u.isFrozen ? 'Yes' : ''}</td>
                              <td className="px-6 py-4">{u.kycStatus}</td>
                              <td className="px-6 py-4 text-right">
                                {u.role !== 'admin' && (
                                  <FreezeButton userId={u.id} isFrozen={!!u.isFrozen} />
                                )}
                              </td>
                          </tr>
                      ))}
                  </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden divide-y divide-slate-100">
              {users.map((u: { id: string; email: string; role: string; isFrozen: boolean; kycStatus: string; }) => (
                <div key={u.id} className="p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="font-semibold text-slate-900 text-sm leading-tight">{u.email}</div>
                    <span className="text-xs px-2 py-1 rounded-full bg-slate-100 text-slate-700">{u.role}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-slate-600">
                    <span>KYC: {u.kycStatus}</span>
                    <div className="flex items-center gap-2">
                      {u.isFrozen && <span className="text-red-500 font-semibold">Frozen</span>}
                      {u.role !== 'admin' && (
                        <FreezeButton userId={u.id} isFrozen={!!u.isFrozen} small />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
        </Card>
    </div>
  );
}

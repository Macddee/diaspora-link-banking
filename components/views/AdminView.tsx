import React, { useState, useEffect } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { User, SupportTicket, Transaction } from '../../types';
import { getAllUsers, getSystemStats, getAllTickets, getAllTransactions, toggleFreezeUser, verifyUserKyc, resolveTicket } from '@/app/actions';

export const AdminView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'tickets'>('overview');
  
  // Data State
  const [stats, setStats] = useState({ totalUsers: 0, totalMoney: 0, openTickets: 0 });
  const [users, setUsers] = useState<User[]>([]);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Actions Loading State
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    const s = await getSystemStats();
    const u = await getAllUsers();
    const t = await getAllTickets();
    const tx = await getAllTransactions();
    setStats(s);
    setUsers(u as any);
    setTickets(t as any);
    setTransactions(tx as any);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleFreeze = async (userId: string) => {
    setProcessingId(userId);
    await toggleFreezeUser(userId);
    setUsers(await getAllUsers() as any); // Refresh
    setProcessingId(null);
  };

  const handleVerify = async (userId: string) => {
    setProcessingId(userId);
    await verifyUserKyc(userId);
    setUsers(await getAllUsers() as any); // Refresh
    setProcessingId(null);
  };

  const handleResolve = async (ticketId: string) => {
    setProcessingId(ticketId);
    await resolveTicket(ticketId);
    setTickets(await getAllTickets() as any); // Refresh
    setStats(await getSystemStats()); // Refresh count
    setProcessingId(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-900">Admin Portal</h2>
        <div className="flex bg-slate-200 p-1 rounded-lg">
            {(['overview', 'users', 'tickets'] as const).map(tab => (
                <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-1.5 text-sm font-medium rounded-md capitalize transition-all ${
                        activeTab === tab ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                    }`}
                >
                    {tab}
                </button>
            ))}
        </div>
      </div>

      {isLoading ? (
          <div className="text-center py-10 text-slate-500">Loading admin data...</div>
      ) : (
        <>
            {/* OVERVIEW TAB */}
            {activeTab === 'overview' && (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Card className="p-6">
                            <p className="text-sm font-medium text-slate-500">Total Users</p>
                            <p className="text-3xl font-bold text-slate-900">{stats.totalUsers}</p>
                        </Card>
                        <Card className="p-6">
                            <p className="text-sm font-medium text-slate-500">System Funds</p>
                            <p className="text-3xl font-bold text-emerald-600">${stats.totalMoney.toFixed(2)}</p>
                        </Card>
                        <Card className="p-6">
                            <p className="text-sm font-medium text-slate-500">Open Tickets</p>
                            <p className="text-3xl font-bold text-orange-600">{stats.openTickets}</p>
                        </Card>
                    </div>

                    <Card noPadding>
                        <div className="p-4 border-b border-slate-100 font-semibold text-slate-900">Recent System Activity</div>
                        <div className="max-h-[400px] overflow-y-auto">
                            {/* Desktop table */}
                            <div className="hidden md:block">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-slate-50 text-slate-500">
                                        <tr>
                                            <th className="px-4 py-2">ID</th>
                                            <th className="px-4 py-2">Sender</th>
                                            <th className="px-4 py-2">Receiver</th>
                                            <th className="px-4 py-2 text-right">Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {transactions.slice(0, 10).map((tx: Transaction) => (
                                            <tr key={tx.id}>
                                                <td className="px-4 py-2 font-mono text-xs text-slate-400">{tx.id}</td>
                                                <td className="px-4 py-2">{tx.senderEmail}</td>
                                                <td className="px-4 py-2">{tx.receiverEmail}</td>
                                                <td className="px-4 py-2 text-right font-medium">${tx.amount.toFixed(2)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Mobile cards */}
                            <div className="md:hidden divide-y divide-slate-100">
                                {transactions.slice(0, 10).map((tx: Transaction) => (
                                    <div key={tx.id} className="p-4 space-y-1">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-medium text-slate-900 truncate max-w-[50%]">{tx.senderEmail}</span>
                                            <span className="text-lg font-bold text-slate-900">${tx.amount.toFixed(2)}</span>
                                        </div>
                                        <div className="text-xs text-slate-500">→ {tx.receiverEmail}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </Card>
                </div>
            )}

            {/* USERS TAB */}
            {activeTab === 'users' && (
                <Card noPadding>
                    {/* Desktop table */}
                    <div className="hidden md:block overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 text-slate-500 font-medium">
                                <tr>
                                    <th className="px-6 py-3">User</th>
                                    <th className="px-6 py-3">Role</th>
                                    <th className="px-6 py-3">KYC Status</th>
                                    <th className="px-6 py-3">Status</th>
                                    <th className="px-6 py-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {users.map((u: User) => (
                                    <tr key={u.id} className="hover:bg-slate-50">
                                        <td className="px-6 py-4">
                                            <div>
                                                <div className="font-medium text-slate-900">{u.name}</div>
                                                <div className="text-xs text-slate-500">{u.email}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 capitalize">{u.role}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${u.kycStatus === 'VERIFIED' ? 'bg-emerald-100 text-emerald-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                                {u.kycStatus}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {u.isFrozen ? (
                                                <span className="text-red-600 font-medium flex items-center gap-1">
                                                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z" clipRule="evenodd" /></svg>
                                                    Frozen
                                                </span>
                                            ) : (
                                                <span className="text-emerald-600 font-medium">Active</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right space-x-2">
                                            {u.kycStatus === 'PENDING' && (
                                                <Button 
                                                    variant="outline" 
                                                    className="px-2 py-1 h-auto text-xs"
                                                    onClick={() => handleVerify(u.id)}
                                                    isLoading={processingId === u.id}
                                                >
                                                    Verify KYC
                                                </Button>
                                            )}
                                            {u.role !== 'admin' && (
                                                <Button 
                                                    variant={u.isFrozen ? 'secondary' : 'danger'} 
                                                    className="px-2 py-1 h-auto text-xs"
                                                    onClick={() => handleFreeze(u.id)}
                                                    isLoading={processingId === u.id}
                                                >
                                                    {u.isFrozen ? 'Unfreeze' : 'Freeze'}
                                                </Button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile cards */}
                    <div className="md:hidden divide-y divide-slate-100">
                        {users.map((u: User) => (
                            <div key={u.id} className="p-4 space-y-3">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <div className="font-medium text-slate-900">{u.name}</div>
                                        <div className="text-xs text-slate-500">{u.email}</div>
                                    </div>
                                    <span className="text-xs px-2 py-1 rounded-full bg-slate-100 text-slate-700 capitalize">{u.role}</span>
                                </div>
                                <div className="flex items-center gap-2 flex-wrap">
                                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${u.kycStatus === 'VERIFIED' ? 'bg-emerald-100 text-emerald-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                        {u.kycStatus}
                                    </span>
                                    {u.isFrozen ? (
                                        <span className="text-red-600 text-xs font-medium flex items-center gap-1">
                                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z" clipRule="evenodd" /></svg>
                                            Frozen
                                        </span>
                                    ) : (
                                        <span className="text-emerald-600 text-xs font-medium">Active</span>
                                    )}
                                </div>
                                <div className="flex gap-2">
                                    {u.kycStatus === 'PENDING' && (
                                        <Button 
                                            variant="outline" 
                                            className="px-2 py-1 h-auto text-xs flex-1"
                                            onClick={() => handleVerify(u.id)}
                                            isLoading={processingId === u.id}
                                        >
                                            Verify KYC
                                        </Button>
                                    )}
                                    {u.role !== 'admin' && (
                                        <Button 
                                            variant={u.isFrozen ? 'secondary' : 'danger'} 
                                            className="px-2 py-1 h-auto text-xs flex-1"
                                            onClick={() => handleFreeze(u.id)}
                                            isLoading={processingId === u.id}
                                        >
                                            {u.isFrozen ? 'Unfreeze' : 'Freeze'}
                                        </Button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            )}

            {/* TICKETS TAB */}
            {activeTab === 'tickets' && (
                <div className="space-y-4">
                    {tickets.length === 0 && <p className="text-slate-500">No support tickets found.</p>}
                    {tickets.map((t: SupportTicket) => (
                        <Card key={t.id} className="p-4">
                            <div className="flex justify-between items-start">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${t.status === 'OPEN' ? 'bg-orange-100 text-orange-700' : 'bg-slate-100 text-slate-600'}`}>
                                            {t.status}
                                        </span>
                                        <span className="text-xs text-slate-400">
                                            {new Date(t.createdAt).toLocaleString()}
                                        </span>
                                        <span className="text-xs text-slate-500 font-medium ml-2">
                                            From: {t.userEmail}
                                        </span>
                                    </div>
                                    <h3 className="text-md font-bold text-slate-900">{t.subject}</h3>
                                    <p className="text-slate-600 text-sm mt-1">{t.message}</p>
                                </div>
                                {t.status === 'OPEN' && (
                                    <Button 
                                        variant="outline" 
                                        className="text-xs"
                                        onClick={() => handleResolve(t.id)}
                                        isLoading={processingId === t.id}
                                    >
                                        Mark Resolved
                                    </Button>
                                )}
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </>
      )}
    </div>
  );
};
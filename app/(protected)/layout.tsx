export const revalidate = 0;

import React from 'react';
import Sidebar from '@/components/Sidebar';
import MobileNav from '@/components/MobileNav';
import { getDbUser } from '@/app/actions';
import db from '@/lib/prisma';
import { redirect } from 'next/navigation';

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getDbUser();
  
  // If user exists in Clerk but not in DB, you might need a sync mechanism.
  // For now, we assume they exist or redirect.
  if (!user) {
    // Ideally redirect to an onboarding page or sync api
    redirect('/'); 
  }

  // Admin transactions badge: recent transactions in the last 24h
  let adminTxCount = 0;
  if (user.role === 'admin') {
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
    adminTxCount = await db.transaction.count({ where: { createdAt: { gte: since } } });
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar 
        userRole={user.role} 
        userName={user.name} 
        userEmail={user.email}
        className="hidden md:flex"
        adminTxCount={adminTxCount}
      />
      <main className="flex-1 md:ml-64 p-4 md:p-8 pb-20 md:pb-8">
        {children}
      </main>
      <MobileNav userRole={user.role} adminTxCount={adminTxCount} />
    </div>
  );
}

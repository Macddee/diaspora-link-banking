
import React from 'react';
import Sidebar from '@/components/Sidebar';
import { getDbUser } from '@/app/actions';
import { redirect } from 'next/navigation';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getDbUser();
  if (!user) redirect('/'); // Redirect to login if not found

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar 
        userRole={user.role} 
        userName={user.name} 
        userEmail={user.email} 
      />
      <main className="flex-1 ml-64 p-8">
        {children}
      </main>
    </div>
  );
}

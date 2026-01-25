
'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { SignOutButton } from '@clerk/nextjs';
import clsx from 'clsx';

interface SidebarProps {
  userRole?: string; // 'admin' | 'user'
  userName?: string | null;
  userEmail?: string | null;
  className?: string;
  adminTxCount?: number;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  userRole = 'user', 
  userName, 
  userEmail,
  className,
  adminTxCount = 0,
}) => {
  const pathname = usePathname();

  const menuItems = [
    { 
      label: 'Dashboard', 
      href: '/dashboard', 
      allowedRoles: ['user'],
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      )
    },
    { 
      label: 'Transfers', 
      href: '/transfers', 
      allowedRoles: ['user'],
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
        </svg>
      )
    },
    { 
      label: 'History', 
      href: '/history', 
      allowedRoles: ['user'],
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    { 
      label: 'Support', 
      href: '/support', 
      allowedRoles: ['user'],
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      )
    },
    { 
      label: 'Admin Portal', 
      href: '/admin', 
      allowedRoles: ['admin'],
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      )
    },
    { 
      label: 'Transactions', 
      href: '/admin/transactions', 
      allowedRoles: ['admin'],
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h11M3 6h11M3 14h7m8-7v10a2 2 0 01-2 2H8a2 2 0 01-2-2V7a2 2 0 012-2h10a2 2 0 012 2z" />
        </svg>
      )
    },
    { 
      label: 'Profile', 
      href: '/profile', 
      allowedRoles: ['user', 'admin'],
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      )
    },
  ];

  return (
    <aside className={clsx("fixed left-0 top-0 h-full w-64 bg-slate-900 text-white flex flex-col z-20", className)}>
      <div className="p-6 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Image 
            src="/app-image.png" 
            alt="DiasporaLink Logo" 
            width={32} 
            height={32} 
            className="rounded-lg"
          />
          <span className="text-xl font-bold tracking-tight">DiasporaLink</span>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {menuItems.map((item) => {
            if (userRole && !item.allowedRoles.includes(userRole)) return null;
            
            const isActive = pathname.startsWith(item.href);

            return (
                <Link
                    key={item.label}
                    href={item.href}
                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                        ? 'bg-slate-800 text-white' 
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                    }`}
                >
                    {item.icon}
                    <span className="relative inline-flex items-center gap-2">
                      <span>{item.label}</span>
                      {item.label === 'Transactions' && userRole === 'admin' && adminTxCount > 0 && (
                        <span className="ml-1 inline-flex items-center justify-center text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-600 text-white">
                          {adminTxCount > 99 ? '99+' : adminTxCount}
                        </span>
                      )}
                    </span>
                </Link>
            )
        })}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-sm font-bold text-slate-300">
            {userName?.charAt(0) || 'U'}
          </div>
          <div className="flex-1 min-w-0 text-left">
            <p className="text-sm font-medium text-white truncate">{userName}</p>
            <p className="text-xs text-slate-500 truncate">{userEmail}</p>
          </div>
        </div>
        <SignOutButton>
          <button className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800/50 transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Sign Out
          </button>
        </SignOutButton>
      </div>
    </aside>
  );
};

export default Sidebar;

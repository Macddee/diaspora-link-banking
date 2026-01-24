"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SignOutButton } from "@clerk/nextjs";

interface MobileNavProps {
  userRole?: string;
  adminTxCount?: number;
}

const items = [
  { label: "Home", href: "/dashboard", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" , roles: ["user","admin"]},
  { label: "Transfers", href: "/transfers", icon: "M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4", roles: ["user"] },
  { label: "History", href: "/history", icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z", roles: ["user"] },
  { label: "Support", href: "/support", icon: "M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z", roles: ["user"] },
  { label: "Admin", href: "/admin", icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z", roles: ["admin"] },
  { label: "Txns", href: "/admin/transactions", icon: "M3 10h11M3 6h11M3 14h7m8-7v10a2 2 0 01-2 2H8a2 2 0 01-2-2V7a2 2 0 012-2h10a2 2 0 012 2z", roles: ["admin"] },
];

export default function MobileNav({ userRole = "user", adminTxCount = 0 }: MobileNavProps) {
  const pathname = usePathname();
  const visibleItems = items.filter(i => i.roles.includes(userRole));

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur shadow-[0_-4px_24px_rgba(0,0,0,0.08)] border-t border-slate-200 md:hidden">
      <div className="flex items-center justify-around">
        {visibleItems.map((item) => {
          const active = pathname.startsWith(item.href);
          return (
            <Link key={item.href} href={item.href} className="relative flex flex-col items-center justify-center gap-1 py-3 text-xs font-medium">
              <svg className={`w-5 h-5 ${active ? "text-emerald-600" : "text-slate-500"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
              </svg>
              <span className={active ? "text-emerald-600" : "text-slate-600"}>{item.label}</span>
              {item.href === '/admin/transactions' && userRole === 'admin' && adminTxCount > 0 && (
                <span className="absolute -top-1 -right-2 inline-flex items-center justify-center text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-600 text-white">
                  {adminTxCount > 99 ? '99+' : adminTxCount}
                </span>
              )}
            </Link>
          );
        })}

        {/* Sign out control */}
        <SignOutButton>
          <button className="flex flex-col items-center justify-center gap-1 py-3 text-xs font-medium text-slate-600 hover:text-red-600">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span>Sign out</span>
          </button>
        </SignOutButton>
      </div>
    </nav>
  );
}

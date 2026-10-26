"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { getAuth, clearAuth } from "@/lib/auth";
import { getResolvedMember } from "@/lib/store";
import type { Member } from "@/lib/data";
import BrandLogo from "@/components/BrandLogo";
import { LayoutDashboard, MessageCircle, Users, UserCircle, LogOut, Menu, X } from "lucide-react";

const NAV = [
  { href: "/dashboard", label: "My Forums", icon: LayoutDashboard },
  { href: "/directory", label: "Directory", icon: Users },
  { href: "/member-exchange", label: "Member Exchange", icon: MessageCircle },
  { href: "/profile", label: "My Profile", icon: UserCircle },
];

function SidebarContent({ member, pathname, onNavigate, onSignOut }: { member: Member; pathname: string; onNavigate: () => void; onSignOut: () => void }) {
  return (
    <div className="flex flex-col h-full">
      <div className="px-6 py-6 border-b border-white/8">
        <BrandLogo className="w-36" />
      </div>
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
          return <Link key={href} href={href} onClick={onNavigate} className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all ${active ? "bg-white/10 text-cream" : "text-white/50 hover:text-white/80 hover:bg-white/5"}`}><Icon className={`w-4 h-4 flex-shrink-0 ${active ? "text-gold" : ""}`} />{label}</Link>;
        })}
      </nav>
      <div className="px-4 py-4 border-t border-white/8">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 bg-[#B17E6B]/20">
            {member.photo ? <img src={member.photo} alt={member.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><span className="text-gold text-xs font-semibold">{member.name.split(" ").map((name: string) => name[0]).join("").slice(0, 2)}</span></div>}
          </div>
          <div className="min-w-0"><p className="text-cream text-xs font-medium truncate">{member.name}</p><p className="text-white/35 text-[11px] truncate">{member.organization}</p></div>
        </div>
        <button onClick={onSignOut} className="flex items-center gap-2 text-white/35 hover:text-white/60 text-xs transition-colors"><LogOut className="w-3.5 h-3.5" />Sign out</button>
      </div>
    </div>
  );
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [member, setMember] = useState<Member | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    queueMicrotask(() => {
      if (cancelled) return;
      const auth = getAuth();
      if (!auth) { router.replace("/"); return; }
      if (auth.role === "assistant") { router.replace("/assistant-dashboard"); return; }
      const resolvedMember = getResolvedMember(auth.memberId);
      if (resolvedMember) setMember(resolvedMember);
    });
    return () => { cancelled = true; };
  }, [router, pathname]);

  function handleSignOut() {
    clearAuth();
    router.push("/");
  }

  if (!member) return null;

  return (
    <div className="min-h-screen flex bg-background">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-56 flex-col flex-shrink-0 bg-navy fixed inset-y-0 left-0 z-30">
        <SidebarContent member={member} pathname={pathname} onNavigate={() => setMobileOpen(false)} onSignOut={handleSignOut} />
      </aside>

      {/* Mobile header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-navy border-b border-white/10 flex items-center justify-between px-4 py-3">
        <BrandLogo className="w-32" />
        <button onClick={() => setMobileOpen(!mobileOpen)} className="text-white/60 hover:text-cream">
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile sidebar */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-30 bg-navy pt-14">
          <SidebarContent member={member} pathname={pathname} onNavigate={() => setMobileOpen(false)} onSignOut={handleSignOut} />
        </div>
      )}

      {/* Main content */}
      <main className="min-w-0 w-full flex-1 md:ml-56 pt-16 md:pt-0 min-h-screen">
        {children}
      </main>
    </div>
  );
}

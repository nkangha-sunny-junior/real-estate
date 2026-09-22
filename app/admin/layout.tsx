"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Users, FileText, Wallet, LogOut, LayoutDashboard, Menu, X, Handshake, TrendingUp, MapPin, UserCog, Receipt } from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [checking, setChecking] = useState(true);
  const [authed, setAuthed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session && pathname !== "/admin/login") router.push("/admin/login");
      setAuthed(!!data.session);
      setChecking(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_e, session) => {
      if (!session && pathname !== "/admin/login") router.push("/admin/login");
      setAuthed(!!session);
    });

    return () => listener.subscription.unsubscribe();
  }, [pathname, router]);

  // Close the mobile drawer automatically whenever you navigate to a
  // different page — otherwise it'd stay open after tapping a link.
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  if (pathname === "/admin/login") return <>{children}</>;

  if (checking) {
    return (
      <main className="min-h-screen bg-[#0A2A20] flex items-center justify-center">
        <p className="text-[#F3EFE3]/60">Chargement...</p>
      </main>
    );
  }

  if (!authed) return null;

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/admin/login");
  }

  return (
    <div className="min-h-screen bg-[#0A2A20] md:flex">
      {/* Mobile-only top bar with hamburger button — hidden on md and up,
          where the sidebar is always visible instead */}
      <div className="md:hidden flex items-center justify-between px-4 py-4 border-b border-[#C9A15A]/20 print:hidden">
        <span className="text-[#C9A15A] font-bold tracking-wide">VISION-H</span>
        <button onClick={() => setMobileOpen(true)} aria-label="Menu" className="text-[#F3EFE3]">
          <Menu size={24} />
        </button>
      </div>

      {/* Dark overlay behind the drawer on mobile, tap to close */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar: on mobile it's a slide-in drawer (translate-x controls
          visibility); on md+ screens it's always visible in normal flow */}
      <aside
        className={`fixed md:static inset-y-0 left-0 w-64 bg-[#0A2A20] border-r border-[#C9A15A]/20 flex flex-col shrink-0 print:hidden z-50 transition-transform duration-200 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0`}
      >
        <div className="px-6 py-6 border-b border-[#C9A15A]/20 flex items-center justify-between">
          <div>
            <span className="text-[#C9A15A] font-bold tracking-wide">VISION-H</span>
            <p className="text-xs text-[#F3EFE3]/40 mt-0.5">Administration</p>
          </div>
          <button onClick={() => setMobileOpen(false)} className="md:hidden text-[#F3EFE3]" aria-label="Fermer">
            <X size={20} />
          </button>
        </div>
        <nav className="flex-1 px-3 py-5 space-y-1">
          <SidebarLink href="/admin" icon={<LayoutDashboard size={18} />} label="Tableau de bord" pathname={pathname} exact />
          <SidebarLink href="/admin/clients" icon={<Users size={18} />} label="Clients" pathname={pathname} />
          <SidebarLink href="/admin/contracts" icon={<FileText size={18} />} label="Contrats" pathname={pathname} />
          <SidebarLink href="/admin/payments" icon={<Wallet size={18} />} label="Paiements" pathname={pathname} />
          <SidebarLink href="/admin/protocoles" icon={<Handshake size={18} />} label="Protocoles" pathname={pathname} />
          <SidebarLink href="/admin/bilan" icon={<TrendingUp size={18} />} label="Bilan" pathname={pathname} />
          <SidebarLink href="/admin/listings" icon={<MapPin size={18} />} label="Terrains" pathname={pathname} />
          <SidebarLink href="/admin/employees" icon={<UserCog size={18} />} label="Employes" pathname={pathname} />
          <SidebarLink href="/admin/payslips" icon={<Receipt size={18} />} label="Fiches de paie" pathname={pathname} />
        </nav>
        <div className="px-3 py-5 border-t border-[#C9A15A]/20">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-[#F3EFE3]/70 hover:bg-[#C9A15A]/10 hover:text-[#C9A15A] transition-colors"
          >
            <LogOut size={18} />
            Deconnexion
          </button>
        </div>
      </aside>

      <div className="flex-1 px-4 sm:px-8 py-8 overflow-auto print:p-0 print:overflow-visible">
        {children}
      </div>
    </div>
  );
}

function SidebarLink({
  href,
  icon,
  label,
  pathname,
  exact,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  pathname: string;
  exact?: boolean;
}) {
  const active = exact ? pathname === href : pathname.startsWith(href);
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
        active
          ? "bg-[#C9A15A] text-[#0A2A20] font-medium"
          : "text-[#F3EFE3]/70 hover:bg-[#C9A15A]/10 hover:text-[#C9A15A]"
      }`}
    >
      {icon}
      {label}
    </Link>
  );
}
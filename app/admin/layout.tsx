"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Users, FileText, Wallet, LogOut, LayoutDashboard } from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [checking, setChecking] = useState(true);
  const [authed, setAuthed] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // Runs once on mount: checks if there's already a logged-in session,
  // and also subscribes to auth changes (so logging out anywhere updates this instantly)
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

  // The login page itself shouldn't be gated by this same layout
  if (pathname === "/admin/login") return <>{children}</>;

  if (checking) {
    return (
      <main className="min-h-screen bg-[#0A2A20] flex items-center justify-center">
        <p className="text-[#F3EFE3]/60">Chargement...</p>
      </main>
    );
  }

  if (!authed) return null; // redirect is already in progress

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/admin/login");
  }

  return (
    <div className="min-h-screen bg-[#0A2A20] flex">
      <aside className="w-64 border-r border-[#C9A15A]/20 flex flex-col shrink-0">
        <div className="px-6 py-6 border-b border-[#C9A15A]/20">
          <span className="text-[#C9A15A] font-bold tracking-wide">VISION-H</span>
          <p className="text-xs text-[#F3EFE3]/40 mt-0.5">Administration</p>
        </div>
        <nav className="flex-1 px-3 py-5 space-y-1">
          <SidebarLink href="/admin" icon={<LayoutDashboard size={18} />} label="Tableau de bord" pathname={pathname} exact />
          <SidebarLink href="/admin/clients" icon={<Users size={18} />} label="Clients" pathname={pathname} />
          <SidebarLink href="/admin/contracts" icon={<FileText size={18} />} label="Contrats" pathname={pathname} />
          <SidebarLink href="/admin/payments" icon={<Wallet size={18} />} label="Paiements" pathname={pathname} />
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
      <div className="flex-1 px-8 py-8 overflow-auto">{children}</div>
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

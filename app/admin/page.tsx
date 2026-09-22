"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Users, MapPin, FileText, Wallet, TrendingUp, AlertCircle, UserCog } from "lucide-react";
import { supabase } from "@/lib/supabase";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

interface Client {
  id: string;
  full_name: string;
  total_price: number | null;
}

interface Payment {
  id: string;
  client_id: string | null;
  amount: number;
  payment_date: string;
  method: string;
  clients: { full_name: string } | null;
}

interface Payslip {
  id: string;
  month: string;
  net_pay: number;
}

const GOLD = "#C9A15A";
const GOLD_LIGHT = "#E4C989";
const CREAM = "#F3EFE3";
const GREEN_MID = "#1B5A42";
const METHOD_COLORS: Record<string, string> = {
  cash: GOLD,
  mobile_money: GREEN_MID,
  bank_transfer: GOLD_LIGHT,
};
const METHOD_LABELS: Record<string, string> = {
  cash: "Espèces",
  mobile_money: "Mobile Money",
  bank_transfer: "Virement",
};
const MONTH_SHORT = ["Jan", "Fev", "Mar", "Avr", "Mai", "Jun", "Jul", "Aou", "Sep", "Oct", "Nov", "Dec"];

export default function AdminHomePage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [payslips, setPayslips] = useState<Payslip[]>([]);
  const [listingsCount, setListingsCount] = useState(0);
  const [employeesCount, setEmployeesCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data: clientsData } = await supabase.from("clients").select("id, full_name, total_price");
      setClients((clientsData as Client[]) ?? []);

      const { data: paymentsData } = await supabase
        .from("payments")
        .select("id, client_id, amount, payment_date, method, clients(full_name)")
        .order("payment_date", { ascending: false });
      setPayments((paymentsData as unknown as Payment[]) ?? []);

      const { data: payslipsData } = await supabase.from("payslips").select("id, month, net_pay");
      setPayslips((payslipsData as Payslip[]) ?? []);

      const { count: listingsCnt } = await supabase.from("listings").select("*", { count: "exact", head: true });
      setListingsCount(listingsCnt ?? 0);

      const { count: employeesCnt } = await supabase.from("employees").select("*", { count: "exact", head: true });
      setEmployeesCount(employeesCnt ?? 0);

      setLoading(false);
    }
    load();
  }, []);

  function totalPaidByClient(clientId: string) {
    return payments.filter((p) => p.client_id === clientId).reduce((sum, p) => sum + Number(p.amount), 0);
  }

  const thisMonth = new Date().toISOString().slice(0, 7);
  const revenueThisMonth = payments
    .filter((p) => p.payment_date?.startsWith(thisMonth))
    .reduce((sum, p) => sum + Number(p.amount), 0);

  const payrollThisMonth = payslips
    .filter((p) => p.month === thisMonth)
    .reduce((sum, p) => sum + Number(p.net_pay), 0);

  const totalOutstanding = clients
    .filter((c) => c.total_price !== null)
    .reduce((sum, c) => sum + Math.max(0, (c.total_price ?? 0) - totalPaidByClient(c.id)), 0);

  const clientsWithBalance = clients
    .filter((c) => c.total_price !== null)
    .map((c) => ({ ...c, balance: (c.total_price ?? 0) - totalPaidByClient(c.id) }))
    .filter((c) => c.balance > 0)
    .sort((a, b) => b.balance - a.balance)
    .slice(0, 5);

  const recentPayments = payments.slice(0, 5);

  const monthlyRevenue = Array.from({ length: 6 }).map((_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - (5 - i));
    const key = d.toISOString().slice(0, 7);
    const total = payments
      .filter((p) => p.payment_date?.startsWith(key))
      .reduce((sum, p) => sum + Number(p.amount), 0);
    return { name: MONTH_SHORT[d.getMonth()], total };
  });

  const methodTotals = payments.reduce((acc, p) => {
    acc[p.method] = (acc[p.method] ?? 0) + Number(p.amount);
    return acc;
  }, {} as Record<string, number>);
  const methodData = Object.entries(methodTotals).map(([key, value]) => ({
    name: METHOD_LABELS[key] ?? key,
    value,
    color: METHOD_COLORS[key] ?? GOLD,
  }));

  if (loading) return <p className="text-[#F3EFE3]/60">Chargement...</p>;

  return (
    <div className="max-w-5xl p-6">
      <h1 className="text-2xl font-bold text-[#F3EFE3] mb-1">Tableau de bord</h1>
      <p className="text-[#F3EFE3]/50 text-sm mb-8">
        Bienvenue dans l&apos;administration Vision-H.
      </p>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
        <StatCard icon={<TrendingUp size={18} />} label="Encaissé ce mois" value={`${revenueThisMonth.toLocaleString("fr-FR")} FCFA`} />
        <StatCard icon={<AlertCircle size={18} />} label="Reste à percevoir" value={`${totalOutstanding.toLocaleString("fr-FR")} FCFA`} />
        <StatCard icon={<Wallet size={18} />} label="Salaires payés ce mois" value={`${payrollThisMonth.toLocaleString("fr-FR")} FCFA`} />
      </div>

      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        <StatCard icon={<Users size={18} />} label="Clients" value={String(clients.length)} />
        <StatCard icon={<MapPin size={18} />} label="Terrains" value={String(listingsCount)} />
        <StatCard icon={<UserCog size={18} />} label="Employés" value={String(employeesCount)} />
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 bg-[#0E3A2B] border border-[#C9A15A]/20 rounded-2xl p-6">
          <h2 className="text-[#C9A15A] font-semibold text-sm tracking-wide mb-4">
            Évolution des Revenus
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyRevenue}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1B5A42" />
                <XAxis dataKey="name" stroke="#F3EFE3" opacity={0.6} />
                <YAxis stroke="#F3EFE3" opacity={0.6} />
                <Tooltip contentStyle={{ backgroundColor: "#0E3A2B", borderColor: "#C9A15A" }} />
                <Bar dataKey="total" fill={GOLD} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-[#0E3A2B] border border-[#C9A15A]/20 rounded-2xl p-6">
          <h2 className="text-[#C9A15A] font-semibold text-sm tracking-wide mb-4">
            Modes de Paiement
          </h2>
          <div className="h-64 flex justify-center items-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={methodData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={60}>
                  {methodData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: "#0E3A2B", borderColor: "#C9A15A" }} />
                <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: "12px", color: "#F3EFE3" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-[#0E3A2B] border border-[#C9A15A]/20 rounded-2xl p-6">
          <h2 className="text-[#C9A15A] font-semibold text-sm tracking-wide mb-4">
            Restes de paiement élevés
          </h2>
          <div className="space-y-4">
            {clientsWithBalance.map((c) => (
              <div key={c.id} className="flex justify-between items-center border-b border-[#1B5A42] pb-2 last:border-0">
                <span className="text-[#F3EFE3] text-sm font-medium">{c.full_name}</span>
                <span className="text-[#E4C989] text-sm font-semibold">{c.balance.toLocaleString("fr-FR")} FCFA</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[#0E3A2B] border border-[#C9A15A]/20 rounded-2xl p-6">
          <h2 className="text-[#C9A15A] font-semibold text-sm tracking-wide mb-4">
            Paiements Récents
          </h2>
          <div className="space-y-4">
            {recentPayments.map((p) => (
              <div key={p.id} className="flex justify-between items-center border-b border-[#1B5A42] pb-2 last:border-0">
                <div>
                  <p className="text-[#F3EFE3] text-sm font-medium">{p.clients?.full_name ?? "Client Inconnu"}</p>
                  <p className="text-[#F3EFE3]/40 text-xs">{p.payment_date}</p>
                </div>
                <span className="text-emerald-400 text-sm font-semibold">+{p.amount.toLocaleString("fr-FR")} FCFA</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="bg-[#0E3A2B] border border-[#C9A15A]/20 rounded-2xl p-5 flex items-center space-x-4">
      <div className="p-3 bg-[#1B5A42] rounded-xl text-[#C9A15A]">{icon}</div>
      <div>
        <p className="text-[#F3EFE3]/50 text-xs font-medium uppercase tracking-wider">{label}</p>
        <p className="text-lg font-bold text-[#F3EFE3] mt-0.5">{value}</p>
      </div>
    </div>
  );
}

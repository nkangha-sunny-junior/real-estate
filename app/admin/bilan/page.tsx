"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

interface ClientRow {
  id: string;
  full_name: string;
  total_price: number | null;
}

interface PaymentRow {
  client_id: string | null;
  contract_id: string | null;
  amount: number;
  payment_date: string;
}

export default function BilanPage() {
  const [clients, setClients] = useState<ClientRow[]>([]);
  const [payments, setPayments] = useState<PaymentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7)); // "2026-07"

  useEffect(() => {
    async function load() {
      const { data: clientsData } = await supabase.from("clients").select("id, full_name, total_price");
      setClients((clientsData as ClientRow[]) ?? []);

      const { data: paymentsData } = await supabase
        .from("payments")
        .select("client_id, contract_id, amount, payment_date");
      setPayments((paymentsData as PaymentRow[]) ?? []);
      setLoading(false);
    }
    load();
  }, []);

  // Every payment ever made, per client — used to compute "reste a payer"
  // (this is lifetime, not just the selected month, since a balance owed
  // is always calculated against ALL payments to date, not one month).
  function totalPaidByClient(clientId: string) {
    return payments
      .filter((p) => p.client_id === clientId)
      .reduce((sum, p) => sum + Number(p.amount), 0);
  }

  // Only payments that fall within the selected month — this is what
  // "revenue this month" means.
  const paymentsThisMonth = payments.filter((p) => p.payment_date?.startsWith(month));
  const revenueThisMonth = paymentsThisMonth.reduce((sum, p) => sum + Number(p.amount), 0);

  const clientsWithBalance = clients
    .filter((c) => c.total_price !== null || totalPaidByClient(c.id) > 0)
    .map((c) => {
      const paid = totalPaidByClient(c.id);
      return {
        ...c,
        paid,
        balance: (c.total_price ?? 0) - paid,
      };
    });

  const totalOutstanding = clientsWithBalance.reduce((sum, c) => sum + c.balance, 0);

  if (loading) return <p className="text-[#F3EFE3]/60">Chargement...</p>;

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-[#F3EFE3]">Bilan financier</h1>
        <div className="flex items-center gap-3">
          <input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="input"
          />
          <Link
            href={`/admin/bilan/print?month=${month}`}
            className="bg-[#C9A15A] hover:bg-[#E4C989] text-[#0A2A20] font-semibold px-4 py-2 rounded-lg text-sm whitespace-nowrap"
          >
            Imprimer
          </Link>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4 mb-8">
        <div className="bg-[#0E3A2B] border border-[#C9A15A]/20 rounded-2xl p-6">
          <p className="text-[#F3EFE3]/60 text-sm">Encaisse ce mois</p>
          <p className="text-3xl font-bold text-[#C9A15A]">
            {revenueThisMonth.toLocaleString("fr-FR")} FCFA
          </p>
        </div>
        <div className="bg-[#0E3A2B] border border-[#C9A15A]/20 rounded-2xl p-6">
          <p className="text-[#F3EFE3]/60 text-sm">Total reste a percevoir</p>
          <p className="text-3xl font-bold text-[#C9A15A]">
            {totalOutstanding.toLocaleString("fr-FR")} FCFA
          </p>
        </div>
      </div>

      <h2 className="text-lg font-semibold text-[#F3EFE3] mb-3">Situation par client</h2>
      <div className="border border-[#C9A15A]/20 rounded-2xl overflow-x-auto">
        <table className="w-full text-sm text-[#F3EFE3]">
          <thead className="bg-[#0E3A2B] text-[#C9A15A] text-left">
            <tr>
              <th className="px-4 py-3">Client</th>
              <th className="px-4 py-3">Prix total</th>
              <th className="px-4 py-3">Total paye</th>
              <th className="px-4 py-3">Reste a payer</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#C9A15A]/10">
            {clientsWithBalance.map((c) => (
              <tr key={c.id}>
                <td className="px-4 py-3">{c.full_name}</td>
                <td className="px-4 py-3">{(c.total_price ?? 0).toLocaleString("fr-FR")} FCFA</td>
                <td className="px-4 py-3">{c.paid.toLocaleString("fr-FR")} FCFA</td>
                <td className="text-right py-2 font-semibold">
                    {c.total_price === null ? "N/A" : c.balance.toLocaleString("fr-FR")}
                  </td>
              </tr>
            ))}
            {clientsWithBalance.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-[#F3EFE3]/50">
                  Aucun client avec un prix total renseigne.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
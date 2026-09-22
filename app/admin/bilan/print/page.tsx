"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import PrintButton from "@/components/PrintButton";

interface ClientRow {
  id: string;
  full_name: string;
  total_price: number | null;
}

interface PaymentRow {
  client_id: string | null;
  amount: number;
  payment_date: string;
}

const MONTH_NAMES = [
  "Janvier", "Fevrier", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Aout", "Septembre", "Octobre", "Novembre", "Decembre",
];

export default function BilanPrintPage() {
  const searchParams = useSearchParams();
  const month = searchParams.get("month") ?? new Date().toISOString().slice(0, 7);

  const [clients, setClients] = useState<ClientRow[]>([]);
  const [payments, setPayments] = useState<PaymentRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data: clientsData } = await supabase.from("clients").select("id, full_name, total_price");
      setClients((clientsData as ClientRow[]) ?? []);

      const { data: paymentsData } = await supabase.from("payments").select("client_id, amount, payment_date");
      setPayments((paymentsData as PaymentRow[]) ?? []);
      setLoading(false);
    }
    load();
  }, []);

  if (loading) return <p className="text-center text-[#F3EFE3]/60 py-20">Chargement...</p>;

  function totalPaidByClient(clientId: string) {
    return payments.filter((p) => p.client_id === clientId).reduce((sum, p) => sum + Number(p.amount), 0);
  }

  const paymentsThisMonth = payments.filter((p) => p.payment_date?.startsWith(month));
  const revenueThisMonth = paymentsThisMonth.reduce((sum, p) => sum + Number(p.amount), 0);

  const clientsWithBalance = clients
    .filter((c) => c.total_price !== null || totalPaidByClient(c.id) > 0)
    .map((c) => {
      const paid = totalPaidByClient(c.id);
      return { ...c, paid, balance: (c.total_price ?? 0) - paid };
    });

  const totalOutstanding = clientsWithBalance.reduce((sum, c) => sum + c.balance, 0);
  const [year, monthNum] = month.split("-");
  const monthLabel = `${MONTH_NAMES[Number(monthNum) - 1]} ${year}`;

  return (
    <div className="bg-[#0A2A20] min-h-screen py-8 print:bg-white print:min-h-0 print:py-0">
      <div className="max-w-3xl mx-auto px-6 mb-4 print:hidden">
        <PrintButton />
      </div>

      <div
        className="mx-auto bg-white text-black shadow-xl print:shadow-none"
        style={{
          width: "210mm",
          minHeight: "297mm",
          backgroundImage: "url(/vision-h-letterhead.jpg)",
          backgroundSize: "cover",
          backgroundPosition: "top center",
        }}
      >
        <div style={{ paddingTop: "50mm", paddingBottom: "25mm", paddingLeft: "20mm", paddingRight: "20mm" }}>
          <h1 className="text-center font-bold text-lg mb-1 underline">BILAN FINANCIER</h1>
          <p className="text-center text-sm mb-8">{monthLabel}</p>

          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="border border-black/20 rounded-lg p-4">
              <p className="text-xs text-black/60">Encaisse en {monthLabel}</p>
              <p className="text-xl font-bold">{revenueThisMonth.toLocaleString("fr-FR")} FCFA</p>
            </div>
            <div className="border border-black/20 rounded-lg p-4">
              <p className="text-xs text-black/60">Total reste a percevoir</p>
              <p className="text-xl font-bold">{totalOutstanding.toLocaleString("fr-FR")} FCFA</p>
            </div>
          </div>

          <p className="font-bold underline mb-3">Situation par client</p>
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b-2 border-black">
                <th className="text-left py-2">Client</th>
                <th className="text-right py-2">Prix total</th>
                <th className="text-right py-2">Total paye</th>
                <th className="text-right py-2">Reste a payer</th>
              </tr>
            </thead>
            <tbody>
              {clientsWithBalance.map((c) => (
                <tr key={c.id} className="border-b border-black/10">
                  <td className="py-2">{c.full_name}</td>
                  <td className="text-right py-2">{(c.total_price ?? 0).toLocaleString("fr-FR")}</td>
                  <td className="text-right py-2">{c.paid.toLocaleString("fr-FR")}</td>
                  <td className="text-right py-2 font-semibold">{c.balance.toLocaleString("fr-FR")}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <p className="mt-10 text-sm">Genere le {new Date().toLocaleDateString("fr-FR")}</p>
        </div>
      </div>
    </div>
  );
}
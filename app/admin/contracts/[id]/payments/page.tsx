"use client";

import { useEffect, useState, FormEvent } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

interface Payment {
  id: string;
  amount: number;
  payment_date: string;
  method: string;
  receipt_number: string | null;
  notes: string | null;
}

interface ContractInfo {
  id: string;
  details: { price_per_m2?: string; site_name?: string } | null;
  clients: { full_name: string } | null;
}

export default function PaymentsPage() {
  const params = useParams();
  const contractId = params.id as string;

  const [contract, setContract] = useState<ContractInfo | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    amount: "",
    payment_date: new Date().toISOString().slice(0, 10),
    method: "cash",
    receipt_number: "",
    notes: "",
  });

  async function loadData() {
    setLoading(true);
    const { data: contractData } = await supabase
      .from("contracts")
      .select("id, details, clients(full_name)")
      .eq("id", contractId)
      .single();
    setContract(contractData as unknown as ContractInfo);

    const { data: paymentsData } = await supabase
      .from("payments")
      .select("*")
      .eq("contract_id", contractId)
      .order("payment_date", { ascending: false });
    setPayments((paymentsData as Payment[]) ?? []);
    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, [contractId]);

  async function handleAddPayment(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    const { error } = await supabase.from("payments").insert({
      contract_id: contractId,
      amount: Number(form.amount),
      payment_date: form.payment_date,
      method: form.method,
      receipt_number: form.receipt_number || null,
      notes: form.notes || null,
    });
    if (error) {
      alert("Erreur: " + error.message);
      setSaving(false);
      return;
    }
    setForm({ amount: "", payment_date: new Date().toISOString().slice(0, 10), method: "cash", receipt_number: "", notes: "" });
    setSaving(false);
    loadData();
  }

  // Running total — sums every payment logged against this contract so far.
  const totalPaid = payments.reduce((sum, p) => sum + Number(p.amount), 0);

  if (loading) return <p className="text-[#F3EFE3]/60">Chargement...</p>;

  return (
    <div>
      <Link href="/admin/contracts" className="text-[#C9A15A] text-sm hover:underline">
        ← Retour aux contrats
      </Link>

      <h1 className="text-2xl font-bold text-[#F3EFE3] mt-4 mb-1">
        Paiements — {contract?.clients?.full_name ?? "..."}
      </h1>
      <p className="text-[#F3EFE3]/60 mb-6">
        Site: {contract?.details?.site_name ?? "-"} · Prix convenu:{" "}
        {contract?.details?.price_per_m2 ?? "-"} FCFA/m2
      </p>

      <div className="bg-[#0E3A2B] border border-[#C9A15A]/20 rounded-2xl p-6 mb-8">
        <p className="text-[#F3EFE3]/60 text-sm">Total verse a ce jour</p>
        <p className="text-3xl font-bold text-[#C9A15A]">
          {totalPaid.toLocaleString("fr-FR")} FCFA
        </p>
      </div>

      <form onSubmit={handleAddPayment} className="bg-[#0E3A2B] border border-[#C9A15A]/20 rounded-2xl p-6 mb-8 grid sm:grid-cols-2 gap-4">
        <input
          type="number"
          placeholder="Montant (FCFA)"
          value={form.amount}
          onChange={(e) => setForm({ ...form, amount: e.target.value })}
          required
          className="px-3 py-2 rounded-lg bg-[#0A2A20] border border-[#C9A15A]/30 text-[#F3EFE3]"
        />
        <input
          type="date"
          value={form.payment_date}
          onChange={(e) => setForm({ ...form, payment_date: e.target.value })}
          required
          className="px-3 py-2 rounded-lg bg-[#0A2A20] border border-[#C9A15A]/30 text-[#F3EFE3]"
        />
        <select
          value={form.method}
          onChange={(e) => setForm({ ...form, method: e.target.value })}
          className="px-3 py-2 rounded-lg bg-[#0A2A20] border border-[#C9A15A]/30 text-[#F3EFE3]"
        >
          <option value="cash">Especes</option>
          <option value="mobile_money">Mobile Money</option>
          <option value="bank_transfer">Virement bancaire</option>
        </select>
        <input
          placeholder="N. Recu (optionnel)"
          value={form.receipt_number}
          onChange={(e) => setForm({ ...form, receipt_number: e.target.value })}
          className="px-3 py-2 rounded-lg bg-[#0A2A20] border border-[#C9A15A]/30 text-[#F3EFE3]"
        />
        <input
          placeholder="Notes (optionnel)"
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
          className="px-3 py-2 rounded-lg bg-[#0A2A20] border border-[#C9A15A]/30 text-[#F3EFE3] sm:col-span-2"
        />
        <button
          type="submit"
          disabled={saving}
          className="sm:col-span-2 bg-[#C9A15A] hover:bg-[#E4C989] text-[#0A2A20] font-semibold py-2.5 rounded-lg transition-colors disabled:opacity-50"
        >
          {saving ? "Enregistrement..." : "Enregistrer le paiement"}
        </button>
      </form>

      <div className="border border-[#C9A15A]/20 rounded-2xl overflow-hidden">
        <table className="w-full text-sm text-[#F3EFE3]">
          <thead className="bg-[#0E3A2B] text-[#C9A15A] text-left">
            <tr>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Montant</th>
              <th className="px-4 py-3">Methode</th>
              <th className="px-4 py-3">Recu</th>
              <th className="px-4 py-3">Notes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#C9A15A]/10">
            {payments.map((p) => (
              <tr key={p.id}>
                <td className="px-4 py-3">{p.payment_date}</td>
                <td className="px-4 py-3">{Number(p.amount).toLocaleString("fr-FR")} FCFA</td>
                <td className="px-4 py-3">{p.method}</td>
                <td className="px-4 py-3">{p.receipt_number ?? "-"}</td>
                <td className="px-4 py-3">{p.notes ?? "-"}</td>
              </tr>
            ))}
            {payments.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-[#F3EFE3]/50">
                  Aucun paiement enregistre.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
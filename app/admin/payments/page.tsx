"use client";

import { useEffect, useState, FormEvent } from "react";
import Link from "next/link";
import { Search, Trash2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface Client {
  id: string;
  full_name: string;
}

interface PaymentRow {
  id: string;
  amount: number;
  payment_date: string;
  method: string;
  receipt_number: string | null;
  clients: { full_name: string } | null;
}

const emptyForm = {
  client_id: "",
  amount: "",
  payment_date: new Date().toISOString().slice(0, 10),
  method: "cash",
  notes: "",
  amount_in_words: "",
  superficie_m2: "",
  bloc: "",
  location: "",
  price_per_m2: "",
  remaining_balance: "",
  remaining_installments: "",
};

export default function GeneralPaymentsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [payments, setPayments] = useState<PaymentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showReceiptFields, setShowReceiptFields] = useState(false);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState(emptyForm);

  async function loadData() {
    const { data: clientsData } = await supabase.from("clients").select("id, full_name").order("full_name");
    setClients((clientsData as Client[]) ?? []);

    const { data: paymentsData } = await supabase
      .from("payments")
      .select("id, amount, payment_date, method, receipt_number, clients(full_name)")
      .not("client_id", "is", null)
      .order("payment_date", { ascending: false });
    setPayments((paymentsData as unknown as PaymentRow[]) ?? []);
    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleAdd(e: FormEvent) {
    e.preventDefault();
    if (!form.client_id) {
      alert("Choisissez un client.");
      return;
    }
    setSaving(true);
    // receipt_number is intentionally NOT sent here — leaving it out lets
    // the database trigger (set_receipt_number) generate it automatically.
    const { error } = await supabase.from("payments").insert({
      client_id: form.client_id,
      amount: Number(form.amount),
      payment_date: form.payment_date,
      method: form.method,
      notes: form.notes || null,
      details: {
        amount_in_words: form.amount_in_words,
        superficie_m2: form.superficie_m2,
        bloc: form.bloc,
        location: form.location,
        price_per_m2: form.price_per_m2,
        remaining_balance: form.remaining_balance,
        remaining_installments: form.remaining_installments,
      },
    });
    setSaving(false);
    if (error) {
      alert("Erreur: " + error.message);
      return;
    }
    setForm(emptyForm);
    setShowReceiptFields(false);
    loadData();
  }

  async function handleDelete(id: string) {
    if (!confirm("Supprimer ce paiement ? Cette action est irreversible.")) return;
    const { error } = await supabase.from("payments").delete().eq("id", id);
    if (error) {
      alert("Erreur: " + error.message);
      return;
    }
    loadData();
  }

  const filtered = payments.filter((p) => {
    const q = search.toLowerCase();
    return (
      (p.receipt_number ?? "").toLowerCase().includes(q) ||
      (p.clients?.full_name ?? "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-bold text-[#F3EFE3] mb-1">Paiements clients</h1>
      <p className="text-[#F3EFE3]/50 text-sm mb-8">
        Pour les paiements lies a un partenariat, utilisez plutot la page
        Paiements du contrat concerne.
      </p>

      <form onSubmit={handleAdd} className="bg-[#0E3A2B] border border-[#C9A15A]/20 rounded-2xl p-6 mb-8">
        <h2 className="text-[#C9A15A] text-sm font-semibold tracking-wide mb-5">NOUVEAU PAIEMENT</h2>

        <div className="grid sm:grid-cols-2 gap-5">
          <Field label="Client">
            <select value={form.client_id} onChange={(e) => setForm({ ...form, client_id: e.target.value })} required className="input">
              <option value="">-- Choisir --</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>{c.full_name}</option>
              ))}
            </select>
          </Field>
          <Field label="Montant (FCFA)">
            <input type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} required className="input" />
          </Field>
          <Field label="Date">
            <input type="date" value={form.payment_date} onChange={(e) => setForm({ ...form, payment_date: e.target.value })} required className="input" />
          </Field>
          <Field label="Methode">
            <select value={form.method} onChange={(e) => setForm({ ...form, method: e.target.value })} className="input">
              <option value="cash">Especes</option>
              <option value="mobile_money">Mobile Money</option>
              <option value="bank_transfer">Virement bancaire</option>
            </select>
          </Field>
          <Field label="Notes (optionnel)">
            <input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="input" />
          </Field>
        </div>

        <p className="text-xs text-[#F3EFE3]/40 mt-3">
          Le numero de recu est genere automatiquement a l&apos;enregistrement.
        </p>

        <button
          type="button"
          onClick={() => setShowReceiptFields((v) => !v)}
          className="mt-4 text-sm text-[#C9A15A] hover:underline"
        >
          {showReceiptFields ? "− Masquer" : "+ Ajouter"} les details pour un recu de reconnaissance
        </button>

        {showReceiptFields && (
          <div className="grid sm:grid-cols-2 gap-5 mt-5 pt-5 border-t border-[#C9A15A]/10">
            <Field label="Montant en toutes lettres" span2>
              <input value={form.amount_in_words} onChange={(e) => setForm({ ...form, amount_in_words: e.target.value })} placeholder="Cinq Millions de francs" className="input" />
            </Field>
            <Field label="Superficie (m2)">
              <input value={form.superficie_m2} onChange={(e) => setForm({ ...form, superficie_m2: e.target.value })} className="input" />
            </Field>
            <Field label="Bloc">
              <input value={form.bloc} onChange={(e) => setForm({ ...form, bloc: e.target.value })} className="input" />
            </Field>
            <Field label="Emplacement" span2>
              <input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="PK26 a cote du Grand Seminaire" className="input" />
            </Field>
            <Field label="Prix / m2 (FCFA)">
              <input value={form.price_per_m2} onChange={(e) => setForm({ ...form, price_per_m2: e.target.value })} className="input" />
            </Field>
            <Field label="Reste a payer (FCFA)">
              <input value={form.remaining_balance} onChange={(e) => setForm({ ...form, remaining_balance: e.target.value })} className="input" />
            </Field>
            <Field label="Echeancier restant (une ligne par versement)" span2>
              <textarea value={form.remaining_installments} onChange={(e) => setForm({ ...form, remaining_installments: e.target.value })} rows={3} className="input" />
            </Field>
          </div>
        )}

        <button
          type="submit"
          disabled={saving}
          className="mt-6 w-full bg-[#C9A15A] hover:bg-[#E4C989] text-[#0A2A20] font-semibold py-2.5 rounded-lg transition-colors disabled:opacity-50"
        >
          {saving ? "Enregistrement..." : "Enregistrer le paiement"}
        </button>
      </form>

      <div className="relative mb-4">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#F3EFE3]/40" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher par numero de recu ou client..."
          className="input pl-9"
        />
      </div>

      {loading ? (
        <p className="text-[#F3EFE3]/60">Chargement...</p>
      ) : (
        <div className="border border-[#C9A15A]/20 rounded-2xl overflow-hidden">
          <table className="w-full text-sm text-[#F3EFE3]">
            <thead className="bg-[#0E3A2B] text-[#C9A15A] text-left">
              <tr>
                <th className="px-4 py-3">Recu N.</th>
                <th className="px-4 py-3">Client</th>
                <th className="px-4 py-3">Montant</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#C9A15A]/10">
              {filtered.map((p) => (
                <tr key={p.id}>
                  <td className="px-4 py-3">{p.receipt_number ?? "-"}</td>
                  <td className="px-4 py-3">{p.clients?.full_name ?? "-"}</td>
                  <td className="px-4 py-3">{Number(p.amount).toLocaleString("fr-FR")} FCFA</td>
                  <td className="px-4 py-3">{p.payment_date}</td>
                  <td className="px-4 py-3 flex items-center gap-3">
                    <Link href={`/admin/payments/${p.id}/receipt`} className="text-[#C9A15A] hover:underline">
                      Imprimer
                    </Link>
                    <button onClick={() => handleDelete(p.id)} className="text-red-400 hover:text-red-300" aria-label="Supprimer">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-[#F3EFE3]/50">
                    Aucun paiement trouve.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function Field({ label, span2, children }: { label: string; span2?: boolean; children: React.ReactNode }) {
  return (
    <div className={span2 ? "sm:col-span-2" : ""}>
      <label className="block text-xs text-[#F3EFE3]/50 mb-1.5">{label}</label>
      {children}
    </div>
  );
}
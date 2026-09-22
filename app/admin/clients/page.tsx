"use client";
import Link from "next/link";

import { useEffect, useState, FormEvent } from "react";
import { Search, Trash2, MessageCircle, Wallet } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface Client {
  id: string;
  full_name: string;
  phone: string;
  email: string | null;
  notes: string | null;
  total_price: number | null;
}

interface Payment {
  client_id: string | null;
  amount: number;
}

// Local Field component helper to fix compilation errors
interface FieldProps {
  label: string;
  span2?: boolean;
  children: React.ReactNode;
}

function Field({ label, span2, children }: FieldProps) {
  return (
    <div className={span2 ? "sm:col-span-2 flex flex-col gap-1.5" : "flex flex-col gap-1.5"}>
      <label className="text-xs font-medium text-[#F3EFE3]/70">{label}</label>
      {children}
    </div>
  );
}

const emptyForm = { full_name: "", phone: "", email: "", notes: "", total_price: "" };

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  async function loadData() {
    setLoading(true);
    const { data: clientsData } = await supabase.from("clients").select("*").order("created_at", { ascending: false });
    setClients((clientsData as Client[]) ?? []);

    const { data: paymentsData } = await supabase.from("payments").select("client_id, amount");
    setPayments((paymentsData as Payment[]) ?? []);
    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  function totalPaid(clientId: string) {
    return payments.filter((p) => p.client_id === clientId).reduce((sum, p) => sum + Number(p.amount), 0);
  }

  async function handleAdd(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    const { error } = await supabase.from("clients").insert({
      full_name: form.full_name,
      phone: form.phone,
      email: form.email || null,
      notes: form.notes || null,
      total_price: form.total_price ? Number(form.total_price) : null,
    });
    setSaving(false);
    if (error) {
      alert("Erreur: " + error.message);
      return;
    }
    setForm(emptyForm);
    loadData();
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Supprimer ${name} ? Cette action est irreversible.`)) return;
    const { error } = await supabase.from("clients").delete().eq("id", id);
    if (error) {
      alert("Erreur: " + error.message);
      return;
    }
    loadData();
  }

  function sendReminder(client: Client) {
    const paid = totalPaid(client.id);
    const balance = client.total_price !== null ? client.total_price - paid : null;
    const phone = client.phone.replace(/[^0-9]/g, "");
    let message = `Bonjour ${client.full_name}, ceci est un rappel de VISION-H.`;
    if (balance !== null && balance > 0) {
      message += ` Votre solde a payer est de ${balance.toLocaleString("fr-FR")} FCFA. Merci de nous contacter pour finaliser votre paiement. Passez une excellente journee !`;
    }
    const url = `https://wa.me/237${phone}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  }

  function startEditing(client: Client) {
    setEditingId(client.id);
    setEditValue(client.total_price !== null ? String(client.total_price) : "");
  }

  async function saveEdit(id: string) {
    const value = editValue.trim() === "" ? null : Number(editValue);
    const { error } = await supabase.from("clients").update({ total_price: value }).eq("id", id);
    setEditingId(null);
    if (error) {
      alert("Erreur: " + error.message);
      return;
    }
    loadData();
  }

  const filtered = clients.filter((c) => {
    const q = search.toLowerCase();
    return (
      c.full_name.toLowerCase().includes(q) ||
      c.phone.toLowerCase().includes(q) ||
      (c.email ?? "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="max-w-5xl">
      <h1 className="text-2xl font-bold text-[#F3EFE3] mb-6">Clients</h1>

      <form onSubmit={handleAdd} className="bg-[#0E3A2B] border border-[#C9A15A]/20 rounded-2xl p-6 mb-8">
        <h2 className="text-[#C9A15A] text-sm font-semibold tracking-wide mb-5">NOUVEAU CLIENT</h2>
        <div className="grid sm:grid-cols-2 gap-5">
          <Field label="Nom complet">
            <input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} required className="input" />
          </Field>
          <Field label="Telephone">
            <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required className="input" />
          </Field>
          <Field label="Email (optionnel)">
            <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input" />
          </Field>
          <Field label="Prix total du terrain (FCFA)">
            <input type="number" value={form.total_price} onChange={(e) => setForm({ ...form, total_price: e.target.value })} className="input" />
          </Field>
          <Field label="Notes (optionnel)" span2>
            <input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="input" />
          </Field>
        </div>
        <button
          type="submit"
          disabled={saving}
          className="mt-6 w-full bg-[#C9A15A] hover:bg-[#E4C989] text-[#0A2A20] font-semibold py-2.5 rounded-lg transition-colors disabled:opacity-50"
        >
          {saving ? "Ajout..." : "Ajouter le client"}
        </button>
      </form>

      <div className="relative mb-4">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#F3EFE3]/40" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher par nom, telephone ou email..."
          className="input pl-9"
        />
      </div>

      {loading ? (
        <p className="text-[#F3EFE3]/60">Chargement...</p>
      ) : (
        <div className="border border-[#C9A15A]/20 rounded-2xl overflow-x-auto">
          <table className="w-full text-sm text-[#F3EFE3]">
            <thead className="bg-[#0E3A2B] text-[#C9A15A] text-left">
              <tr>
                <th className="px-4 py-3">Nom</th>
                <th className="px-4 py-3">Telephone</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Prix total</th>
                <th className="px-4 py-3">Paye</th>
                <th className="px-4 py-3">Reste a payer</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#C9A15A]/10">
              {filtered.map((c) => {
                const paid = totalPaid(c.id);
                const balance = c.total_price !== null ? c.total_price - paid : null;
                const isEditing = editingId === c.id;
                return (
                  <tr key={c.id}>
                    <td className="px-4 py-3">{c.full_name}</td>
                    <td className="px-4 py-3">{c.phone}</td>
                    <td className="px-4 py-3">{c.email || "-"}</td>
                    <td className="px-4 py-3">
                      {isEditing ? (
                        <input
                          type="number"
                          autoFocus
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onBlur={() => saveEdit(c.id)}
                          onKeyDown={(e) => e.key === "Enter" && saveEdit(c.id)}
                          className="input py-1 w-32"
                        />
                      ) : (
                        <button
                          onClick={() => startEditing(c)}
                          className="hover:underline text-left w-full"
                        >
                          {c.total_price !== null ? `${c.total_price.toLocaleString()} FCFA` : "Ajouter..."}
                        </button>
                      )}
                    </td>
                    <td className="px-4 py-3 text-emerald-400">{paid.toLocaleString()} FCFA</td>
                    <td className="px-4 py-3 text-amber-400">
                      {balance !== null ? `${balance.toLocaleString()} FCFA` : "-"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/admin/payments?client=${c.id}`}
                        className="text-[#C9A15A] hover:text-[#E4C989] transition-colors p-1 mr-1 inline-block"
                        title="Nouveau paiement"
                      >
                        <Wallet size={16} className="inline" />
                      </Link>
                      <button
                        onClick={() => sendReminder(c)}
                        className="text-emerald-400 hover:text-emerald-300 transition-colors p-1 mr-1"
                        title="Envoyer un rappel WhatsApp"
                      >
                        <MessageCircle size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(c.id, c.full_name)}
                        className="text-rose-400 hover:text-rose-300 transition-colors p-1"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

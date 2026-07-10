"use client";

import { useEffect, useState, FormEvent } from "react";
import { Search, Trash2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface Client {
  id: string;
  full_name: string;
  phone: string;
  email: string | null;
  notes: string | null;
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({ full_name: "", phone: "", email: "", notes: "" });

  async function loadClients() {
    setLoading(true);
    const { data } = await supabase.from("clients").select("*").order("created_at", { ascending: false });
    setClients((data as Client[]) ?? []);
    setLoading(false);
  }

  useEffect(() => {
    loadClients();
  }, []);

  async function handleAdd(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    const { error } = await supabase.from("clients").insert({
      full_name: form.full_name,
      phone: form.phone,
      email: form.email || null,
      notes: form.notes || null,
    });
    setSaving(false);
    if (error) {
      alert("Erreur: " + error.message);
      return;
    }
    setForm({ full_name: "", phone: "", email: "", notes: "" });
    loadClients();
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Supprimer ${name} ? Cette action est irreversible.`)) return;
    const { error } = await supabase.from("clients").delete().eq("id", id);
    if (error) {
      alert("Erreur: " + error.message);
      return;
    }
    loadClients();
  }

  // Simple client-side filter: since the whole client list is already
  // loaded, we don't need a new database call every keystroke — just
  // filter the array already in memory. Fast, and can't lose focus.
  const filtered = clients.filter((c) => {
    const q = search.toLowerCase();
    return (
      c.full_name.toLowerCase().includes(q) ||
      c.phone.toLowerCase().includes(q) ||
      (c.email ?? "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="max-w-4xl">
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
          <Field label="Notes (optionnel)">
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
        <div className="border border-[#C9A15A]/20 rounded-2xl overflow-hidden">
          <table className="w-full text-sm text-[#F3EFE3]">
            <thead className="bg-[#0E3A2B] text-[#C9A15A] text-left">
              <tr>
                <th className="px-4 py-3">Nom</th>
                <th className="px-4 py-3">Telephone</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Notes</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#C9A15A]/10">
              {filtered.map((c) => (
                <tr key={c.id}>
                  <td className="px-4 py-3">{c.full_name}</td>
                  <td className="px-4 py-3">{c.phone}</td>
                  <td className="px-4 py-3">{c.email || "-"}</td>
                  <td className="px-4 py-3">{c.notes || "-"}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleDelete(c.id, c.full_name)}
                      className="text-red-400 hover:text-red-300"
                      aria-label="Supprimer"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-[#F3EFE3]/50">
                    Aucun client trouve.
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

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs text-[#F3EFE3]/50 mb-1.5">{label}</label>
      {children}
    </div>
  );
}
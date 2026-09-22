"use client";

import { useEffect, useState, FormEvent } from "react";
import Link from "next/link";
import { Trash2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface Client {
  id: string;
  full_name: string;
}

interface ProtocoleRow {
  id: string;
  signed_date: string | null;
  details: { partner_company?: string; location?: string } | null;
  clients: { full_name: string } | null;
}

const emptyForm = {
  client_id: "",
  vendeur_rep_name: "",
  partner_company: "",
  partner_address: "",
  partner_rep_name: "",
  title_numbers: "",
  location: "Missole 2, arrondissement de Dibamba, departement de la Sanaga Maritime, region du Littoral",
  superficie: "quatre hectares ou plus",
  price_per_m2: "2000",
  bank_account: "",
  duree: "une annee",
  contract_date: new Date().toISOString().slice(0, 10),
};

export default function ProtocolesPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [protocoles, setProtocoles] = useState<ProtocoleRow[]>([]);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);

  async function loadData() {
    const { data: clientsData } = await supabase.from("clients").select("id, full_name").order("full_name");
    setClients((clientsData as Client[]) ?? []);

    const { data } = await supabase
      .from("contracts")
      .select("id, signed_date, details, clients(full_name)")
      .eq("contract_type", "protocole")
      .order("created_at", { ascending: false });
    setProtocoles((data as unknown as ProtocoleRow[]) ?? []);
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    const { error } = await supabase.from("contracts").insert({
      client_id: form.client_id || null,
      contract_type: "protocole",
      status: "pending",
      signed_date: form.contract_date,
      details: {
        vendeur_rep_name: form.vendeur_rep_name,
        partner_company: form.partner_company,
        partner_address: form.partner_address,
        partner_rep_name: form.partner_rep_name,
        title_numbers: form.title_numbers,
        location: form.location,
        superficie: form.superficie,
        price_per_m2: form.price_per_m2,
        bank_account: form.bank_account,
        duree: form.duree,
      },
    });
    setSaving(false);
    if (error) {
      alert("Erreur: " + error.message);
      return;
    }
    setForm(emptyForm);
    loadData();
  }

  async function handleDelete(id: string) {
    if (!confirm("Supprimer ce protocole ? Cette action est irreversible.")) return;
    const { error } = await supabase.from("contracts").delete().eq("id", id);
    if (error) {
      alert("Erreur: " + error.message);
      return;
    }
    loadData();
  }

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-bold text-[#F3EFE3] mb-1">Protocoles d&apos;accord</h1>
      <p className="text-[#F3EFE3]/50 text-sm mb-8">
        Accord entre VISION-H (vendeur) et une entreprise partenaire pour la
        commercialisation d&apos;un site.
      </p>

      <form onSubmit={handleCreate} className="bg-[#0E3A2B] border border-[#C9A15A]/20 rounded-2xl p-6 mb-8">
        <h2 className="text-[#C9A15A] text-sm font-semibold tracking-wide mb-5">NOUVEAU PROTOCOLE</h2>

        <div className="grid sm:grid-cols-2 gap-5">
          <Field label="Client lie (optionnel)" span2>
            <select value={form.client_id} onChange={(e) => setForm({ ...form, client_id: e.target.value })} className="input">
              <option value="">-- Aucun --</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>{c.full_name}</option>
              ))}
            </select>
          </Field>

          <Field label="Representant VISION-H">
            <input value={form.vendeur_rep_name} onChange={(e) => setForm({ ...form, vendeur_rep_name: e.target.value })} placeholder="Nom du representant" required className="input" />
          </Field>
          <Field label="Entreprise partenaire">
            <input value={form.partner_company} onChange={(e) => setForm({ ...form, partner_company: e.target.value })} placeholder="ex: BTP Immo Sarl" required className="input" />
          </Field>
          <Field label="Adresse du partenaire" span2>
            <input value={form.partner_address} onChange={(e) => setForm({ ...form, partner_address: e.target.value })} className="input" />
          </Field>
          <Field label="Representant du partenaire">
            <input value={form.partner_rep_name} onChange={(e) => setForm({ ...form, partner_rep_name: e.target.value })} required className="input" />
          </Field>
          <Field label="N. Titres Fonciers">
            <input value={form.title_numbers} onChange={(e) => setForm({ ...form, title_numbers: e.target.value })} className="input" />
          </Field>
          <Field label="Localisation" span2>
            <input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className="input" />
          </Field>
          <Field label="Superficie">
            <input value={form.superficie} onChange={(e) => setForm({ ...form, superficie: e.target.value })} className="input" />
          </Field>
          <Field label="Prix / m2 (FCFA)">
            <input value={form.price_per_m2} onChange={(e) => setForm({ ...form, price_per_m2: e.target.value })} className="input" />
          </Field>
          <Field label="Compte bancaire">
            <input value={form.bank_account} onChange={(e) => setForm({ ...form, bank_account: e.target.value })} className="input" />
          </Field>
          <Field label="Duree de l'accord">
            <input value={form.duree} onChange={(e) => setForm({ ...form, duree: e.target.value })} className="input" />
          </Field>
          <Field label="Date">
            <input type="date" value={form.contract_date} onChange={(e) => setForm({ ...form, contract_date: e.target.value })} className="input" />
          </Field>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="mt-6 w-full bg-[#C9A15A] hover:bg-[#E4C989] text-[#0A2A20] font-semibold py-2.5 rounded-lg transition-colors disabled:opacity-50"
        >
          {saving ? "Creation..." : "Creer le protocole"}
        </button>
      </form>

      <div className="border border-[#C9A15A]/20 rounded-2xl overflow-x-auto">
        <table className="w-full text-sm text-[#F3EFE3]">
          <thead className="bg-[#0E3A2B] text-[#C9A15A] text-left">
            <tr>
              <th className="px-4 py-3">Partenaire</th>
              <th className="px-4 py-3">Localisation</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#C9A15A]/10">
            {protocoles.map((p) => (
              <tr key={p.id}>
                <td className="px-4 py-3">{p.details?.partner_company ?? "-"}</td>
                <td className="px-4 py-3">{p.details?.location ?? "-"}</td>
                <td className="px-4 py-3">{p.signed_date ?? "-"}</td>
                <td className="px-4 py-3 flex items-center gap-3">
                  <Link href={`/admin/protocoles/${p.id}/print`} className="text-[#C9A15A] hover:underline">
                    Voir / Imprimer
                  </Link>
                  <button onClick={() => handleDelete(p.id)} className="text-red-400 hover:text-red-300" aria-label="Supprimer">
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
            {protocoles.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-[#F3EFE3]/50">
                  Aucun protocole enregistre.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
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
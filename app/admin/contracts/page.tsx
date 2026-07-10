"use client";

import { useEffect, useState, FormEvent } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Trash2 } from "lucide-react";

interface Client {
  id: string;
  full_name: string;
}

interface ContractRow {
  id: string;
  status: string;
  signed_date: string | null;
  details: { civility?: string; site_name?: string } | null;
  clients: { full_name: string } | null;
}

export default function ContractsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [contracts, setContracts] = useState<ContractRow[]>([]);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    client_id: "",
    civility: "Monsieur",
    address: "",
    birth_date: "",
    birth_place: "",
    id_number: "",
    id_issue_date: "",
    nationality: "Camerounaise",
    site_name: "MBONGO",
    title_numbers: "10355 et 10356/SM",
    price_per_m2: "2500",
    contract_date: new Date().toISOString().slice(0, 10),
  });

  async function loadData() {
    const { data: clientsData } = await supabase.from("clients").select("id, full_name").order("full_name");
    setClients((clientsData as Client[]) ?? []);

    // The `clients(full_name)` part below is a Supabase "join" — it pulls
    // the related row from the clients table using the client_id foreign key.
    const { data: contractsData } = await supabase
      .from("contracts")
      .select("id, status, signed_date, details, clients(full_name)")
      .order("created_at", { ascending: false });
    setContracts((contractsData as unknown as ContractRow[]) ?? []);
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    if (!form.client_id) {
      alert("Choisissez un client.");
      return;
    }
    setSaving(true);
    await supabase.from("contracts").insert({
      client_id: form.client_id,
      contract_type: "partnership",
      status: "pending",
      signed_date: form.contract_date,
      details: {
        civility: form.civility,
        address: form.address,
        birth_date: form.birth_date,
        birth_place: form.birth_place,
        id_number: form.id_number,
        id_issue_date: form.id_issue_date,
        nationality: form.nationality,
        site_name: form.site_name,
        title_numbers: form.title_numbers,
        price_per_m2: form.price_per_m2,
      },
    });
    setSaving(false);
    loadData();
  }

  async function handleDelete(id: string) {
    if (!confirm("Supprimer ce contrat ? Cette action est irreversible.")) return;
    const { error } = await supabase.from("contracts").delete().eq("id", id);
    if (error) {
      alert("Erreur: " + error.message);
      return;
    }
    loadData();
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#F3EFE3] mb-6">Contrats de partenariat</h1>

      <form onSubmit={handleCreate} className="bg-[#0E3A2B] border border-[#C9A15A]/20 rounded-2xl p-6 mb-8 grid sm:grid-cols-2 gap-4">
        <select
          value={form.client_id}
          onChange={(e) => setForm({ ...form, client_id: e.target.value })}
          required
          className="px-3 py-2 rounded-lg bg-[#0A2A20] border border-[#C9A15A]/30 text-[#F3EFE3] sm:col-span-2"
        >
          <option value="">-- Choisir le partenaire (client) --</option>
          {clients.map((c) => (
            <option key={c.id} value={c.id}>{c.full_name}</option>
          ))}
        </select>

        <select
          value={form.civility}
          onChange={(e) => setForm({ ...form, civility: e.target.value })}
          className="px-3 py-2 rounded-lg bg-[#0A2A20] border border-[#C9A15A]/30 text-[#F3EFE3]"
        >
          <option>Monsieur</option>
          <option>Madame</option>
        </select>
        <input
          placeholder="Nationalite"
          value={form.nationality}
          onChange={(e) => setForm({ ...form, nationality: e.target.value })}
          className="px-3 py-2 rounded-lg bg-[#0A2A20] border border-[#C9A15A]/30 text-[#F3EFE3]"
        />
        <input
          placeholder="Adresse (ex: Douala - Logpom)"
          value={form.address}
          onChange={(e) => setForm({ ...form, address: e.target.value })}
          required
          className="px-3 py-2 rounded-lg bg-[#0A2A20] border border-[#C9A15A]/30 text-[#F3EFE3] sm:col-span-2"
        />
        <div>
          <label className="block text-xs text-[#F3EFE3]/50 mb-1">Date de naissance</label>
          <input
            type="date"
            value={form.birth_date}
            onChange={(e) => setForm({ ...form, birth_date: e.target.value })}
            required
            className="w-full px-3 py-2 rounded-lg bg-[#0A2A20] border border-[#C9A15A]/30 text-[#F3EFE3]"
          />
        </div>
        <input
          placeholder="Lieu de naissance"
          value={form.birth_place}
          onChange={(e) => setForm({ ...form, birth_place: e.target.value })}
          required
          className="px-3 py-2 rounded-lg bg-[#0A2A20] border border-[#C9A15A]/30 text-[#F3EFE3]"
        />
        <input
          placeholder="Numero CNI"
          value={form.id_number}
          onChange={(e) => setForm({ ...form, id_number: e.target.value })}
          required
          className="px-3 py-2 rounded-lg bg-[#0A2A20] border border-[#C9A15A]/30 text-[#F3EFE3]"
        />
        <div>
          <label className="block text-xs text-[#F3EFE3]/50 mb-1">Date de delivrance CNI</label>
          <input
            type="date"
            value={form.id_issue_date}
            onChange={(e) => setForm({ ...form, id_issue_date: e.target.value })}
            required
            className="w-full px-3 py-2 rounded-lg bg-[#0A2A20] border border-[#C9A15A]/30 text-[#F3EFE3]"
          />
        </div>
        <input
          placeholder="Site (ex: MBONGO)"
          value={form.site_name}
          onChange={(e) => setForm({ ...form, site_name: e.target.value })}
          className="px-3 py-2 rounded-lg bg-[#0A2A20] border border-[#C9A15A]/30 text-[#F3EFE3]"
        />
        <input
          placeholder="N. Titres Fonciers"
          value={form.title_numbers}
          onChange={(e) => setForm({ ...form, title_numbers: e.target.value })}
          className="px-3 py-2 rounded-lg bg-[#0A2A20] border border-[#C9A15A]/30 text-[#F3EFE3]"
        />
        <input
          placeholder="Prix / m2 (FCFA)"
          value={form.price_per_m2}
          onChange={(e) => setForm({ ...form, price_per_m2: e.target.value })}
          className="px-3 py-2 rounded-lg bg-[#0A2A20] border border-[#C9A15A]/30 text-[#F3EFE3]"
        />
        <div>
          <label className="block text-xs text-[#F3EFE3]/50 mb-1">Date du contrat</label>
          <input
            type="date"
            value={form.contract_date}
            onChange={(e) => setForm({ ...form, contract_date: e.target.value })}
            className="w-full px-3 py-2 rounded-lg bg-[#0A2A20] border border-[#C9A15A]/30 text-[#F3EFE3]"
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="sm:col-span-2 bg-[#C9A15A] hover:bg-[#E4C989] text-[#0A2A20] font-semibold py-2.5 rounded-lg transition-colors disabled:opacity-50"
        >
          {saving ? "Creation..." : "Creer le contrat"}
        </button>
      </form>

      <div className="border border-[#C9A15A]/20 rounded-2xl overflow-hidden">
        <table className="w-full text-sm text-[#F3EFE3]">
          <thead className="bg-[#0E3A2B] text-[#C9A15A] text-left">
            <tr>
              <th className="px-4 py-3">Partenaire</th>
              <th className="px-4 py-3">Site</th>
              <th className="px-4 py-3">Statut</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#C9A15A]/10">
            {contracts.map((c) => (
              <tr key={c.id}>
                <td className="px-4 py-3">{c.clients?.full_name ?? "-"}</td>
                <td className="px-4 py-3">{c.details?.site_name ?? "-"}</td>
                <td className="px-4 py-3">{c.status}</td>
                <td className="px-4 py-3">{c.signed_date ?? "-"}</td>
                <td className="px-4 py-3">
                  <Link href={`/admin/contracts/${c.id}/print`} className="text-[#C9A15A] hover:underline">
                    Voir / Imprimer
                  </Link>
                  <Link href={`/admin/contracts/${c.id}/payments`} className="text-[#C9A15A] hover:underline ml-3">
                    Paiements
                  </Link>
                  <button onClick={() => handleDelete(c.id)} className="text-red-400 hover:text-red-300 ml-3 align-middle" aria-label="Supprimer">
                    <Trash2 size={16} className="inline" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
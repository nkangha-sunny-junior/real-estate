"use client";

import { useEffect, useState, FormEvent } from "react";
import { Trash2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface Employee {
  id: string;
  full_name: string;
  position: string | null;
  phone: string | null;
  base_salary: number | null;
}

const emptyForm = { full_name: "", position: "", phone: "", base_salary: "" };

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);

  async function loadData() {
    setLoading(true);
    const { data } = await supabase.from("employees").select("*").order("full_name");
    setEmployees((data as Employee[]) ?? []);
    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleAdd(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    const { error } = await supabase.from("employees").insert({
      full_name: form.full_name,
      position: form.position || null,
      phone: form.phone || null,
      base_salary: form.base_salary ? Number(form.base_salary) : null,
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
    const { error } = await supabase.from("employees").delete().eq("id", id);
    if (error) {
      alert("Erreur: " + error.message);
      return;
    }
    loadData();
  }

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-bold text-[#F3EFE3] mb-6">Employes</h1>

      <form onSubmit={handleAdd} className="bg-[#0E3A2B] border border-[#C9A15A]/20 rounded-2xl p-6 mb-8">
        <h2 className="text-[#C9A15A] text-sm font-semibold tracking-wide mb-5">NOUVEL EMPLOYE</h2>
        <div className="grid sm:grid-cols-2 gap-5">
          <Field label="Nom complet">
            <input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} required className="input" />
          </Field>
          <Field label="Poste">
            <input value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })} className="input" />
          </Field>
          <Field label="Telephone">
            <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="input" />
          </Field>
          <Field label="Salaire de base (FCFA)">
            <input type="number" value={form.base_salary} onChange={(e) => setForm({ ...form, base_salary: e.target.value })} className="input" />
          </Field>
        </div>
        <button
          type="submit"
          disabled={saving}
          className="mt-6 w-full bg-[#C9A15A] hover:bg-[#E4C989] text-[#0A2A20] font-semibold py-2.5 rounded-lg transition-colors disabled:opacity-50"
        >
          {saving ? "Ajout..." : "Ajouter l'employe"}
        </button>
      </form>

      {loading ? (
        <p className="text-[#F3EFE3]/60">Chargement...</p>
      ) : (
        <div className="border border-[#C9A15A]/20 rounded-2xl overflow-x-auto">
          <table className="w-full text-sm text-[#F3EFE3]">
            <thead className="bg-[#0E3A2B] text-[#C9A15A] text-left">
              <tr>
                <th className="px-4 py-3">Nom</th>
                <th className="px-4 py-3">Poste</th>
                <th className="px-4 py-3">Telephone</th>
                <th className="px-4 py-3">Salaire de base</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#C9A15A]/10">
              {employees.map((emp) => (
                <tr key={emp.id}>
                  <td className="px-4 py-3">{emp.full_name}</td>
                  <td className="px-4 py-3">{emp.position || "-"}</td>
                  <td className="px-4 py-3">{emp.phone || "-"}</td>
                  <td className="px-4 py-3">{emp.base_salary ? `${emp.base_salary.toLocaleString("fr-FR")} FCFA` : "-"}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => handleDelete(emp.id, emp.full_name)} className="text-red-400 hover:text-red-300" aria-label="Supprimer">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              {employees.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-[#F3EFE3]/50">
                    Aucun employe enregistre.
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
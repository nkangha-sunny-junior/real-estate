"use client";

import { useEffect, useState, FormEvent } from "react";
import Link from "next/link";
import { Trash2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface Employee {
  id: string;
  full_name: string;
  position: string | null;
  base_salary: number | null;
}

interface Payslip {
  id: string;
  month: string;
  net_pay: number;
  employees: { full_name: string } | null;
}

const emptyForm = { employee_id: "", month: new Date().toISOString().slice(0, 7), base_salary: "", allowances: "0", deductions: "0", notes: "" };

export default function PayslipsPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [payslips, setPayslips] = useState<Payslip[]>([]);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);

  async function loadData() {
    const { data: empData } = await supabase.from("employees").select("id, full_name, position, base_salary").order("full_name");
    setEmployees((empData as Employee[]) ?? []);

    const { data: slipData } = await supabase
      .from("payslips")
      .select("id, month, net_pay, employees(full_name)")
      .order("created_at", { ascending: false });
    setPayslips((slipData as unknown as Payslip[]) ?? []);
  }

  useEffect(() => {
    loadData();
  }, []);

  function selectEmployee(id: string) {
    const emp = employees.find((e) => e.id === id);
    setForm({ ...form, employee_id: id, base_salary: emp?.base_salary ? String(emp.base_salary) : "" });
  }

  const netPay = Number(form.base_salary || 0) + Number(form.allowances || 0) - Number(form.deductions || 0);

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    if (!form.employee_id) {
      alert("Choisissez un employe.");
      return;
    }
    setSaving(true);

    const { data: slip, error } = await supabase
      .from("payslips")
      .insert({
        employee_id: form.employee_id,
        month: form.month,
        base_salary: Number(form.base_salary || 0),
        allowances: Number(form.allowances || 0),
        deductions: Number(form.deductions || 0),
        net_pay: netPay,
        notes: form.notes || null,
      })
      .select()
      .single();

    if (error) {
      alert("Erreur: " + error.message);
      setSaving(false);
      return;
    }

    // Automatically log this as a company expense, so it flows into
    // the Bilan / dashboard revenue calculations as a cost, not just
    // sitting isolated in the payslips table.
    const employee = employees.find((emp) => emp.id === form.employee_id);
    await supabase.from("expenses").insert({
      category: "payroll",
      description: `Salaire - ${employee?.full_name ?? ""} (${form.month})`,
      amount: netPay,
      expense_date: `${form.month}-01`,
      employee_id: form.employee_id,
    });

    setSaving(false);
    setForm({ ...emptyForm, month: form.month });
    loadData();
  }

  async function handleDelete(id: string) {
    if (!confirm("Supprimer cette fiche de paie ?")) return;
    await supabase.from("payslips").delete().eq("id", id);
    loadData();
  }

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-bold text-[#F3EFE3] mb-6">Fiches de paie</h1>

      <form onSubmit={handleCreate} className="bg-[#0E3A2B] border border-[#C9A15A]/20 rounded-2xl p-6 mb-8">
        <h2 className="text-[#C9A15A] text-sm font-semibold tracking-wide mb-5">NOUVELLE FICHE</h2>
        <div className="grid sm:grid-cols-2 gap-5">
          <Field label="Employe" span2>
            <select value={form.employee_id} onChange={(e) => selectEmployee(e.target.value)} required className="input">
              <option value="">-- Choisir --</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>{emp.full_name}{emp.position ? ` (${emp.position})` : ""}</option>
              ))}
            </select>
          </Field>
          <Field label="Mois">
            <input type="month" value={form.month} onChange={(e) => setForm({ ...form, month: e.target.value })} required className="input" />
          </Field>
          <Field label="Salaire de base (FCFA)">
            <input type="number" value={form.base_salary} onChange={(e) => setForm({ ...form, base_salary: e.target.value })} required className="input" />
          </Field>
          <Field label="Primes (optionnel)">
            <input type="number" value={form.allowances} onChange={(e) => setForm({ ...form, allowances: e.target.value })} className="input" />
          </Field>
          <Field label="Deductions (optionnel)">
            <input type="number" value={form.deductions} onChange={(e) => setForm({ ...form, deductions: e.target.value })} className="input" />
          </Field>
        </div>

        <p className="mt-4 text-[#F3EFE3]/70 text-sm">
          Net a payer: <span className="text-[#C9A15A] font-semibold">{netPay.toLocaleString("fr-FR")} FCFA</span>
        </p>

        <button
          type="submit"
          disabled={saving}
          className="mt-4 w-full bg-[#C9A15A] hover:bg-[#E4C989] text-[#0A2A20] font-semibold py-2.5 rounded-lg transition-colors disabled:opacity-50"
        >
          {saving ? "Enregistrement..." : "Creer la fiche de paie"}
        </button>
      </form>

      <div className="border border-[#C9A15A]/20 rounded-2xl overflow-x-auto">
        <table className="w-full text-sm text-[#F3EFE3]">
          <thead className="bg-[#0E3A2B] text-[#C9A15A] text-left">
            <tr>
              <th className="px-4 py-3">Employe</th>
              <th className="px-4 py-3">Mois</th>
              <th className="px-4 py-3">Net paye</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#C9A15A]/10">
            {payslips.map((p) => (
              <tr key={p.id}>
                <td className="px-4 py-3">{p.employees?.full_name ?? "-"}</td>
                <td className="px-4 py-3">{p.month}</td>
                <td className="px-4 py-3">{Number(p.net_pay).toLocaleString("fr-FR")} FCFA</td>
                <td className="px-4 py-3 flex items-center gap-3">
                  <Link href={`/admin/payslips/${p.id}/print`} className="text-[#C9A15A] hover:underline">
                    Imprimer
                  </Link>
                  <button onClick={() => handleDelete(p.id)} className="text-red-400 hover:text-red-300" aria-label="Supprimer">
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
            {payslips.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-[#F3EFE3]/50">
                  Aucune fiche enregistree.
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
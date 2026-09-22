"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import PrintButton from "@/components/PrintButton";

interface PayslipData {
  id: string;
  month: string;
  base_salary: number;
  allowances: number;
  deductions: number;
  net_pay: number;
  notes: string | null;
  employees: { full_name: string; position: string | null } | null;
}

export default function PayslipPrintPage() {
  const params = useParams();
  const id = params.id as string;
  const [slip, setSlip] = useState<PayslipData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("payslips")
        .select("id, month, base_salary, allowances, deductions, net_pay, notes, employees(full_name, position)")
        .eq("id", id)
        .single();
      setSlip(data as unknown as PayslipData);
      setLoading(false);
    }
    load();
  }, [id]);

  if (loading) return <p className="text-center text-[#F3EFE3]/60 py-20">Chargement...</p>;
  if (!slip) return <p className="text-center text-red-400 py-20">Fiche introuvable.</p>;

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
        <div style={{ paddingTop: "50mm", paddingBottom: "30mm", paddingLeft: "22mm", paddingRight: "22mm" }}>
          <h1 className="text-center font-bold text-lg mb-8 underline">
            BULLETIN DE PAIE
          </h1>

          <div className="grid grid-cols-2 gap-4 mb-8 text-sm">
            <div>
              <p className="text-black/50">Employe</p>
              <p className="font-semibold">{slip.employees?.full_name}</p>
            </div>
            <div>
              <p className="text-black/50">Poste</p>
              <p className="font-semibold">{slip.employees?.position ?? "-"}</p>
            </div>
            <div>
              <p className="text-black/50">Periode</p>
              <p className="font-semibold">{slip.month}</p>
            </div>
          </div>

          <table className="w-full text-sm border-collapse mb-8">
            <tbody>
              <tr className="border-b border-black/10">
                <td className="py-2">Salaire de base</td>
                <td className="py-2 text-right">{Number(slip.base_salary).toLocaleString("fr-FR")} FCFA</td>
              </tr>
              <tr className="border-b border-black/10">
                <td className="py-2">Primes</td>
                <td className="py-2 text-right">{Number(slip.allowances).toLocaleString("fr-FR")} FCFA</td>
              </tr>
              <tr className="border-b border-black/10">
                <td className="py-2">Deductions</td>
                <td className="py-2 text-right">- {Number(slip.deductions).toLocaleString("fr-FR")} FCFA</td>
              </tr>
              <tr className="border-t-2 border-black">
                <td className="py-3 font-bold">Net a payer</td>
                <td className="py-3 text-right font-bold">{Number(slip.net_pay).toLocaleString("fr-FR")} FCFA</td>
              </tr>
            </tbody>
          </table>

          {slip.notes && <p className="text-sm mb-8">{slip.notes}</p>}

          <p className="mt-16 text-sm">Signature de l&apos;employe</p>
          <p className="mt-10 text-sm">Signature VISION-H</p>
        </div>
      </div>
    </div>
  );
}
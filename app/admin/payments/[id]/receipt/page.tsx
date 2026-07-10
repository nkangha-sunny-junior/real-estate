"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import PrintButton from "@/components/PrintButton";

interface PaymentDetails {
  amount_in_words?: string;
  superficie_m2?: string;
  bloc?: string;
  location?: string;
  price_per_m2?: string;
  remaining_balance?: string;
  remaining_balance_words?: string;
  remaining_installments?: string;
}

interface PaymentData {
  id: string;
  amount: number;
  payment_date: string;
  details: PaymentDetails | null;
  clients: { full_name: string } | null;
}

export default function ReceiptPrintPage() {
  const params = useParams();
  const id = params.id as string;
  const [payment, setPayment] = useState<PaymentData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("payments")
        .select("id, amount, payment_date, details, clients(full_name)")
        .eq("id", id)
        .single();
      setPayment(data as unknown as PaymentData);
      setLoading(false);
    }
    load();
  }, [id]);

  if (loading) return <p className="text-center text-[#F3EFE3]/60 py-20">Chargement...</p>;
  if (!payment) return <p className="text-center text-red-400 py-20">Recu introuvable.</p>;

  const d = payment.details ?? {};
  const payerName = payment.clients?.full_name ?? "..............................";

  return (
    <div className="bg-[#0A2A20] min-h-screen py-8">
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
        <div style={{ paddingTop: "58mm", paddingBottom: "38mm", paddingLeft: "22mm", paddingRight: "22mm" }}>
          <h1 className="text-center font-bold text-lg mb-8 underline">
            RECU DE VERSEMENT
          </h1>

          <p className="text-justify leading-relaxed mb-6">
            Recu de <strong>{payerName}</strong> ayant effectue ce jour le
            versement de la somme de <strong>{d.amount_in_words}</strong>{" "}
            ({Number(payment.amount).toLocaleString("fr-FR")}) Frs CFA
            representant l&apos;acompte en vue de l&apos;achat d&apos;une
            parcelle de terrain, d&apos;une superficie de{" "}
            <strong>{d.superficie_m2} metres carres</strong> situe au
            lieu-dit <strong>{d.location}</strong>, sur la base de{" "}
            <strong>{d.price_per_m2} FCFA</strong> par metre carre.
          </p>

          <p className="mb-6">
            Ce recu leur est donne pour servir et valoir ce que de droit.
          </p>

          {d.remaining_balance && (
            <p className="mb-2">
              <strong>Reste a Payer :</strong>{" "}
              {Number(d.remaining_balance).toLocaleString("fr-FR")}{" "}
              {d.remaining_balance_words ? `(${d.remaining_balance_words})` : ""} Francs
              CFA reparti ainsi qu&apos;il suit :
            </p>
          )}

          {d.remaining_installments && (
            <ul className="list-disc pl-6 mb-6">
              {d.remaining_installments.split("\n").filter(Boolean).map((line, i) => (
                <li key={i}>{line}</li>
              ))}
            </ul>
          )}

          <p className="mt-10">Fait a Douala le {payment.payment_date}</p>
        </div>
      </div>
    </div>
  );
}
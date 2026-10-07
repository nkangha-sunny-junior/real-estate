"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, Save } from "lucide-react";
import { supabase } from "@/lib/supabase";
import PrintButton from "@/components/PrintButton";

interface PaymentDetails {
  amount_in_words?: string;
  superficie_m2?: string;
  bloc?: string;
  location?: string;
  tf_number?: string;
  price_per_m2?: string;
  remaining_balance?: string;
  remaining_balance_words?: string;
  remaining_installments?: string;
  bornage_fee?: string;
}

interface PaymentData {
  id: string;
  amount: number;
  payment_date: string;
  details: PaymentDetails | null;
  clients: { full_name: string } | null;
  receipt_html: string | null;
}

export default function ReceiptPrintPage() {
  const params = useParams();
  const id = params.id as string;
  const [payment, setPayment] = useState<PaymentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [bodyHtml, setBodyHtml] = useState("");
  const editableRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("payments")
        .select("id, amount, payment_date, details, receipt_html, clients(full_name)")
        .eq("id", id)
        .single();
      const p = data as unknown as PaymentData;
      setPayment(p);

      if (p) {
        // If a saved/edited version already exists, load exactly that —
        // never overwrite someone's manual edits by regenerating from
        // the template again. Only build fresh text the FIRST time.
        if (p.receipt_html) {
          setBodyHtml(p.receipt_html);
        } else {
          const d = p.details ?? {};
          const payerName = p.clients?.full_name ?? "..............................";
          let text = `Recu de ${payerName} ayant effectue ce jour le versement de la somme de ${d.amount_in_words ?? ""} (${Number(p.amount).toLocaleString("fr-FR")}) Frs CFA representant l'acompte en vue de l'achat d'une parcelle de terrain, d'une superficie de ${d.superficie_m2 ?? ""} metres carres situe au lieu-dit ${d.location ?? ""}, morcele dans le TF ${d.tf_number ?? ""}, sur la base de ${d.price_per_m2 ?? ""} FCFA par metre carre.\n\nCe recu leur est donne pour servir et valoir ce que de droit.`;

          if (d.bornage_fee) {
            text += `\n\nFrais de bornage : ${Number(d.bornage_fee).toLocaleString("fr-FR")} Francs CFA`;
          }
          if (d.remaining_balance) {
            text += `\n\nReste a Payer : ${Number(d.remaining_balance).toLocaleString("fr-FR")}${d.remaining_balance_words ? ` (${d.remaining_balance_words})` : ""} Francs CFA reparti ainsi qu'il suit :`;
          }
          if (d.remaining_installments) {
            text += `\n${d.remaining_installments}`;
          }
          text += `\n\nFait a Douala le ${p.payment_date}`;

          // Convert plain newlines to <br> once, up front, since we're
          // switching to innerHTML-based storage/rendering.
          setBodyHtml(text.replace(/\n/g, "<br>"));
        }
      }
      setLoading(false);
    }
    load();
  }, [id]);

  function applyFormat(command: string) {
    editableRef.current?.focus();
    document.execCommand(command, false);
  }

  async function handleSave() {
    if (!editableRef.current) return;
    setSaving(true);
    const html = editableRef.current.innerHTML;
    const { error } = await supabase.from("payments").update({ receipt_html: html }).eq("id", id);
    setSaving(false);
    if (error) {
      alert("Erreur: " + error.message);
      return;
    }
    setSavedAt(new Date().toLocaleTimeString("fr-FR"));
  }

  if (loading) return <p className="text-center text-[#F3EFE3]/60 py-20">Chargement...</p>;
  if (!payment) return <p className="text-center text-red-400 py-20">Recu introuvable.</p>;

  return (
    <div className="bg-[#0A2A20] min-h-screen py-8 print:bg-white print:min-h-0 print:py-0">
      <div className="max-w-4xl mx-auto px-6 mb-4 print:hidden">
        <div className="flex items-center gap-3 flex-wrap">
          <PrintButton />
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 bg-[#0E3A2B] border border-[#C9A15A]/30 hover:border-[#C9A15A] text-[#F3EFE3] px-4 py-2.5 rounded-lg text-sm transition-colors disabled:opacity-50"
          >
            <Save size={16} />
            {saving ? "Enregistrement..." : "Enregistrer les modifications"}
          </button>
          {savedAt && (
            <span className="text-[#C9A15A] text-xs">Enregistre a {savedAt}</span>
          )}
        </div>

        <div className="flex items-center gap-1 mt-3 bg-[#0E3A2B] border border-[#C9A15A]/20 rounded-lg p-1.5 w-fit">
          <ToolbarButton onClick={() => applyFormat("bold")} label="Gras">
            <Bold size={16} />
          </ToolbarButton>
          <ToolbarButton onClick={() => applyFormat("italic")} label="Italique">
            <Italic size={16} />
          </ToolbarButton>
          <ToolbarButton onClick={() => applyFormat("underline")} label="Souligne">
            <Underline size={16} />
          </ToolbarButton>
          <div className="w-px h-5 bg-[#C9A15A]/20 mx-1" />
          <ToolbarButton onClick={() => applyFormat("justifyLeft")} label="Aligner a gauche">
            <AlignLeft size={16} />
          </ToolbarButton>
          <ToolbarButton onClick={() => applyFormat("justifyCenter")} label="Centrer">
            <AlignCenter size={16} />
          </ToolbarButton>
          <ToolbarButton onClick={() => applyFormat("justifyRight")} label="Aligner a droite">
            <AlignRight size={16} />
          </ToolbarButton>
        </div>

        <p className="text-[#F3EFE3]/50 text-xs mt-2">
          Modifiez le texte, puis cliquez sur &quot;Enregistrer&quot; pour sauvegarder vos changements avant impression.
        </p>
      </div>

      {/* Widened from 210mm (standard A4) to 260mm, and side padding
          reduced, so longer receipt text has more breathing room per
          line instead of wrapping into a narrow, cramped column. */}
      <div
        className="mx-auto bg-white text-black shadow-xl print:shadow-none"
        style={{
          width: "210mm",
          minHeight: "297mm",
          backgroundImage: "url(/vision-h-letterhead.jpg)",
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "top center",
        }}
      >
        <div style={{ paddingTop: "58mm", paddingBottom: "38mm", paddingLeft: "15mm", paddingRight: "15mm" }}>
          <h1 className="text-center font-bold text-lg mb-8 underline">
            RECU DE VERSEMENT
          </h1>

          <div
            ref={editableRef}
            contentEditable
            suppressContentEditableWarning
            dangerouslySetInnerHTML={{ __html: bodyHtml }}
            className="text-sm leading-relaxed text-justify outline-none focus:ring-2 focus:ring-red-200 rounded p-2 -m-2 print:ring-0 print:p-0 print:m-0"
          />
        </div>
      </div>
    </div>
  );
}

function ToolbarButton({
  onClick,
  label,
  children,
}: {
  onClick: () => void;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onMouseDown={(e) => {
        e.preventDefault();
        onClick();
      }}
      title={label}
      aria-label={label}
      className="p-2 rounded text-[#F3EFE3]/80 hover:bg-[#C9A15A]/20 hover:text-[#C9A15A] transition-colors"
    >
      {children}
    </button>
  );
}

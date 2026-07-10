"use client";

export default function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="bg-[#C9A15A] hover:bg-[#E4C989] text-[#0A2A20] font-semibold px-6 py-2.5 rounded-lg transition-colors"
    >
      Imprimer / Enregistrer en PDF
    </button>
  );
}
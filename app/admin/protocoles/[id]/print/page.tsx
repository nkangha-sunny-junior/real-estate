"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import PrintButton from "@/components/PrintButton";

interface ProtocoleDetails {
  vendeur_rep_name?: string;
  partner_company?: string;
  partner_address?: string;
  partner_rep_name?: string;
  title_numbers?: string;
  location?: string;
  superficie?: string;
  price_per_m2?: string;
  bank_account?: string;
  duree?: string;
}

interface ProtocoleData {
  id: string;
  signed_date: string | null;
  details: ProtocoleDetails | null;
}

// Each "page" is its own fixed A4-sized block with its own copy of the
// letterhead background — this guarantees the logo always sits at the
// top and the footer always sits at the bottom of EVERY page, instead
// of one stretched image getting cut awkwardly across a page break.
function LetterheadPage({ children, breakAfter }: { children: React.ReactNode; breakAfter?: boolean }) {
  return (
    <div
      className="mx-auto bg-white text-black shadow-xl print:shadow-none"
      style={{
        width: "210mm",
        minHeight: "297mm",
        backgroundImage: "url(/vision-h-letterhead.jpg)",
        backgroundSize: "cover",
        backgroundPosition: "top center",
        breakAfter: breakAfter ? "page" : "auto",
        marginBottom: breakAfter ? 0 : "8mm",
      }}
    >
      <div
        className="print:text-[13px] print:leading-snug"
        style={{ paddingTop: "48mm", paddingBottom: "28mm", paddingLeft: "20mm", paddingRight: "20mm" }}
      >
        {children}
      </div>
    </div>
  );
}

export default function ProtocolePrintPage() {
  const params = useParams();
  const id = params.id as string;
  const [protocole, setProtocole] = useState<ProtocoleData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("contracts")
        .select("id, signed_date, details")
        .eq("id", id)
        .single();
      setProtocole(data as unknown as ProtocoleData);
      setLoading(false);
    }
    load();
  }, [id]);

  if (loading) return <p className="text-center text-[#F3EFE3]/60 py-20">Chargement...</p>;
  if (!protocole) return <p className="text-center text-red-400 py-20">Protocole introuvable.</p>;

  const d = protocole.details ?? {};

  return (
    <div className="bg-[#0A2A20] min-h-screen py-8 print:bg-white print:min-h-0 print:py-0">
      <div className="max-w-3xl mx-auto px-6 mb-4 print:hidden">
        <PrintButton />
      </div>

      {/* PAGE 1: title, parties, expose, articles 1-2 */}
      <LetterheadPage breakAfter>
        <p className="text-center font-bold underline mb-4">PROTOCOLE D&apos;ACCORD</p>

        <p className="mb-2">Entre</p>
        <p className="mb-3 text-justify leading-relaxed">
          VISION-H Sarl dont le siege social est a Douala Makepe,
          representee par sieur <strong>{d.vendeur_rep_name}</strong> ;
        </p>
        <p className="mb-4">
          Designes dans la presente : « <strong>Le vendeur</strong> » —{" "}
          <span className="italic">D&apos;une part</span>
        </p>

        <p className="mb-2">Et de</p>
        <p className="mb-3 text-justify leading-relaxed">
          <strong>{d.partner_company}</strong> dont le siege social est a{" "}
          {d.partner_address}, representee par sieur{" "}
          <strong>{d.partner_rep_name}</strong> ;
        </p>
        <p className="mb-6">
          Designe dans la presente : « <strong>Le partenaire</strong> » —{" "}
          <span className="italic">D&apos;autre part</span>
        </p>

        <p className="font-bold underline mb-2">EXPOSE</p>
        <p className="mb-3 text-justify leading-relaxed">
          Le vendeur est une societe civile immobiliere qui est
          proprietaire ou gestionnaire de plusieurs titres fonciers sur
          lesquels il a pouvoir de vendre, notamment les titres fonciers
          n{d.title_numbers} pour des parcelles de terres situees a{" "}
          {d.location}.
        </p>
        <p className="mb-6 text-justify leading-relaxed">
          Le Partenaire lui a donc presente des acheteurs potentiels et
          dans le cadre de cette operation prevue pour durer {d.duree},
          les parties ont entendu formaliser leur relation et il a ete
          convenu ce qui suit :
        </p>

        <p className="font-bold underline mb-2">ARTICLE 1 : OBJET DE L&apos;ACCORD</p>
        <p className="mb-6 text-justify leading-relaxed">
          Le vendeur a confie la charge de commercialiser les terres dont
          il est proprietaire ou qu&apos;il a le pouvoir de vendre,
          notamment <strong>{d.superficie}</strong> a l&apos;acquereur a
          prelever dans les titres fonciers {d.title_numbers} a{" "}
          {d.location}.
        </p>

        <p className="font-bold underline mb-2">ARTICLE 2 : CONDITIONS</p>
        <p className="text-justify leading-relaxed">
          Le vendeur a cede au partenaire a la somme forfaitaire de{" "}
          <strong>{d.price_per_m2} FCFA/m2</strong>, a charge pour lui
          d&apos;obtenir un prix plus eleve dont il fera le surplus
          sien.
        </p>
      </LetterheadPage>

      {/* PAGE 2: articles 3-7, signature */}
      <LetterheadPage>
        <p className="font-bold underline mb-2">ARTICLE 3 : OBLIGATIONS DES PARTIES</p>
        <p className="mb-1"><strong>1. Le vendeur doit :</strong></p>
        <ul className="list-disc pl-6 mb-3 space-y-0.5">
          <li>Produire la documentation attestant de la propriete du site vendu et de son pouvoir de vendre ;</li>
          <li>Mettre le terrain vendu a la disposition de l&apos;acquereur ;</li>
          <li>Ouvrir les voies d&apos;acces pour chaque lot vendu ;</li>
          <li>Signer les documents de cession pour chaque lot vendu et entierement paye ;</li>
        </ul>
        <p className="mb-1"><strong>2. Le Partenaire doit :</strong></p>
        <ul className="list-disc pl-6 mb-6 space-y-0.5">
          <li>Servir de relais entre le vendeur et l&apos;acquereur ;</li>
          <li>Superviser la comptabilisation des versements individualises ;</li>
          <li>Coordonner la signature des documents de vente et superviser le bornage de chaque lot entierement paye ;</li>
          <li>Tenir des dossiers pour chaque lot ;</li>
          <li>Mettre toutes les informations en sa possession a l&apos;attention du vendeur et de l&apos;acquereur ;</li>
        </ul>

        <p className="font-bold underline mb-2">ARTICLE 4 : PAIEMENT</p>
        <p className="mb-6 text-justify leading-relaxed">
          Les paiements se feront dans le compte {d.bank_account} du vendeur.
        </p>

        <p className="font-bold underline mb-2">ARTICLE 5 : SIGNATURE DES DOCUMENTS</p>
        <p className="mb-6 text-justify leading-relaxed">
          Le vendeur s&apos;engage a signer les documents de morcellement
          sur indication du partenaire pour chaque lot integralement
          paye. En cas de refus ou de resistance de sa part, le
          Partenaire pourra obtenir le morcellement judiciaire sur
          presentation des recus de paiement du lot concerne. Le
          partenaire est le responsable de l&apos;initiative du bornage
          et coordonnera toutes les operations.
        </p>

        <p className="font-bold underline mb-2">ARTICLE 6 : DOMICILE</p>
        <p className="mb-6 text-justify leading-relaxed">
          Les parties elisent domicile en leurs demeures respectives.
          Toutes les significations et notifications faites a ces
          domiciles en cas de litige seront valables.
        </p>

        <p className="font-bold underline mb-2">ARTICLE 7 : FORMALITES</p>
        <p className="mb-8 text-justify leading-relaxed">
          La presente convention est etablie en 02 exemplaires originaux
          que les parties ont signe par devant temoins au titre
          d&apos;engagement solennel de satisfaire a leurs obligations
          reciproques, aux memes jour, mois et heure que ci-dessous.
        </p>

        <p className="mb-10">Fait a Douala, le {protocole.signed_date}</p>

        <div className="flex justify-between">
          <p className="underline">Pour LE VENDEUR</p>
          <p className="underline">Pour le PARTENAIRE</p>
        </div>
      </LetterheadPage>
    </div>
  );
}
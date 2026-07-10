"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import PrintButton from "@/components/PrintButton";

interface ContractDetails {
  civility?: string;
  address?: string;
  birth_date?: string;
  birth_place?: string;
  id_number?: string;
  id_issue_date?: string;
  nationality?: string;
  site_name?: string;
  title_numbers?: string;
  price_per_m2?: string;
}

interface ContractData {
  id: string;
  signed_date: string | null;
  details: ContractDetails | null;
  clients: { full_name: string } | null;
}

export default function ContractPrintPage() {
  // useParams() reads the [id] segment from the URL directly in the browser —
  // this replaces the `params` prop we used in Server Component pages.
  const params = useParams();
  const id = params.id as string;

  const [contract, setContract] = useState<ContractData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("contracts")
        .select("id, signed_date, details, clients(full_name)")
        .eq("id", id)
        .single();
      setContract(data as unknown as ContractData);
      setLoading(false);
    }
    load();
  }, [id]);

  if (loading) {
    return <p className="text-center text-[#F3EFE3]/60 py-20">Chargement...</p>;
  }

  if (!contract) {
    return <p className="text-center text-red-400 py-20">Contrat introuvable.</p>;
  }

  const d = contract.details ?? {};
  const partnerName = contract.clients?.full_name ?? "..............................";

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
        <p className="text-center font-bold underline mb-6">CONTRAT DE PARTENARIAT</p>
        <p className="font-bold mb-4">ENTRE LES SOUSSIGNES</p>

        <p className="mb-4 text-justify leading-relaxed">
          <strong>La Societe A Responsabilite Limitee VISION-H Sarl</strong> au
          capital de 1 000 000 (un million) de F.CFA, dont le siege social
          est a Douala, Immatricule au Registre du Commerce et du Credit
          Mobilier de Douala sous le numero RC/DLN/2021/B/690, representee
          aux fins des presentes par son gerant : Monsieur NZITCHOUA
          TOTCHET Hermes, demeurant a Douala-Logpom, ne le vingt-huit mai
          mil neuf cent soixante-dix a Manjo, fils de TOTCHET David et de
          TONKEU Rose, titulaire de la carte nationale d&apos;identite
          numero AA10751311, a lui delivree le vingt-sept mai deux mil
          vingt-cinq, de nationalite Camerounaise.
        </p>
        <p className="mb-6">
          Ci-apres designes « <strong>Apporteur de Marche</strong> »
          <br />
          <span className="italic">D&apos;UNE PART</span>
        </p>

        <p className="mb-4 text-justify leading-relaxed">
          <strong>{d.civility} {partnerName}</strong>, demeurant a{" "}
          {d.address}, ne le {d.birth_date} a {d.birth_place}, titulaire de
          la Carte Nationale d&apos;Identite {d.id_number} a lui delivre le{" "}
          {d.id_issue_date}, de nationalite {d.nationality}.
        </p>
        <p className="mb-6">
          Ci-apres designes « <strong>Partenaire D&apos;Affaires</strong> »
          <br />
          <span className="italic">D&apos;AUTRE PART</span>
        </p>

        <p className="mb-6">Il a ete arrete entre les deux parties ce qui suit :</p>

        <p className="font-bold underline mb-2">ARTICLE I : OBJET DU PARTENARIAT</p>
        <p className="mb-6 text-justify leading-relaxed">
          Ce contrat est destine a regir de la maniere la plus complete
          possible la relation de partenariat conclue entre
          l&apos;Entreprise <strong>VISION-H SARL</strong> et {d.civility}{" "}
          {partnerName} en vue principalement de la vente des terrains du
          site situe au lieu-dit {d.site_name} objet des TF{" "}
          {d.title_numbers} dont VISION-H est proprietaire. Ce contrat
          precise de facon non exhaustive les droits et obligations des
          deux partenaires etant entendu que ceux-ci peuvent evoluer au
          fil du temps. L&apos;Objectif principal etant que le
          partenariat qui unit les deux parties se developpe au maximum
          et dans l&apos;interet de chacun.
        </p>

        <p className="font-bold underline mb-2">ARTICLE I : OBLIGATION DE L&apos;APPORTEUR</p>
        <p className="mb-6 text-justify leading-relaxed">
          De maniere generale <strong>La Societe VISION-H SARL</strong>{" "}
          s&apos;engage a mettre a la disposition de {d.civility}{" "}
          {partnerName}, les parcelles de terrains des titres fonciers
          suscites au prix exclusif de {d.price_per_m2} Francs CFA le
          metre Carre. Pour ce faire la Societe VISION-H SARL mettra a la
          disposition du partenaire d&apos;affaires toute la
          documentation necessaire pour la bonne execution du Contrat.
        </p>

        <p className="font-bold underline mb-2">ARTICLE II : OBLIGATION DU PARTENAIRE AFFAIRE</p>
        <p className="mb-8 text-justify leading-relaxed">
          Le Partenaire s&apos;engage en contrepartie a verser a VISION-H
          SARL la somme de {d.price_per_m2} Francs CFA par metre Carre
          vendu sur les dit titres fonciers. L&apos;Excedent realiser sur
          le prix fixe entre les deux parties reviennent exclusivement a{" "}
          {d.civility} {partnerName}.
        </p>

        <p className="underline mb-10">
          Fait a Douala le {contract.signed_date} en 02 Exemplaires
        </p>

        <div className="flex justify-between mt-16">
          <p className="underline">VISION-H SARL</p>
          <p className="underline">{d.civility} {partnerName}</p>
       </div>
        </div>
      </div>
    </div>
  );
}
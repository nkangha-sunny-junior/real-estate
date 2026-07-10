import Link from "next/link";
import { Fraunces, IBM_Plex_Mono } from "next/font/google";
import { supabase } from "@/lib/supabase";

const fraunces = Fraunces({ subsets: ["latin"], weight: ["600", "700"] });
const mono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "500"] });

export const metadata = {
  title: "Vision-H | Votre Terre, Votre Avenir, Votre Priorite",
  description:
    "Investissez dans le foncier a Douala. Terrains residentiels et commerciaux a prix accessible, avec accompagnement juridique.",
};

export default async function HomePage() {
  const { data: featured } = await supabase
    .from("listings")
    .select("*")
    .eq("is_available", true)
    .order("created_at", { ascending: false })
    .limit(3);

  return (
    <main className="bg-[#0A2A20] text-[#F3EFE3]">
      <nav className="max-w-6xl mx-auto flex items-center justify-between px-6 py-6">
        <img src="/vision-h-logo.png" alt="Vision-H" className="h-10 w-auto" />
        <div className="flex gap-6 text-sm">
          <Link href="/listings" className="hover:text-[#C9A15A] transition-colors">
            Terrains
          </Link>
          <a href="#contact" className="hover:text-[#C9A15A] transition-colors">
            Contact
          </a>
        </div>
      </nav>

      <section className="max-w-6xl mx-auto px-6 pt-16 pb-24 text-center">
        <p className={mono.className + " text-xs tracking-[0.2em] text-[#C9A15A] mb-6"}>
          FONCIER ET INVESTISSEMENT - DOUALA
        </p>
        <h1 className={fraunces.className + " text-4xl sm:text-6xl leading-tight text-[#C9A15A] mb-6"}>
          Votre Terre, Votre Avenir, Votre Priorite
        </h1>
        <p className="max-w-xl mx-auto text-[#F3EFE3]/80 mb-10 leading-relaxed">
          Le foncier est la base de toute richesse. La ville s&apos;etend, les prix
          augmentent. Soyez les batisseurs de demain, pas de simples locataires.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/listings"
            className="bg-[#C9A15A] text-[#0A2A20] font-semibold px-8 py-3 rounded-lg hover:bg-[#E4C989] transition-colors"
          >
            Voir les terrains disponibles
          </Link>
          <a
            href="#contact"
            className="border border-[#C9A15A] text-[#C9A15A] font-semibold px-8 py-3 rounded-lg hover:bg-[#C9A15A]/10 transition-colors"
          >
            Nous contacter
          </a>
        </div>
      </section>

      <section className="bg-[#F3EFE3] text-[#14201B]">
        <div className="max-w-6xl mx-auto px-6 py-20 grid sm:grid-cols-2 gap-10">
          <div>
            <h2 className={fraunces.className + " text-2xl mb-3"}>
              Un investissement accessible et sur
            </h2>
            <p className="text-[#14201B]/70 leading-relaxed">
              Pour votre famille et vos projets. Investissez dans le foncier
              pour votre emancipation economique, avec des offres pensees pour
              les jeunes de Douala.
            </p>
          </div>
          <div>
            <h2 className={fraunces.className + " text-2xl mb-3"}>
              Accompagnement complet
            </h2>
            <p className="text-[#14201B]/70 leading-relaxed">
              Plan de paiement echelonne pour les moins de 35 ans, conseils
              juridiques et gestion de patrimoine offerts avec chaque
              acquisition.
            </p>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="flex items-center gap-3 mb-10">
          <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
            <circle cx="18" cy="18" r="17" stroke="#C9A15A" strokeWidth="1.5" />
            <circle cx="14" cy="18" r="4.5" stroke="#C9A15A" strokeWidth="1.5" />
            <rect x="18" y="17" width="10" height="2" fill="#C9A15A" />
            <rect x="24" y="14" width="2" height="3" fill="#C9A15A" />
            <rect x="27" y="14" width="2" height="3" fill="#C9A15A" />
          </svg>
          <h2 className={fraunces.className + " text-2xl text-[#C9A15A]"}>
            Terrains en vedette
          </h2>
        </div>

        <div className="divide-y divide-[#C9A15A]/20 border-t border-b border-[#C9A15A]/20">
          {featured?.map((land) => (
            <div
              key={land.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between py-5 gap-2"
            >
              <div>
                <p className="font-medium">{land.title}</p>
                <p className="text-sm text-[#F3EFE3]/60">{land.location}</p>
              </div>
              <div className={mono.className + " text-sm text-[#C9A15A] flex gap-6"}>
                {land.size_hectares && <span>{land.size_hectares} ha</span>}
                <span>{Number(land.price_per_m2).toLocaleString("fr-FR")} FCFA/m2</span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center">
          <Link
            href="/listings"
            className="text-[#C9A15A] hover:text-[#E4C989] underline underline-offset-4"
          >
            Voir tous les terrains
          </Link>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-20 grid sm:grid-cols-2 gap-12 items-center">
        <img
          src="/vision-h-team.jpg"
          alt="Equipe Vision-H sur le terrain"
          className="rounded-2xl border-2 border-[#C9A15A]/30 shadow-lg w-full h-auto object-cover"
        />
        <div>
          <p className={mono.className + " text-xs tracking-[0.2em] text-[#C9A15A] mb-4"}>
            NOTRE EQUIPE
          </p>
          <h2 className={fraunces.className + " text-3xl text-[#C9A15A] mb-4"}>
            Sur le terrain, a vos cotes
          </h2>
          <p className="text-[#F3EFE3]/80 leading-relaxed">
            Notre equipe accompagne chaque client, de la premiere visite du
            terrain jusqu a la signature, avec un suivi juridique complet et
            une gestion transparente de votre patrimoine.
          </p>
        </div>
      </section>

      <section id="contact" className="bg-[#C9A15A] text-[#0A2A20]">
        <div className="max-w-6xl mx-auto px-6 py-16 text-center">
          <h2 className={fraunces.className + " text-2xl sm:text-3xl mb-6"}>
            Prenez contact pour une seance d&apos;information gratuite
          </h2>
          <p className={mono.className + " text-lg mb-2"}>
            +237 690 614 652 / 691 050 954
          </p>
          <p className={mono.className + " text-sm"}>vision-h@gmail.com</p>
        </div>
      </section>

      <footer className="text-center py-10 text-[#F3EFE3]/50 text-sm">
        <p className={fraunces.className}>VISION-H</p>
        <p className="mt-1">Votre Terre, Votre Avenir, Votre Priorite</p>
      </footer>
    </main>
  );
}
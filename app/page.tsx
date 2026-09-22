import Link from "next/link";
import { Fraunces, IBM_Plex_Mono } from "next/font/google";
import { supabase } from "@/lib/supabase";
import Reveal from "@/components/Reveal";
import TopoBackground from "@/components/TopoBackground";

const fraunces = Fraunces({ subsets: ["latin"], weight: ["600", "700"] });
const mono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "500"] });

export const metadata = {
  title: "Vision-H | Votre Terre, Votre Avenir, Votre Priorité",
  description:
    "Investissez dans le foncier à Douala. Terrains résidentiels et commerciaux à prix accessible, avec accompagnement juridique.",
};

export default async function HomePage() {
  const { data: featured } = await supabase
    .from("listings")
    .select("*")
    .eq("is_available", true)
    .order("created_at", { ascending: false })
    .limit(3);

  // Real counts from the database, not placeholder numbers — this is
  // what makes a stats bar feel credible instead of like marketing filler.
  const { count: listingsCount } = await supabase
    .from("listings")
    .select("*", { count: "exact", head: true });
  const { count: clientsCount } = await supabase
    .from("clients")
    .select("*", { count: "exact", head: true });

  return (
    <main className="bg-gradient-to-b from-[#0A2A20] via-[#0C332A] to-[#081F18] text-[#F3EFE3]">
      {/* NAV */}
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

      {/* HERO */}
      <section className="relative max-w-6xl mx-auto px-6 pt-16 pb-20 text-center overflow-hidden">
        <TopoBackground />
        <div className="absolute left-1/2 top-1/3 -translate-x-1/2 w-[500px] h-[500px] bg-[#C9A15A] opacity-[0.08] blur-[120px] rounded-full pointer-events-none" />
        <div className="relative">
          <img
            src="/vision-h-logo-full.png"
            alt="Vision-H"
            className="mx-auto h-32 sm:h-40 w-auto mb-8"
          />
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
        </div>
      </section>

      {/* LIVE STATS BAR */}
      <Reveal>
        <section className="border-y border-[#C9A15A]/20">
          <div className="max-w-6xl mx-auto px-6 py-10 grid grid-cols-2 sm:grid-cols-4 gap-8 text-center">
            <Stat mono={mono.className} value={String(listingsCount ?? 0)} label="Terrains listes" />
            <Stat mono={mono.className} value={String(clientsCount ?? 0)} label="Clients accompagnes" />
            <Stat mono={mono.className} value="5+" label="Sites a Douala" />
            <Stat mono={mono.className} value="100%" label="Suivi juridique" />
          </div>
        </section>
      </Reveal>

      {/* WHY INVEST */}
      <Reveal>
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
      </Reveal>

      {/* FEATURED LEDGER */}
      <Reveal>
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
                  <span>{Number(land.price_per_m2).toLocaleString("fr-FR")} FCFA/m²</span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 text-center">
            <Link
              href="/listings"
              className="text-[#C9A15A] hover:text-[#E4C989] underline underline-offset-4"
            >
              Voir tous les terrains →
            </Link>
          </div>
        </section>
      </Reveal>

      {/* TEAM */}
      <Reveal>
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
              terrain jusqu&apos;a la signature, avec un suivi juridique complet et
              une gestion transparente de votre patrimoine.
            </p>
          </div>
        </section>
      </Reveal>

      {/* CONTACT BANNER */}
      <Reveal>
        <section id="contact" className="bg-[#C9A15A] text-[#0A2A20]">
          <div className="max-w-6xl mx-auto px-6 py-16 text-center">
            <h2 className={fraunces.className + " text-2xl sm:text-3xl mb-6"}>
              Prenez contact pour une seance d&apos;information gratuite
            </h2>
            <p className={mono.className + " text-lg mb-2"}>
              +237 690 614 652 / 691 050 954 / 695 59 14 79
            </p>
            <p className={mono.className + " text-sm"}>vision-h@gmail.com</p>
          </div>
        </section>
      </Reveal>

      {/* FOOTER */}
      <footer className="border-t border-[#C9A15A]/10">
        <div className="max-w-6xl mx-auto px-6 py-12 grid sm:grid-cols-3 gap-8 text-sm">
          <div>
            <img src="/vision-h-logo.png" alt="Vision-H" className="h-8 w-auto mb-3 opacity-90" />
            <p className="text-[#F3EFE3]/50">Votre Terre, Votre Avenir, Votre Priorite</p>
          </div>
          <div>
            <p className="text-[#C9A15A] font-semibold mb-3">Navigation</p>
            <div className="flex flex-col gap-2 text-[#F3EFE3]/60">
              <Link href="/listings" className="hover:text-[#C9A15A]">Terrains</Link>
              <a href="#contact" className="hover:text-[#C9A15A]">Contact</a>
            </div>
          </div>
          <div>
            <p className="text-[#C9A15A] font-semibold mb-3">Coordonnees</p>
            <div className="flex flex-col gap-2 text-[#F3EFE3]/60">
              <span>Makepe Contenaire Rouge, Douala</span>
              <span>+237 2 33 47 57 70</span>
              <span>info@vision-h.com</span>
            </div>
          </div>
        </div>
        <p className="text-center text-xs text-[#F3EFE3]/30 pb-6">
          (c) VISION-H SARL. Tous droits reserves.
        </p>
      </footer>
    </main>
  );
}

function Stat({ mono, value, label }: { mono: string; value: string; label: string }) {
  return (
    <div>
      <p className={mono + " text-3xl text-[#C9A15A]"}>{value}</p>
      <p className="text-xs text-[#F3EFE3]/50 mt-1">{label}</p>
    </div>
  );
}

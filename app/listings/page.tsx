import { Fraunces, IBM_Plex_Mono } from "next/font/google";
import { supabase } from "@/lib/supabase";
import LandListingGrid, { Land } from "@/components/LandListingGrid";

// Loading the same two fonts as the homepage keeps typography consistent
// across pages. Each page that uses these fonts needs its own import —
// Next.js caches the actual font files so this doesn't slow things down.
const fraunces = Fraunces({ subsets: ["latin"], weight: ["600", "700"] });
const mono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "500"] });

export const metadata = {
  title: "Terrains disponibles | Vision-H",
};

// This is an `async` component — a Server Component feature that lets us
// `await` data directly in the component, before anything renders. No
// useEffect, no loading spinner needed for the initial page load.
export default async function ListingsPage() {
  const { data: listings, error } = await supabase
    .from("listings")
    .select("*")
    .eq("is_available", true)
    .order("created_at", { ascending: false });

  return (
    <main className="bg-[#0A2A20] min-h-screen">
      <div className="max-w-6xl mx-auto px-6 pt-16 pb-8 text-center">
        <p className={mono.className + " text-xs tracking-[0.2em] text-[#C9A15A] mb-4"}>
          NOS TERRAINS
        </p>
        <h1 className={fraunces.className + " text-3xl sm:text-4xl text-[#F3EFE3]"}>
          Terrains disponibles
        </h1>
        <p className="text-[#F3EFE3]/60 mt-3 max-w-xl mx-auto">
          Chaque terrain est vérifié et accompagné d&apos;un suivi juridique
          complet.
        </p>
      </div>

      {error ? (
        <p className="text-center text-red-400 py-10">
          Erreur lors du chargement: {error.message}
        </p>
      ) : (
        <LandListingGrid listings={(listings as Land[]) ?? []} />
      )}
    </main>
  );
}
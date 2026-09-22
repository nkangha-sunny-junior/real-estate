import { Fraunces, IBM_Plex_Mono } from "next/font/google";
import { supabase } from "@/lib/supabase";
import MapView from "@/components/MapView";
import Link from "next/link";

// Same two fonts as the homepage and listings page — keeps every page
// feeling like one consistent product instead of three different sites.
const fraunces = Fraunces({ subsets: ["latin"], weight: ["600", "700"] });
const mono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "500"] });

interface DetailPageProps {
  // In Next.js 16, dynamic route params (the [id] part of the folder name)
  // arrive as a Promise, not a plain object — that's why we `await` it below.
  // This is a real breaking change from older Next.js versions.
  params: Promise<{ id: string }>;
}

export default async function ListingDetailPage({ params }: DetailPageProps) {
  const { id } = await params;

  const { data: land, error } = await supabase
    .from("listings")
    .select("*")
    .eq("id", id)
    .single(); // .single() expects exactly one row back, not an array

  // Always handle the "not found" / error case FIRST and return early.
  // This keeps the rest of the component simple, since everything below
  // this point can safely assume `land` exists.
  if (error || !land) {
    return (
      <main className="bg-[#0A2A20] min-h-screen flex items-center justify-center text-center px-6">
        <div>
          <p className="text-red-400 mb-4">Terrain introuvable.</p>
          <Link href="/listings" className="text-[#C9A15A] underline">
            Retour aux terrains
          </Link>
        </div>
      </main>
    );
  }

  const isResidential = land.zoning === "Residential";

  return (
    <main className="bg-[#0A2A20] min-h-screen">
      <div className="max-w-3xl mx-auto px-6 py-12">
        <Link
          href="/listings"
          className="text-[#C9A15A] text-sm hover:underline inline-flex items-center gap-1"
        >
          ← Retour aux terrains
        </Link>

        {/* Hero image with a gold border — same visual language as the
            team photo on the homepage, so it doesn't feel like a
            different design system */}
        <div className="mt-6 rounded-2xl overflow-hidden h-72 sm:h-96 bg-[#0E3A2B] border border-[#C9A15A]/20">
          <img
            src={land.image_url || "/placeholder-land.jpg"}
            alt={land.title}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="flex items-start justify-between gap-4 mt-6">
          <div>
            <h1 className={fraunces.className + " text-3xl text-[#F3EFE3]"}>
              {land.title}
            </h1>
            <p className="text-[#F3EFE3]/60 mt-1">{land.location}</p>
          </div>
          <span
            className={`shrink-0 text-xs font-semibold px-3 py-1.5 rounded-full ${
              isResidential
                ? "bg-[#F3EFE3] text-[#0A2A20]"
                : "bg-[#C9A15A] text-[#0A2A20]"
            }`}
          >
            {land.zoning}
          </span>
        </div>

        {/* mono font here echoes the "ledger" styling from the homepage's
            featured listings section — prices/measurements always use
            the monospace font throughout the site, it's a consistent rule */}
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-4">
          <p className={mono.className + " text-2xl text-[#C9A15A]"}>
            {Number(land.price_per_m2).toLocaleString("fr-FR")} FCFA
            <span className="text-sm text-[#F3EFE3]/50"> / m2</span>
          </p>
          {land.size_hectares && (
            <p className={mono.className + " text-[#F3EFE3]/70"}>
              {land.size_hectares} hectares
            </p>
          )}
        </div>

        {land.description && (
          <p className="text-[#F3EFE3]/70 mt-6 leading-relaxed">
            {land.description}
          </p>
        )}

        {/* Only render the map section if we actually have coordinates —
            avoids showing a broken/empty map for listings without lat/lng */}
        {land.latitude && land.longitude && (
          <div className="mt-10">
            <p className={mono.className + " text-xs tracking-[0.2em] text-[#C9A15A] mb-3"}>
              LOCALISATION
            </p>
            <div className="rounded-2xl overflow-hidden border-2 border-[#C9A15A]/30">
              <MapView lat={land.latitude} lng={land.longitude} title={land.title} />
            </div>
          </div>
        )}

        {/* WhatsApp green is kept intentionally — people instantly
            recognize it as "tap to chat", so fighting that convention
            with brand colors would actually hurt usability here */}
        <a
          href={`https://wa.me/237695591479?text=${encodeURIComponent(
            `Bonjour, je suis interesse par le terrain: ${land.title}`
          )}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-10 flex items-center justify-center gap-2 w-full sm:w-auto bg-[#25D366] hover:bg-[#1FB855] text-white font-semibold px-8 py-3.5 rounded-lg transition-colors"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5.1-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.1l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.4-.7-1.7-.8-.2-.1-.4-.1-.6.1-.2.2-.6.8-.8 1-.1.2-.3.2-.5.1-.2-.1-1-.4-1.9-1.2-.7-.6-1.2-1.4-1.3-1.6-.1-.2 0-.4.1-.5.1-.1.3-.3.4-.5.1-.1.2-.3.2-.4.1-.2 0-.3 0-.4-.1-.1-.6-1.4-.8-1.9-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.4.1-.6.3-.2.2-.8.8-.8 1.9s.8 2.2.9 2.4c.1.2 1.6 2.5 3.9 3.5.5.2 1 .4 1.3.5.5.1 1 .1 1.4.1.4-.1 1.3-.5 1.5-1.1.2-.5.2-1 .1-1.1-.1-.1-.2-.2-.4-.3Z" />
          </svg>
          Contacter via WhatsApp pour ce terrain
        </a>
      </div>
    </main>
  );
}
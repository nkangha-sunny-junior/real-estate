"use client";

import Link from "next/link";

export interface Land {
  id: string;
  title: string;
  location: string;
  price_per_m2: number;
  size_hectares: number | null;
  zoning: "Residential" | "Commercial";
  description: string | null;
  image_url: string | null;
  latitude: number | null;
  longitude: number | null;
}

interface LandListingGridProps {
  listings: Land[];
}

export default function LandListingGrid({ listings }: LandListingGridProps) {
  return (
    <section className="max-w-7xl mx-auto px-4 py-10">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {listings.map((land) => (
          <LandCard key={land.id} land={land} />
        ))}
      </div>
    </section>
  );
}

function LandCard({ land }: { land: Land }) {
  const isResidential = land.zoning === "Residential";

  return (
    <div className="group bg-[#0E3A2B] rounded-2xl overflow-hidden border border-[#C9A15A]/20 hover:border-[#C9A15A]/60 transition-colors flex flex-col">
      <div className="relative w-full h-48 bg-[#0A2A20] overflow-hidden">
        <img
          src={land.image_url || "/placeholder-land.jpg"}
          alt={land.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <span
          className={`absolute top-3 left-3 text-xs font-semibold px-2.5 py-1 rounded-full ${
            isResidential
              ? "bg-[#F3EFE3] text-[#0A2A20]"
              : "bg-[#C9A15A] text-[#0A2A20]"
          }`}
        >
          {land.zoning}
        </span>
      </div>

      <div className="p-5 flex flex-col flex-1">
        <h3 className="text-lg font-bold text-[#F3EFE3]">{land.title}</h3>

        <p className="text-sm text-[#F3EFE3]/60 mt-1 flex items-center gap-1">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-4 h-4 text-[#C9A15A]"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 1 1 16 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          {land.location}
        </p>

        {land.size_hectares && (
          <p className="text-sm text-[#F3EFE3]/60 mt-1">
            <span className="font-medium text-[#F3EFE3]">
              {land.size_hectares}
            </span>{" "}
            hectares
          </p>
        )}

        {land.description && (
          <p className="text-sm text-[#F3EFE3]/50 mt-2 line-clamp-2">
            {land.description}
          </p>
        )}

        <p className="text-xl font-bold text-[#C9A15A] mt-3">
          {land.price_per_m2.toLocaleString("fr-FR")} FCFA
          <span className="text-sm font-normal text-[#F3EFE3]/50"> / m2</span>
        </p>

        <Link
          href={`/listings/${land.id}`}
          className="mt-4 block w-full text-center bg-[#C9A15A] hover:bg-[#E4C989] text-[#0A2A20] text-sm font-semibold py-2.5 rounded-lg transition-colors"
        >
          Voir les détails
        </Link>
      </div>
    </div>
  );
}
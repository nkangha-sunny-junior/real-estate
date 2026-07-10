"use client";

import dynamic from "next/dynamic";

const LeafletMap = dynamic(() => import("./LeafletMap"), {
  ssr: false,
  loading: () => (
    <div className="h-72 w-full rounded-2xl bg-[#F3EFE3]/10 animate-pulse" />
  ),
});

interface MapViewProps {
  lat: number;
  lng: number;
  title: string;
}

export default function MapView({ lat, lng, title }: MapViewProps) {
  return <LeafletMap lat={lat} lng={lng} title={title} />;
}
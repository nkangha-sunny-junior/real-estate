"use client";

import { useEffect, useState, FormEvent } from "react";
import { Trash2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface Listing {
  id: string;
  title: string;
  location: string;
  price_per_m2: number;
  size_hectares: number | null;
  zoning: "Residential" | "Commercial";
  description: string | null;
  image_url: string | null;
  is_available: boolean;
  latitude: number | null;
  longitude: number | null;
}

const emptyForm = {
  title: "",
  location: "",
  price_per_m2: "",
  size_hectares: "",
  zoning: "Residential" as "Residential" | "Commercial",
  description: "",
  latitude: "",
  longitude: "",
};

export default function ListingsAdminPage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [imageFile, setImageFile] = useState<File | null>(null);

  async function loadListings() {
    setLoading(true);
    const { data } = await supabase.from("listings").select("*").order("created_at", { ascending: false });
    setListings((data as Listing[]) ?? []);
    setLoading(false);
  }

  useEffect(() => {
    loadListings();
  }, []);

  async function handleAdd(e: FormEvent) {
    e.preventDefault();
    setSaving(true);

    // Upload the photo first (if one was chosen), then create the
    // listing row with the resulting public URL.
    let imageUrl: string | null = null;
    if (imageFile) {
      const fileName = `${Date.now()}-${imageFile.name}`;
      const { error: uploadError } = await supabase.storage.from("listings").upload(fileName, imageFile);
      if (uploadError) {
        alert("Erreur upload image: " + uploadError.message);
        setSaving(false);
        return;
      }
      const { data: urlData } = supabase.storage.from("listings").getPublicUrl(fileName);
      imageUrl = urlData.publicUrl;
    }

    const { error } = await supabase.from("listings").insert({
      title: form.title,
      location: form.location,
      price_per_m2: Number(form.price_per_m2),
      size_hectares: form.size_hectares ? Number(form.size_hectares) : null,
      zoning: form.zoning,
      description: form.description || null,
      image_url: imageUrl,
      latitude: form.latitude ? Number(form.latitude) : null,
      longitude: form.longitude ? Number(form.longitude) : null,
      is_available: true,
    });

    setSaving(false);
    if (error) {
      alert("Erreur: " + error.message);
      return;
    }
    setForm(emptyForm);
    setImageFile(null);
    loadListings();
  }

  async function toggleAvailable(listing: Listing) {
    await supabase.from("listings").update({ is_available: !listing.is_available }).eq("id", listing.id);
    loadListings();
  }

  async function handleDelete(id: string) {
    if (!confirm("Supprimer ce terrain ? Cette action est irreversible.")) return;
    const { error } = await supabase.from("listings").delete().eq("id", id);
    if (error) {
      alert("Erreur: " + error.message);
      return;
    }
    loadListings();
  }

  return (
    <div className="max-w-5xl">
      <h1 className="text-2xl font-bold text-[#F3EFE3] mb-6">Terrains</h1>

      <form onSubmit={handleAdd} className="bg-[#0E3A2B] border border-[#C9A15A]/20 rounded-2xl p-6 mb-8">
        <h2 className="text-[#C9A15A] text-sm font-semibold tracking-wide mb-5">NOUVEAU TERRAIN</h2>
        <div className="grid sm:grid-cols-2 gap-5">
          <Field label="Titre">
            <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required className="input" />
          </Field>
          <Field label="Localisation">
            <input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} required className="input" />
          </Field>
          <Field label="Prix / m2 (FCFA)">
            <input type="number" value={form.price_per_m2} onChange={(e) => setForm({ ...form, price_per_m2: e.target.value })} required className="input" />
          </Field>
          <Field label="Superficie (hectares, optionnel)">
            <input type="number" value={form.size_hectares} onChange={(e) => setForm({ ...form, size_hectares: e.target.value })} className="input" />
          </Field>
          <Field label="Zonage">
            <select value={form.zoning} onChange={(e) => setForm({ ...form, zoning: e.target.value as "Residential" | "Commercial" })} className="input">
              <option value="Residential">Residential</option>
              <option value="Commercial">Commercial</option>
            </select>
          </Field>
          <Field label="Photo">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
              className="input"
            />
          </Field>
          <Field label="Latitude (optionnel)">
            <input value={form.latitude} onChange={(e) => setForm({ ...form, latitude: e.target.value })} className="input" />
          </Field>
          <Field label="Longitude (optionnel)">
            <input value={form.longitude} onChange={(e) => setForm({ ...form, longitude: e.target.value })} className="input" />
          </Field>
          <Field label="Description" span2>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className="input" />
          </Field>
        </div>
        <button
          type="submit"
          disabled={saving}
          className="mt-6 w-full bg-[#C9A15A] hover:bg-[#E4C989] text-[#0A2A20] font-semibold py-2.5 rounded-lg transition-colors disabled:opacity-50"
        >
          {saving ? "Enregistrement..." : "Ajouter le terrain"}
        </button>
      </form>

      {loading ? (
        <p className="text-[#F3EFE3]/60">Chargement...</p>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {listings.map((l) => (
            <div key={l.id} className="bg-[#0E3A2B] border border-[#C9A15A]/20 rounded-2xl overflow-hidden">
              <div className="h-36 bg-[#0A2A20]">
                {l.image_url ? (
                  <img src={l.image_url} alt={l.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[#F3EFE3]/30 text-sm">
                    Pas de photo
                  </div>
                )}
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-[#F3EFE3]">{l.title}</p>
                    <p className="text-xs text-[#F3EFE3]/50">{l.location}</p>
                  </div>
                  <button onClick={() => handleDelete(l.id)} className="text-red-400 hover:text-red-300 shrink-0" aria-label="Supprimer">
                    <Trash2 size={16} />
                  </button>
                </div>
                <p className="text-[#C9A15A] font-semibold mt-2">
                  {l.price_per_m2.toLocaleString("fr-FR")} FCFA/m2
                </p>
                <button
                  onClick={() => toggleAvailable(l)}
                  className={`mt-3 text-xs px-3 py-1.5 rounded-full ${
                    l.is_available ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
                  }`}
                >
                  {l.is_available ? "Disponible" : "Vendu / Indisponible"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Field({ label, span2, children }: { label: string; span2?: boolean; children: React.ReactNode }) {
  return (
    <div className={span2 ? "sm:col-span-2" : ""}>
      <label className="block text-xs text-[#F3EFE3]/50 mb-1.5">{label}</label>
      {children}
    </div>
  );
}
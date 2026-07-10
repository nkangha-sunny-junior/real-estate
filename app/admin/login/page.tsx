"use client"; // needed: this page uses useState/useEffect (browser-only features)

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleLogin(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setError("Email ou mot de passe incorrect.");
      return;
    }
    router.push("/admin");
  }

  return (
    <main className="min-h-screen bg-[#0A2A20] flex items-center justify-center px-6">
      <form onSubmit={handleLogin} className="bg-[#0E3A2B] border border-[#C9A15A]/20 rounded-2xl p-8 w-full max-w-sm">
        <h1 className="text-xl font-bold text-[#F3EFE3] mb-6 text-center">Connexion Admin</h1>
        {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
        <label className="block text-sm text-[#F3EFE3]/70 mb-1">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full mb-4 px-3 py-2 rounded-lg bg-[#0A2A20] border border-[#C9A15A]/30 text-[#F3EFE3] focus:outline-none focus:border-[#C9A15A]"
        />
        <label className="block text-sm text-[#F3EFE3]/70 mb-1">Mot de passe</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full mb-6 px-3 py-2 rounded-lg bg-[#0A2A20] border border-[#C9A15A]/30 text-[#F3EFE3] focus:outline-none focus:border-[#C9A15A]"
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#C9A15A] hover:bg-[#E4C989] text-[#0A2A20] font-semibold py-2.5 rounded-lg transition-colors disabled:opacity-50"
        >
          {loading ? "Connexion..." : "Se connecter"}
        </button>
      </form>
    </main>
  );
}
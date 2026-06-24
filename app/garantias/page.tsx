import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import WarrantiesList from "@/components/WarrantiesList";
import { Warranty } from "@/types/warranty";
import { Plus } from "lucide-react";

export default async function GarantiasPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data } = await supabase
    .from("warranties")
    .select("*")
    .order("expiry_date", { ascending: true });

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar email={user.email!} />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Mis garantías</h1>
            <p className="text-gray-500 mt-1">Buscá, filtrá y exportá</p>
          </div>
          <Link
            href="/garantias/nueva"
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-4 py-2.5 rounded-lg text-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            Nueva
          </Link>
        </div>

        <WarrantiesList warranties={(data ?? []) as Warranty[]} />
      </main>
    </div>
  );
}

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Navbar from "@/components/Navbar";
import WarrantyForm from "@/components/WarrantyForm";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default async function NuevaGarantiaPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar email={user.email!} />
      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link href="/garantias" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4">
            <ChevronLeft className="w-4 h-4" />
            Volver
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Nueva garantía</h1>
          <p className="text-gray-500 mt-1">Registrá un nuevo producto con su garantía</p>
        </div>
        <WarrantyForm mode="create" />
      </main>
    </div>
  );
}

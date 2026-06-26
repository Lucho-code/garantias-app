"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { LogOut, Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import ThemeToggle from "@/components/ThemeToggle";
import AppLogo from "@/components/AppLogo";

export default function Navbar({ email }: { email: string }) {
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700/50 sticky top-0 z-10 transition-colors duration-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <AppLogo size={32} />
            <span className="font-bold text-gray-900 dark:text-gray-50 text-lg">GarantíasApp</span>
          </Link>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/garantias/nueva"
              className="inline-flex items-center gap-1.5 bg-gradient-to-br from-violet-500 to-violet-700 hover:opacity-90 text-white text-sm font-medium px-3 sm:px-3.5 py-2 rounded-lg transition-all shadow-sm shadow-violet-200 dark:shadow-violet-900/50"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Nueva garantía</span>
            </Link>

            <div className="flex items-center gap-1 pl-2 sm:pl-3 border-l border-gray-200 dark:border-gray-700">
              <ThemeToggle />
              <div
                className="w-8 h-8 rounded-full bg-violet-100 dark:bg-violet-900/50 flex items-center justify-center shrink-0 cursor-default"
                title={email}
              >
                <span className="text-xs font-semibold text-violet-700 dark:text-violet-300">
                  {email.charAt(0).toUpperCase()}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                title="Cerrar sesión"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

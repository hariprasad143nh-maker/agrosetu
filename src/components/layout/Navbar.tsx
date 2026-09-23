"use client";

import Link from "next/link"
import { Sprout, Bell, UserCircle, LogOut } from "lucide-react"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { ProfileDialog } from "@/components/ProfileDialog"
import { NotificationsDropdown } from "@/components/NotificationsDropdown"

export function Navbar() {
  const pathname = usePathname();
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user?.user_metadata?.role) {
        setRole(data.user.user_metadata.role);
      }
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user?.user_metadata?.role) {
        setRole(session.user.user_metadata.role);
      } else if (event === 'SIGNED_OUT') {
        setRole(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);
  
  const isLandingPage = pathname === '/' || pathname === '/login' || pathname === '/register';
  
  // Use DB role if available, otherwise fallback to URL heuristic for immediate render
  const isIndustry = role === 'industry' || (role === null && pathname.startsWith('/industry'));
  const isFarmer = role === 'farmer' || (role === null && !pathname.startsWith('/industry') && !isLandingPage);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4 sm:px-8">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2">
            <Sprout className={`h-6 w-6 ${isIndustry ? 'text-blue-600' : 'text-green-600'}`} />
            <span className={`font-bold text-xl tracking-tight ${isIndustry ? 'text-blue-600' : 'text-green-600'}`}>
              AgroSetu {isIndustry && <span className="text-sm font-normal text-slate-500 ml-1">Enterprise</span>}
            </span>
          </Link>
        </div>

        {/* Dynamic Navigation based on Persona */}
        {!isLandingPage && (
          <nav className="hidden md:flex items-center gap-6">
            {isFarmer && (
              <>
                <Link href="/dashboard" className={`text-sm font-medium transition-colors ${pathname === '/dashboard' ? 'text-green-700 font-semibold' : 'text-slate-600 hover:text-green-600'}`}>
                  My Farm
                </Link>
                <Link href="/produce/add" className={`text-sm font-medium transition-colors ${pathname.includes('/produce') ? 'text-green-700 font-semibold' : 'text-slate-600 hover:text-green-600'}`}>
                  Produce
                </Link>
                <Link href="/residues/add" className={`text-sm font-medium transition-colors ${pathname.includes('/residues') ? 'text-green-700 font-semibold' : 'text-slate-600 hover:text-green-600'}`}>
                  Residues
                </Link>
              </>
            )}
            
            {isIndustry && (
              <>
                <Link href="/industry/dashboard" className={`text-sm font-medium transition-colors ${pathname === '/industry/dashboard' ? 'text-blue-700 font-semibold' : 'text-slate-600 hover:text-blue-600'}`}>
                  Procurement
                </Link>
                <Link href="/industry/demand" className={`text-sm font-medium transition-colors ${pathname.includes('/demand') ? 'text-blue-700 font-semibold' : 'text-slate-600 hover:text-blue-600'}`}>
                  My Demands
                </Link>
              </>
            )}

            {isIndustry ? (
              <Link href="/industry/map" className={`text-sm font-medium transition-colors ${pathname === '/industry/map' ? 'text-blue-700 font-semibold' : 'text-slate-600 hover:text-slate-900'}`}>
                Live Map
              </Link>
            ) : (
              <Link href="/map" className={`text-sm font-medium transition-colors ${pathname === '/map' ? 'text-green-700 font-semibold' : 'text-slate-600 hover:text-slate-900'}`}>
                Live Map
              </Link>
            )}
          </nav>
        )}

        <div className="flex items-center gap-4">
          {loading ? (
            <div className="h-8 w-8 animate-pulse bg-slate-200 rounded-full"></div>
          ) : !role ? (
            <Link href="/login" className="text-sm font-medium text-slate-600 hover:text-slate-900 px-4 py-2 rounded-md hover:bg-slate-100 transition-colors">
              Sign In
            </Link>
          ) : (
            <>
              <NotificationsDropdown />
              <ProfileDialog />
              <button onClick={() => { supabase.auth.signOut().then(() => window.location.href = '/') }} className="text-slate-400 hover:text-red-500 transition-colors" title="Log out">
                <LogOut className="h-5 w-5" />
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  )
}

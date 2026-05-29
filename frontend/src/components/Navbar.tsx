"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import {
  Compass,
  LogOut,
  User,
  Plus,
  Menu,
  X,
  LayoutDashboard,
  ArrowRight,
  Sparkles,
} from "lucide-react";

export default function Navbar() {
  const { user, logout, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Determine if we're on a cinematic/dark page for transparent style
  const isAuthPage = pathname === "/login" || pathname === "/register" || pathname === "/";
  const isLandingPage = pathname === "/";

  // Track scroll position for navbar background transition
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  // Dynamic classes based on page type
  const navBaseClass = isAuthPage
    ? `fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled
      ? "bg-slate-900/70 backdrop-blur-xl border-b border-white/10 shadow-2xl"
      : "bg-transparent border-b border-transparent"
    }`
    : `fixed top-0 left-0 right-0 z-50 transition-all duration-300 glass-card border-b border-x-0 border-t-0 rounded-none ${scrolled ? "bg-background/95 shadow-md" : "bg-background/80"
    }`;

  const textColorClass = isAuthPage ? "text-white/70" : "text-text-muted";
  const textHoverClass = isAuthPage ? "hover:text-white" : "hover:text-primary";
  const logoTextClass = isAuthPage
    ? scrolled
      ? "text-white"
      : "text-white"
    : "";

  return (
    <nav className={navBaseClass}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            href={user ? "/dashboard" : "/"}
            className="flex items-center gap-2.5 group"
          >
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 ${isAuthPage
                  ? "bg-white/10 border border-white/15"
                  : "bg-primary/10 border border-primary/20"
                }`}
            >
              <Compass
                className={`w-5 h-5 group-hover:rotate-45 transition-transform duration-500 ${isAuthPage ? "text-white" : "text-primary"
                  }`}
              />
            </div>
            {isAuthPage ? (
              <span className="text-xl font-extrabold tracking-tight text-white">
                Trip<span className="text-accent-light">Genius</span>
              </span>
            ) : (
              <span className="text-xl font-extrabold tracking-tight gradient-text">
                TripGenius
              </span>
            )}
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-5">
            {!loading && user ? (
              <>
                <Link
                  href="/dashboard"
                  className={`${textColorClass} ${textHoverClass} transition-colors text-sm font-semibold flex items-center gap-1.5 px-3 py-2 rounded-xl hover:bg-white/5`}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </Link>
                <Link
                  href="/trips/new"
                  className={`${textColorClass} ${textHoverClass} transition-colors text-sm font-semibold flex items-center gap-1.5 px-3 py-2 rounded-xl hover:bg-white/5`}
                >
                  <Plus className="w-4 h-4" />
                  New Trip
                </Link>
                <div
                  className={`h-5 w-px mx-1 ${isAuthPage ? "bg-white/15" : "bg-surface-lighter"
                    }`}
                />
                <span
                  className={`text-sm font-medium flex items-center gap-1.5 px-3 py-1.5 rounded-full border ${isAuthPage
                      ? "text-white/80 bg-white/5 border-white/10"
                      : "text-text bg-surface-light/40 border-surface-lighter"
                    }`}
                >
                  <User className="w-4 h-4 text-accent" />
                  {user.name}
                </span>
                <button
                  onClick={handleLogout}
                  className="btn-danger text-sm py-2 px-3.5 flex items-center gap-1.5 font-semibold"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </>
            ) : !loading ? (
              <>
                {isAuthPage ? (
                  <>
                    <Link
                      href="/login"
                      className={`text-sm font-semibold px-5 py-2.5 rounded-xl transition-all duration-300 ${pathname === "/login"
                          ? "text-white bg-white/10 border border-white/15"
                          : "text-white/70 hover:text-white hover:bg-white/5"
                        }`}
                    >
                      Login
                    </Link>
                    <Link
                      href="/register"
                      className={`text-sm font-bold px-5 py-2.5 rounded-xl transition-all duration-300 flex items-center gap-2 ${pathname === "/register"
                          ? "bg-white text-slate-900 shadow-lg shadow-white/10"
                          : "bg-primary text-white hover:bg-primary-light shadow-lg shadow-primary/25"
                        }`}
                    >
                      Sign Up
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      className="btn-secondary text-sm py-2 px-5"
                    >
                      Login
                    </Link>
                    <Link
                      href="/register"
                      className="btn-primary text-sm py-2 px-5"
                    >
                      Sign Up
                    </Link>
                  </>
                )}
              </>
            ) : null}
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className={`md:hidden p-2.5 rounded-xl transition-all duration-200 ${isAuthPage
                ? "text-white/70 hover:text-white hover:bg-white/10"
                : "text-text-muted hover:text-text hover:bg-surface-light"
              }`}
            aria-label="Toggle menu"
          >
            {mobileOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* ─── Mobile menu ─── */}
        {mobileOpen && (
          <div
            className={`md:hidden pb-5 pt-3 animate-fade-in ${isAuthPage
                ? "border-t border-white/10"
                : "border-t border-surface-lighter"
              }`}
          >
            {!loading && user ? (
              <div className="flex flex-col gap-2 pt-2">
                <span
                  className={`text-sm font-medium flex items-center gap-2 px-3 py-2.5 rounded-xl border ${isAuthPage
                      ? "text-white/80 bg-white/5 border-white/10"
                      : "text-text bg-surface-light/35 border-surface-lighter"
                    }`}
                >
                  <User className="w-4 h-4 text-accent" />
                  {user.name}
                </span>
                <Link
                  href="/dashboard"
                  onClick={() => setMobileOpen(false)}
                  className={`${textColorClass} ${textHoverClass} transition-colors text-sm font-semibold flex items-center gap-2 px-3 py-2.5 rounded-xl`}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </Link>
                <Link
                  href="/trips/new"
                  onClick={() => setMobileOpen(false)}
                  className={`${textColorClass} ${textHoverClass} transition-colors text-sm font-semibold flex items-center gap-2 px-3 py-2.5 rounded-xl`}
                >
                  <Plus className="w-4 h-4" />
                  New Trip
                </Link>
                <button
                  onClick={handleLogout}
                  className="btn-danger text-sm py-2.5 w-full flex items-center justify-center gap-2 font-semibold mt-1"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            ) : !loading ? (
              <div className="flex flex-col gap-2.5 pt-2">
                <Link
                  href="/login"
                  onClick={() => setMobileOpen(false)}
                  className={`text-sm font-semibold text-center py-3 rounded-xl transition-all duration-200 ${isAuthPage
                      ? "text-white bg-white/10 border border-white/15"
                      : "btn-secondary"
                    }`}
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileOpen(false)}
                  className={`text-sm font-bold text-center py-3 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 ${isAuthPage
                      ? "bg-primary text-white shadow-lg"
                      : "btn-primary"
                    }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Sign Up
                </Link>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </nav>
  );
}

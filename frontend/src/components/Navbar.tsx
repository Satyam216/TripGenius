"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Compass, LogOut, User, Plus, Menu, X, LayoutDashboard } from "lucide-react";

export default function Navbar() {
  const { user, logout, loading } = useAuth();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-x-0 border-t-0 rounded-none bg-background/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href={user ? "/dashboard" : "/"} className="flex items-center gap-2.5 group">
            <Compass className="w-7 h-7 text-primary group-hover:rotate-45 transition-transform duration-500" />
            <span className="text-xl font-extrabold tracking-tight gradient-text">TripGenius</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {!loading && user ? (
              <>
                <Link
                  href="/dashboard"
                  className="text-text-muted hover:text-primary transition-colors text-sm font-semibold flex items-center gap-1.5"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </Link>
                <Link
                  href="/trips/new"
                  className="text-text-muted hover:text-primary transition-colors text-sm font-semibold flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  New Trip
                </Link>
                <div className="h-5 w-px bg-surface-lighter mx-1"></div>
                <span className="text-sm font-medium text-text flex items-center gap-1.5 bg-surface-light/40 px-3 py-1.5 rounded-full border border-surface-lighter">
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
                <Link href="/login" className="btn-secondary text-sm py-2 px-5">
                  Login
                </Link>
                <Link href="/register" className="btn-primary text-sm py-2 px-5">
                  Sign Up
                </Link>
              </>
            ) : null}
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden text-text-muted hover:text-text p-2 rounded-lg hover:bg-surface-light transition-colors"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden pb-4 pt-2 border-t border-surface-lighter animate-fade-in">
            {!loading && user ? (
              <div className="flex flex-col gap-3.5 pt-2">
                <span className="text-sm font-medium text-text flex items-center gap-2 px-2 py-1 bg-surface-light/35 rounded-xl border border-surface-lighter">
                  <User className="w-4 h-4 text-accent" />
                  {user.name}
                </span>
                <Link
                  href="/dashboard"
                  onClick={() => setMobileOpen(false)}
                  className="text-text-muted hover:text-primary transition-colors text-sm font-semibold flex items-center gap-2 px-2"
                >
                  <LayoutDashboard className="w-4.5 h-4.5" />
                  Dashboard
                </Link>
                <Link
                  href="/trips/new"
                  onClick={() => setMobileOpen(false)}
                  className="text-text-muted hover:text-primary transition-colors text-sm font-semibold flex items-center gap-2 px-2"
                >
                  <Plus className="w-4.5 h-4.5" />
                  New Trip
                </Link>
                <button
                  onClick={handleLogout}
                  className="btn-danger text-sm py-2.5 w-full flex items-center justify-center gap-2 font-semibold"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            ) : !loading ? (
              <div className="flex flex-col gap-3 pt-2">
                <Link href="/login" onClick={() => setMobileOpen(false)} className="btn-secondary text-sm py-2.5 text-center">
                  Login
                </Link>
                <Link href="/register" onClick={() => setMobileOpen(false)} className="btn-primary text-sm py-2.5 text-center">
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

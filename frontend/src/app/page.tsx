"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import {
  Calendar,
  DollarSign,
  Hotel,
  Edit3,
  Briefcase,
  CalendarDays,
  Sparkles,
  ArrowRight,
  Compass,
} from "lucide-react";

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push("/dashboard");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden bg-background">
      {/* Background decoration - funky Red and Yellow glowing blobs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-80 h-80 bg-primary/8 rounded-full blur-3xl"></div>
        <div className="absolute top-60 right-10 w-96 h-96 bg-accent/8 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-primary/5 rounded-full blur-3xl"></div>
      </div>

      {/* Hero Section */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32">
        <div className="text-center max-w-4xl mx-auto animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary-light text-sm font-semibold mb-8">
            <Sparkles className="w-4 h-4 text-accent" />
            <span>Powered by Google Gemini AI</span>
          </div>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold mb-6 leading-tight tracking-tight">
            Plan Your Dream Trip
            <br />
            <span className="gradient-text">with AI Intelligence</span>
          </h1>
          <p className="text-lg sm:text-xl text-text-muted max-w-2xl mx-auto mb-10 leading-relaxed font-medium">
            Generate personalized day-by-day itineraries, starting flight suggestions, hotel recommendations,
            and smart packing lists — all in seconds.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/register" className="btn-primary text-lg py-4 px-9 w-full sm:w-auto flex items-center justify-center gap-2">
              Get Started Free
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link href="/login" className="btn-secondary text-lg py-4 px-9 w-full sm:w-auto flex items-center justify-center">
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-32">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-extrabold mb-4 tracking-tight">Everything You Need</h2>
          <p className="text-text-muted text-lg font-medium">Plan smarter, travel better</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 stagger-children">
          {/* Feature 1 */}
          <div className="glass-card glass-card-hover p-8 transition-all duration-300">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-5 border border-primary/25">
              <Calendar className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold mb-3">AI Itinerary</h3>
            <p className="text-text-muted leading-relaxed text-sm">
              Get a detailed day-by-day plan with activities, time slots, and estimated costs tailored to your starting point and destination.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="glass-card glass-card-hover p-8 transition-all duration-300">
            <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center text-accent mb-5 border border-accent/25">
              <DollarSign className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold mb-3">Budget Estimation</h3>
            <p className="text-text-muted leading-relaxed text-sm">
              Get a complete cost breakdown including starting flights, accommodation, food, activities, and transport options.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="glass-card glass-card-hover p-8 transition-all duration-300">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-5 border border-primary/25">
              <Hotel className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold mb-3">Hotel Suggestions</h3>
            <p className="text-text-muted leading-relaxed text-sm">
              Discover curated hotel recommendations across Budget, Mid-Range, and Luxury tiers, complete with ratings and descriptions.
            </p>
          </div>

          {/* Feature 4 */}
          <div className="glass-card glass-card-hover p-8 transition-all duration-300">
            <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center text-accent mb-5 border border-accent/25">
              <Edit3 className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold mb-3">Editable Plans</h3>
            <p className="text-text-muted leading-relaxed text-sm">
              Add, remove, or regenerate activities with AI assistance. Refine specific days based on custom text inputs.
            </p>
          </div>

          {/* Feature 5 */}
          <div className="glass-card glass-card-hover p-8 transition-all duration-300">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-5 border border-primary/25">
              <Briefcase className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold mb-3">Smart Packing List</h3>
            <p className="text-text-muted leading-relaxed text-sm">
              AI generates a destination-specific packing checklist. Check off items interactively as you prepare.
            </p>
          </div>

          {/* Feature 6 */}
          <div className="glass-card glass-card-hover p-8 transition-all duration-300">
            <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center text-accent mb-5 border border-accent/25">
              <CalendarDays className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold mb-3">Calendar Export</h3>
            <p className="text-text-muted leading-relaxed text-sm">
              Download your itinerary as an ICS file and import it directly into Google or Apple Calendar for seamless schedules.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-32">
        <div className="glass-card p-12 text-center pulse-glow border border-primary/30">
          <h2 className="text-3xl sm:text-4xl font-extrabold mb-4 tracking-tight">Ready to Plan Your Next Adventure?</h2>
          <p className="text-text-muted text-lg mb-8 max-w-xl mx-auto font-medium">
            Join TripGenius and let AI handle the planning while you focus on the packing.
          </p>
          <Link href="/register" className="btn-primary text-lg py-4 px-10 flex items-center justify-center gap-2 mx-auto w-full sm:w-auto">
            <Compass className="w-5 h-5 text-white animate-spin-slow" />
            <span>Start Planning — It&apos;s Free</span>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-surface-lighter py-8 text-center text-text-muted text-sm bg-surface/30">
        <p>© 2026 TripGenius. Built with ❤️ using Next.js, Express, Lucide & Google Gemini AI.</p>
      </footer>
    </div>
  );
}

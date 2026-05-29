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
  Globe,
  Map,
  Plane,
  Shield,
  Star,
  Users,
  Zap,
} from "lucide-react";
import AuthCollageBackground from "@/components/AuthCollageBackground";

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
      <div className="flex items-center justify-center min-h-screen bg-slate-900">
        <div className="spinner" />
      </div>
    );
  }

  const features = [
    {
      icon: Calendar,
      title: "AI Itinerary",
      description:
        "Get a detailed day-by-day plan with activities, time slots, and estimated costs tailored to your starting point and destination.",
      color: "from-red-500/20 to-red-600/10",
      iconColor: "text-red-400",
      borderColor: "border-red-500/15",
    },
    {
      icon: DollarSign,
      title: "Budget Estimation",
      description:
        "Get a complete cost breakdown including flights, accommodation, food, activities, and transport in your local currency.",
      color: "from-yellow-500/20 to-yellow-600/10",
      iconColor: "text-yellow-400",
      borderColor: "border-yellow-500/15",
    },
    {
      icon: Hotel,
      title: "Hotel Suggestions",
      description:
        "Discover curated hotel recommendations across Budget, Mid-Range, and Luxury tiers with ratings and descriptions.",
      color: "from-green-500/20 to-green-600/10",
      iconColor: "text-green-400",
      borderColor: "border-green-500/15",
    },
    {
      icon: Edit3,
      title: "Editable Plans",
      description:
        "Add, remove, or regenerate activities with AI assistance. Refine specific days based on custom text inputs.",
      color: "from-red-500/20 to-yellow-500/10",
      iconColor: "text-red-400",
      borderColor: "border-red-500/15",
    },
    {
      icon: Briefcase,
      title: "Smart Packing List",
      description:
        "AI generates a destination-specific packing checklist. Check off items interactively as you prepare.",
      color: "from-yellow-500/20 to-green-500/10",
      iconColor: "text-yellow-400",
      borderColor: "border-yellow-500/15",
    },
    {
      icon: Plane,
      title: "Transit & Visa Info",
      description:
        "Get estimated travel expenses for car, bus, train, and flights along with visa requirements for international trips.",
      color: "from-green-500/20 to-red-500/10",
      iconColor: "text-green-400",
      borderColor: "border-green-500/15",
    },
  ];

  const stats = [
    { value: "50+", label: "Countries Covered", icon: Globe },
    { value: "10K+", label: "Trips Planned", icon: Map },
    { value: "4.9", label: "User Rating", icon: Star },
    { value: "24/7", label: "AI Powered", icon: Zap },
  ];

  return (
    <div className="relative overflow-hidden min-h-screen">
      {/* ─── Cinematic Collage Background ─── */}
      <AuthCollageBackground />

      {/* ═══════════════════════════════════════════════════════════
          HERO SECTION
          ═══════════════════════════════════════════════════════════ */}
      <section className="relative z-10 min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-4xl mx-auto auth-card-enter">
          {/* Badge */}
          <div className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-white/8 border border-white/10 backdrop-blur-md mb-8">
            <Sparkles className="w-4 h-4 text-yellow-400" />
            <span className="text-sm font-semibold text-white/80">
              Powered by Google Gemini AI
            </span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold mb-6 leading-[1.1] tracking-tight text-white">
            Plan Your Dream Trip
            <br />
            <span
              className="bg-clip-text text-transparent"
              style={{
                backgroundImage:
                  "linear-gradient(135deg, #ef4444 0%, #eab308 50%, #16a34a 100%)",
              }}
            >
              with AI Intelligence
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg lg:text-xl text-white/55 max-w-2xl mx-auto mb-10 leading-relaxed font-medium">
            Generate personalized day-by-day itineraries, flight suggestions,
            hotel recommendations, and smart packing lists scaled to your local
            currency — all in seconds.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/register"
              className="group relative w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl font-bold text-white text-lg overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl"
              style={{
                background: "linear-gradient(135deg, #ef4444, #dc2626)",
                boxShadow: "0 8px 32px rgba(239, 68, 68, 0.35)",
              }}
            >
              <span className="relative z-10">Get Started Free</span>
              <ArrowRight className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform" />
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
            </Link>
            <Link
              href="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl font-bold text-white/80 text-lg border border-white/15 bg-white/5 backdrop-blur-sm hover:bg-white/10 hover:border-white/25 hover:text-white transition-all duration-300"
            >
              Sign In
            </Link>
          </div>

          {/* Trust indicators */}
          <div className="mt-14 flex items-center justify-center gap-6 sm:gap-8 flex-wrap">
            <div className="flex items-center gap-2 text-white/35">
              <Shield className="w-4 h-4" />
              <span className="text-xs font-semibold">Free to Use</span>
            </div>
            <div className="flex items-center gap-2 text-white/35">
              <Users className="w-4 h-4" />
              <span className="text-xs font-semibold">10K+ Travelers</span>
            </div>
            <div className="flex items-center gap-2 text-white/35">
              <Zap className="w-4 h-4" />
              <span className="text-xs font-semibold">Instant Results</span>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce">
          <span className="text-white/25 text-xs font-medium uppercase tracking-widest">
            Scroll
          </span>
          <div className="w-5 h-8 rounded-full border-2 border-white/15 flex justify-center pt-1.5">
            <div className="w-1 h-2 rounded-full bg-white/30" />
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          STATS BAR
          ═══════════════════════════════════════════════════════════ */}
      <section className="relative z-10 py-12 border-y border-white/5">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-white/5 border border-white/8 mb-3">
                  <stat.icon className="w-5 h-5 text-white/40" />
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-white mb-1">
                  {stat.value}
                </div>
                <div className="text-xs sm:text-sm font-medium text-white/35">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          FEATURES SECTION
          ═══════════════════════════════════════════════════════════ */}
      <section className="relative z-10 py-24 sm:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section header */}
          <div className="text-center mb-16 sm:mb-20">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/8 text-white/60 text-xs font-semibold uppercase tracking-widest mb-6">
              <Compass className="w-3.5 h-3.5" />
              Features
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-5 tracking-tight">
              Everything You Need to
              <br />
              <span className="text-white/50">Plan the Perfect Trip</span>
            </h2>
            <p className="text-white/40 text-base sm:text-lg max-w-xl mx-auto font-medium">
              From itineraries to packing lists — powered by AI that understands
              your style.
            </p>
          </div>

          {/* Feature grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 stagger-children">
            {features.map((feature) => (
              <div
                key={feature.title}
                className={`group relative rounded-2xl p-7 sm:p-8 transition-all duration-500 hover:scale-[1.02] bg-white/[0.03] backdrop-blur-sm border ${feature.borderColor} hover:bg-white/[0.06] hover:border-white/15`}
              >
                {/* Icon */}
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-5 border border-white/8 group-hover:scale-110 transition-transform duration-300`}
                >
                  <feature.icon className={`w-6 h-6 ${feature.iconColor}`} />
                </div>

                {/* Content */}
                <h3 className="text-lg font-bold text-white mb-3 tracking-tight">
                  {feature.title}
                </h3>
                <p className="text-white/40 text-sm leading-relaxed font-medium">
                  {feature.description}
                </p>

                {/* Hover arrow */}
                <div className="mt-5 flex items-center gap-1.5 text-white/20 group-hover:text-white/50 transition-colors duration-300">
                  <span className="text-xs font-semibold">Learn more</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          HOW IT WORKS
          ═══════════════════════════════════════════════════════════ */}
      <section className="relative z-10 py-24 sm:py-32 border-t border-white/5">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4 tracking-tight">
              How It Works
            </h2>
            <p className="text-white/40 text-base font-medium">
              Three simple steps to your perfect trip
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-12">
            {[
              {
                step: "01",
                title: "Enter Your Details",
                desc: "Tell us your origin, destination, dates, budget, and travel style.",
                icon: Map,
                accentColor: "#ef4444",
              },
              {
                step: "02",
                title: "AI Generates Your Plan",
                desc: "Gemini AI creates a personalized itinerary with hotels, budget, and packing list.",
                icon: Sparkles,
                accentColor: "#eab308",
              },
              {
                step: "03",
                title: "Customize & Go",
                desc: "Edit your plan, export to calendar, and start your adventure.",
                icon: Plane,
                accentColor: "#16a34a",
              },
            ].map((item) => (
              <div key={item.step} className="text-center group">
                {/* Step number */}
                <div
                  className="text-5xl sm:text-6xl font-black mb-4 transition-colors duration-300"
                  style={{ color: `${item.accentColor}70` }}
                >
                  {item.step}
                </div>

                {/* Icon circle */}
                <div
                  className="w-16 h-16 rounded-2xl mx-auto mb-5 flex items-center justify-center border border-white/8 group-hover:scale-110 transition-transform duration-300"
                  style={{
                    background: `linear-gradient(135deg, ${item.accentColor}15, transparent)`,
                  }}
                >
                  <item.icon
                    className="w-7 h-7"
                    style={{ color: item.accentColor }}
                  />
                </div>

                <h3 className="text-lg font-bold text-white mb-2">
                  {item.title}
                </h3>
                <p className="text-white/35 text-sm leading-relaxed font-medium max-w-xs mx-auto">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          FINAL CTA SECTION
          ═══════════════════════════════════════════════════════════ */}
      <section className="relative z-10 py-24 sm:py-32">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-3xl p-10 sm:p-14 text-center overflow-hidden border border-white/8">
            {/* Gradient background */}
            <div
              className="absolute inset-0 opacity-30"
              style={{
                background:
                  "linear-gradient(135deg, rgba(239,68,68,0.15) 0%, rgba(234,179,8,0.1) 50%, rgba(22,163,74,0.15) 100%)",
              }}
            />
            <div className="absolute inset-0 backdrop-blur-xl" />

            {/* Content */}
            <div className="relative z-10">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-500/20 to-yellow-500/10 border border-white/10 flex items-center justify-center mx-auto mb-6">
                <Compass className="w-8 h-8 text-white" />
              </div>

              <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4 tracking-tight">
                Ready to Plan Your Next Adventure?
              </h2>
              <p className="text-white/45 text-base sm:text-lg mb-8 max-w-xl mx-auto font-medium">
                Join thousands of travelers who plan smarter with AI. It&apos;s
                free, fast, and fun.
              </p>

              <Link
                href="/register"
                className="group relative inline-flex items-center justify-center gap-2.5 px-10 py-4 rounded-2xl font-bold text-white text-lg overflow-hidden transition-all duration-300 hover:scale-[1.02]"
                style={{
                  background: "linear-gradient(135deg, #ef4444, #dc2626)",
                  boxShadow: "0 8px 32px rgba(239, 68, 68, 0.35)",
                }}
              >
                <Compass className="w-5 h-5 relative z-10" />
                <span className="relative z-10">
                  Start Planning — It&apos;s Free
                </span>
                <ArrowRight className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform" />
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          FOOTER
          ═══════════════════════════════════════════════════════════ */}
      <footer className="relative z-10 border-t border-white/5 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Compass className="w-5 h-5 text-white/30" />
              <span className="text-sm font-bold text-white/30">
                TripGenius
              </span>
            </div>
            <p className="text-white/20 text-xs font-medium text-center">
              © 2026 TripGenius. Built with Next.js, Express, Lucide & Google
              Gemini AI.
            </p>
            <div className="flex items-center gap-4">
              <Link
                href="/login"
                className="text-white/25 hover:text-white/50 text-xs font-semibold transition-colors"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="text-white/25 hover:text-white/50 text-xs font-semibold transition-colors"
              >
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

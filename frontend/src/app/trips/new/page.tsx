"use client";

import { useState, FormEvent, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { tripsApi } from "@/utils/api";
import {
  MapPin,
  Compass,
  Calendar,
  Coins,
  Gem,
  Target,
  Sparkles,
  AlertCircle,
  ArrowRight,
  Loader2,
  DollarSign,
  Globe,
} from "lucide-react";

const INTERESTS_OPTIONS = [
  "Food",
  "Culture",
  "Adventure",
  "Shopping",
  "Nature",
  "Nightlife",
  "History",
  "Photography",
  "Relaxation",
  "Architecture",
  "Sports",
  "Art",
];

const BUDGET_OPTIONS = [
  { value: "Low", label: "Budget", iconKey: "low", desc: "Hostels, street food, public transport" },
  { value: "Medium", label: "Mid-Range", iconKey: "medium", desc: "3-star hotels, local restaurants, taxis" },
  { value: "High", label: "Luxury", iconKey: "high", desc: "5-star hotels, fine dining, private transfers" },
];

const CURRENCY_OPTIONS = [
  { value: "INR", label: "Indian Rupee (₹)", symbol: "₹" },
  { value: "USD", label: "US Dollar ($)", symbol: "$" },
  { value: "EUR", label: "Euro (€)", symbol: "€" },
  { value: "GBP", label: "British Pound (£)", symbol: "£" },
  { value: "JPY", label: "Japanese Yen (¥)", symbol: "¥" },
  { value: "AUD", label: "Australian Dollar (A$)", symbol: "A$" },
  { value: "CAD", label: "Canadian Dollar (C$)", symbol: "C$" },
];

const POPULAR_DESTINATIONS = [
  { name: "Tokyo, Japan", image: "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?q=80&w=400&auto=format&fit=crop" },
  { name: "Paris, France", image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=400&auto=format&fit=crop" },
  { name: "New York, USA", image: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?q=80&w=400&auto=format&fit=crop" },
  { name: "Rome, Italy", image: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?q=80&w=400&auto=format&fit=crop" },
  { name: "Sydney, Australia", image: "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?q=80&w=400&auto=format&fit=crop" },
];

const budgetIcons: Record<string, React.ReactNode> = {
  low: <Compass className="w-6 h-6 text-success" />,
  medium: <Coins className="w-6 h-6 text-accent" />,
  high: <Gem className="w-6 h-6 text-primary" />,
};

export default function NewTripPage() {
  const { user, token, loading } = useAuth();
  const router = useRouter();
  const [destination, setDestination] = useState("");
  const [startingPoint, setStartingPoint] = useState("");
  const [currency, setCurrency] = useState("INR");
  const [days, setDays] = useState(3);
  const [budgetType, setBudgetType] = useState("Medium");
  const [interests, setInterests] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  const toggleInterest = (interest: string) => {
    setInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : [...prev, interest]
    );
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (!startingPoint.trim()) {
      setError("Please enter a starting point");
      return;
    }

    if (!destination.trim()) {
      setError("Please enter a destination");
      return;
    }

    if (interests.length === 0) {
      setError("Please select at least one interest");
      return;
    }

    setSubmitting(true);
    try {
      const data = await tripsApi.create(token!, {
        destination: destination.trim(),
        startingPoint: startingPoint.trim(),
        currency,
        days,
        budgetType,
        interests,
      });
      router.push(`/trips/${data.trip._id}`);
    } catch (err: any) {
      setError(err.message || "Failed to create trip");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="animate-fade-in relative">
        <div className="mb-10 text-center">
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight">
            Plan a <span className="gradient-text">New Adventure</span>
          </h1>
          <p className="text-text-muted mt-2.5 font-semibold text-sm sm:text-base">
            Tell us about your starting point, destination, currency, and travel style to generate the perfect plan.
          </p>
        </div>

        {/* Popular Destinations Row with Pictures */}
        <div className="mb-10">
          <p className="text-base font-bold mb-4 text-text flex items-center gap-2">
            <Globe className="w-5 h-5 text-primary" />
            <span>Need inspiration? Click a popular destination:</span>
          </p>
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin">
            {POPULAR_DESTINATIONS.map((dest) => (
              <button
                key={dest.name}
                type="button"
                onClick={() => setDestination(dest.name)}
                className="flex-shrink-0 w-36 sm:w-44 text-left group cursor-pointer"
              >
                <div className="relative aspect-[4/3] rounded-xl overflow-hidden mb-2 border border-surface-lighter shadow-sm group-hover:border-accent group-hover:shadow transition-all duration-300">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={dest.image}
                    alt={dest.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent" />
                  <span className="absolute bottom-2 left-2 text-white font-bold text-xs truncate w-[90%]">
                    {dest.name.split(",")[0]}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="bg-danger/10 border border-danger/25 text-danger rounded-xl px-4 py-3.5 mb-6 text-sm flex items-center gap-2 font-semibold">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Starting Point & Destination in one glass card */}
          <div className="glass-card p-6 space-y-5 border-l-4 border-l-primary">
            <div>
              <label htmlFor="startingPoint" className="text-base font-bold mb-2.5 flex items-center gap-2">
                <Compass className="w-5 h-5 text-success animate-spin-slow" />
                <span>Starting Point (Origin)</span>
              </label>
              <input
                id="startingPoint"
                type="text"
                value={startingPoint}
                onChange={(e) => setStartingPoint(e.target.value)}
                placeholder="e.g. New Delhi, India"
                className="input-field text-base font-semibold"
                required
              />
            </div>

            <div className="border-t border-surface-light pt-4">
              <label htmlFor="destination" className="text-base font-bold mb-2.5 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary" />
                <span>Destination</span>
              </label>
              <input
                id="destination"
                type="text"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="e.g. Tokyo, Japan"
                className="input-field text-base font-semibold"
                required
              />
            </div>
          </div>

          {/* Currency Selector */}
          <div className="glass-card p-6 border-l-4 border-l-accent">
            <label htmlFor="currency" className="text-base font-bold mb-3 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-accent" />
              <span>Select Your Currency</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <select
                id="currency"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="input-field font-semibold text-base py-3 cursor-pointer"
              >
                {CURRENCY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <div className="flex items-center gap-2 text-xs text-text-muted font-bold leading-relaxed bg-surface-light/45 p-3 rounded-xl border border-surface-lighter">
                <Sparkles className="w-4 h-4 text-accent shrink-0" />
                <span>All budget details, hotels, and activity prices will scale in this selected currency automatically!</span>
              </div>
            </div>
          </div>

          {/* Duration */}
          <div className="glass-card p-6 border-l-4 border-l-success">
            <label htmlFor="days" className="text-base font-bold mb-3 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-success" />
              <span>Trip Duration</span>
            </label>
            <div className="flex items-center gap-4 bg-surface-light/30 p-3 rounded-xl border border-surface-lighter">
              <input
                id="days"
                type="range"
                min={1}
                max={14}
                value={days}
                onChange={(e) => setDays(Number(e.target.value))}
                className="flex-1 accent-primary h-1.5 bg-surface-lighter rounded-full appearance-none cursor-pointer"
              />
              <span className="text-3xl font-extrabold text-primary min-w-[3.5rem] text-center">
                {days}
              </span>
              <span className="text-text-muted font-bold text-sm">day{days > 1 ? "s" : ""}</span>
            </div>
          </div>

          {/* Budget */}
          <div className="glass-card p-6">
            <p className="text-base font-bold mb-4 flex items-center gap-2">
              <Coins className="w-5 h-5 text-accent" />
              <span>Budget Preference</span>
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {BUDGET_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setBudgetType(option.value)}
                  className={`p-5 rounded-xl border-2 text-left transition-all duration-200 cursor-pointer ${
                    budgetType === option.value
                      ? "border-primary bg-primary/5 shadow-sm"
                      : "border-surface-lighter hover:border-surface-light bg-surface/40"
                  }`}
                >
                  <span className="block mb-2.5">{budgetIcons[option.iconKey]}</span>
                  <span className="font-bold block text-sm mb-1">{option.label}</span>
                  <span className="text-text-muted text-xs leading-relaxed">{option.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Interests */}
          <div className="glass-card p-6">
            <p className="text-base font-bold mb-4 flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              <span>Select Interests</span>
            </p>
            <div className="flex flex-wrap gap-2.5">
              {INTERESTS_OPTIONS.map((interest) => (
                <button
                  key={interest}
                  type="button"
                  onClick={() => toggleInterest(interest)}
                  className={`chip ${
                    interests.includes(interest) ? "chip-active" : "chip-inactive"
                  }`}
                >
                  {interest}
                </button>
              ))}
            </div>
            {interests.length > 0 && (
              <p className="text-text-muted text-xs font-bold mt-3.5">
                Selected: {interests.join(", ")}
              </p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting}
            className="btn-primary w-full py-4 text-base font-extrabold flex items-center justify-center gap-2.5 shadow-lg cursor-pointer"
          >
            {submitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin text-white" />
                <span>Generating your custom plan with Gemini AI...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 text-accent animate-pulse" />
                <span>Generate Travel Plan</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </>
            )}
          </button>

          {submitting && (
            <p className="text-center text-text-muted text-xs font-semibold animate-pulse">
              This may take 10-15 seconds while our AI structures your custom travel details...
            </p>
          )}
        </form>
      </div>
    </div>
  );
}

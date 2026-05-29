"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { tripsApi } from "@/utils/api";
import Link from "next/link";
import {
  Plus,
  Trash2,
  Compass,
  MapPin,
  Calendar,
  Tag,
  ArrowRight,
  Loader2,
  Map,
  DollarSign,
} from "lucide-react";

interface TripSummary {
  _id: string;
  destination: string;
  startingPoint?: string;
  currency?: string;
  days: number;
  budgetType: string;
  interests: string[];
  createdAt: string;
}

const currencySymbols: Record<string, string> = {
  INR: "₹",
  USD: "$",
  EUR: "€",
  GBP: "£",
  JPY: "¥",
  AUD: "A$",
  CAD: "C$",
};

function getDestinationImage(dest: string): string {
  const normalized = dest.toLowerCase();
  if (normalized.includes("tokyo") || normalized.includes("japan")) {
    return "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?q=80&w=500&auto=format&fit=crop";
  }
  if (normalized.includes("paris") || normalized.includes("france")) {
    return "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=500&auto=format&fit=crop";
  }
  if (normalized.includes("rome") || normalized.includes("italy")) {
    return "https://images.unsplash.com/photo-1552832230-c0197dd311b5?q=80&w=500&auto=format&fit=crop";
  }
  if (normalized.includes("new york") || normalized.includes("usa") || normalized.includes("york")) {
    return "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?q=80&w=500&auto=format&fit=crop";
  }
  if (normalized.includes("sydney") || normalized.includes("australia")) {
    return "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?q=80&w=500&auto=format&fit=crop";
  }
  if (normalized.includes("london") || normalized.includes("uk") || normalized.includes("england")) {
    return "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?q=80&w=500&auto=format&fit=crop";
  }
  return "https://images.unsplash.com/photo-1488646953014-85cb44e25828?q=80&w=500&auto=format&fit=crop";
}

export default function DashboardPage() {
  const { user, token, loading } = useAuth();
  const router = useRouter();
  const [trips, setTrips] = useState<TripSummary[]>([]);
  const [fetching, setFetching] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (token) {
      tripsApi
        .getAll(token)
        .then((data) => setTrips(data.trips))
        .catch(console.error)
        .finally(() => setFetching(false));
    }
  }, [token]);

  const handleDelete = async (id: string) => {
    if (!token || !confirm("Are you sure you want to delete this trip?")) return;
    setDeleting(id);
    try {
      await tripsApi.delete(token, id);
      setTrips((prev) => prev.filter((t) => t._id !== id));
    } catch (err) {
      console.error(err);
    } finally {
      setDeleting(null);
    }
  };

  const budgetColors: Record<string, string> = {
    Low: "text-success border-success/30 bg-success/10",
    Medium: "text-accent border-accent/30 bg-accent/10",
    High: "text-primary border-primary/30 bg-primary/10",
  };

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-10 animate-fade-in">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
            Welcome back, <span className="gradient-text">{user.name}</span>
          </h1>
          <p className="text-text-muted mt-1 font-semibold text-sm">Explore and manage your custom travel itineraries</p>
        </div>
        <Link href="/trips/new" className="btn-primary py-3 px-6 text-sm font-bold cursor-pointer">
          <Plus className="w-4 h-4 shrink-0" />
          Plan a New Trip
        </Link>
      </div>

      {/* Trips Grid */}
      {fetching ? (
        <div className="flex items-center justify-center py-20">
          <div className="spinner"></div>
        </div>
      ) : trips.length === 0 ? (
        <div className="glass-card p-16 text-center animate-fade-in border border-primary/20 bg-white/95">
          <Compass className="w-16 h-16 text-primary mx-auto mb-6 animate-pulse" />
          <h2 className="text-2xl font-black mb-3">No Saved Trips</h2>
          <p className="text-text-muted mb-8 max-w-md mx-auto font-semibold text-sm">
            Ready to explore? Start by planning your first AI-powered travel plan scaled to your currency!
          </p>
          <Link href="/trips/new" className="btn-primary py-3.5 px-8 font-bold text-sm cursor-pointer">
            Create Your First Trip
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 stagger-children">
          {trips.map((trip) => (
            <div
              key={trip._id}
              className="glass-card glass-card-hover flex flex-col overflow-hidden transition-all duration-300 border border-surface-lighter hover:border-primary/30"
            >
              {/* Destination Image with Float Overlay */}
              <div className="relative aspect-[16/9] w-full overflow-hidden border-b border-surface-lighter">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={getDestinationImage(trip.destination)}
                  alt={trip.destination}
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-transparent to-transparent" />
                <span
                  className={`absolute top-3 right-3 text-[10px] font-extrabold px-3 py-1 rounded-full border shadow-sm backdrop-blur-sm uppercase tracking-wider ${
                    budgetColors[trip.budgetType] || ""
                  }`}
                >
                  {trip.budgetType}
                </span>

                <div className="absolute bottom-3 left-3 right-3">
                  <div className="flex items-center gap-1.5 text-xs text-white/90 font-bold">
                    <Map className="w-3.5 h-3.5 text-accent shrink-0" />
                    <span className="truncate">{trip.startingPoint || "Origin"}</span>
                    <span className="text-primary-light font-bold">➔</span>
                    <span className="truncate text-white">{trip.destination}</span>
                  </div>
                </div>
              </div>

              {/* Details */}
              <div className="p-5 flex-1 flex flex-col">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-black truncate text-text">
                    {trip.destination}
                  </h3>
                  <span className="text-xs font-bold text-success bg-success/10 border border-success/20 px-2 py-0.5 rounded-lg flex items-center shrink-0">
                    <DollarSign className="w-3 h-3 mr-0.5" />
                    {trip.currency || "INR"}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 text-text-muted text-xs font-semibold mb-4">
                  <Calendar className="w-4 h-4 text-primary shrink-0" />
                  <span>
                    {trip.days} day{trip.days > 1 ? "s" : ""} · {new Date(trip.createdAt).toLocaleDateString()}
                  </span>
                </div>

                {/* Interests */}
                <div className="flex flex-wrap gap-1.5 mb-5">
                  {trip.interests.slice(0, 3).map((interest) => (
                    <span
                      key={interest}
                      className="chip chip-active text-[10px] py-0.5 px-2.5 font-bold"
                    >
                      <Tag className="w-3 h-3 mr-1 inline shrink-0" />
                      {interest}
                    </span>
                  ))}
                  {trip.interests.length > 3 && (
                    <span className="chip chip-inactive text-[10px] py-0.5 px-2.5 font-bold">
                      +{trip.interests.length - 3}
                    </span>
                  )}
                </div>

                {/* Actions */}
                <div className="mt-auto flex gap-3 pt-3 border-t border-surface-light">
                  <Link
                    href={`/trips/${trip._id}`}
                    className="btn-primary flex-1 py-2.5 text-xs font-extrabold flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>View Planner</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                  <button
                    onClick={() => handleDelete(trip._id)}
                    disabled={deleting === trip._id}
                    className="btn-danger py-2.5 px-3.5 text-xs font-bold flex items-center justify-center cursor-pointer shrink-0"
                    title="Delete Trip"
                  >
                    {deleting === trip._id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

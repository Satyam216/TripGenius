"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { tripsApi } from "@/utils/api";
import {
  ArrowLeft,
  Calendar,
  DollarSign,
  Hotel,
  Luggage,
  ChevronDown,
  Clock,
  X,
  Plus,
  RefreshCw,
  Plane,
  Utensils,
  Sparkles,
  Car,
  Star,
  Check,
  Loader2,
  MapPin,
  Compass,
  Train,
  Bus,
  FileText,
  Info,
} from "lucide-react";

interface Activity {
  _id: string;
  time: string;
  activity: string;
  description: string;
  estimatedCost: number;
}

interface DayItinerary {
  _id: string;
  day: number;
  title: string;
  activities: Activity[];
}

interface Budget {
  flights: number;
  accommodation: number;
  food: number;
  activities: number;
  transportation: number;
  total: number;
}

interface HotelData {
  _id: string;
  name: string;
  tier: string;
  pricePerNight: number;
  rating: number;
  description: string;
}

interface PackingItem {
  _id: string;
  name: string;
  packed: boolean;
}

interface PackingCategory {
  _id: string;
  category: string;
  items: PackingItem[];
}

interface TransitExpenses {
  flight: number;
  train: number;
  bus: number;
  car: number;
  visa: number;
  visaRequired: boolean;
  notes: string;
}

interface Trip {
  _id: string;
  destination: string;
  startingPoint?: string;
  currency?: string;
  days: number;
  budgetType: string;
  interests: string[];
  itinerary: DayItinerary[];
  budget: Budget;
  hotels: HotelData[];
  packingList: PackingCategory[];
  transitExpenses?: TransitExpenses;
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

export default function TripDetailPage() {
  const { user, token, loading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const tripId = params.id as string;

  const [trip, setTrip] = useState<Trip | null>(null);
  const [fetching, setFetching] = useState(true);
  const [activeTab, setActiveTab] = useState<"itinerary" | "budget" | "transit" | "hotels" | "packing">("itinerary");
  const [expandedDay, setExpandedDay] = useState<number | null>(1);
  const [regeneratingDay, setRegeneratingDay] = useState<number | null>(null);
  const [regeneratePrompt, setRegeneratePrompt] = useState("");
  const [showRegenerateModal, setShowRegenerateModal] = useState<number | null>(null);
  const [addingActivity, setAddingActivity] = useState<number | null>(null);
  const [removingActivity, setRemovingActivity] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (token && tripId) {
      tripsApi
        .getById(token, tripId)
        .then((data) => setTrip(data.trip))
        .catch(() => router.push("/dashboard"))
        .finally(() => setFetching(false));
    }
  }, [token, tripId, router]);

  // --- Handlers ---

  const handleRegenerateDay = async (dayNumber: number) => {
    if (!token || !regeneratePrompt.trim()) return;
    setRegeneratingDay(dayNumber);
    setShowRegenerateModal(null);
    try {
      const data = await tripsApi.regenerateDay(token, tripId, dayNumber, regeneratePrompt);
      setTrip(data.trip);
      setRegeneratePrompt("");
    } catch (err) {
      console.error(err);
    } finally {
      setRegeneratingDay(null);
    }
  };

  const handleAddActivity = async (dayNumber: number) => {
    if (!token) return;
    setAddingActivity(dayNumber);
    try {
      const data = await tripsApi.addActivity(token, tripId, dayNumber, "Afternoon");
      setTrip(data.trip);
    } catch (err) {
      console.error(err);
    } finally {
      setAddingActivity(null);
    }
  };

  const handleRemoveActivity = async (dayNumber: number, activityId: string) => {
    if (!token) return;
    setRemovingActivity(activityId);
    try {
      const data = await tripsApi.removeActivity(token, tripId, dayNumber, activityId);
      setTrip(data.trip);
    } catch (err) {
      console.error(err);
    } finally {
      setRemovingActivity(null);
    }
  };

  const handleTogglePacking = async (categoryIndex: number, itemIndex: number, currentPacked: boolean) => {
    if (!token) return;
    try {
      const data = await tripsApi.updatePackingItem(token, tripId, categoryIndex, itemIndex, !currentPacked);
      setTrip(data.trip);
    } catch (err) {
      console.error(err);
    }
  };

  // --- Calendar Export (ICS) ---
  const handleExportCalendar = () => {
    if (!trip) return;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() + 7); // Start 7 days from now
    const symbol = currencySymbols[trip.currency || "INR"] || trip.currency || "₹";

    let icsContent = `BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//TripGenius//EN\r\nCALSCALE:GREGORIAN\r\n`;

    trip.itinerary.forEach((day) => {
      const eventDate = new Date(startDate);
      eventDate.setDate(eventDate.getDate() + day.day - 1);
      const dateStr = eventDate.toISOString().replace(/[-:]/g, "").split("T")[0];

      day.activities.forEach((activity) => {
        icsContent += `BEGIN:VEVENT\r\n`;
        icsContent += `DTSTART;VALUE=DATE:${dateStr}\r\n`;
        icsContent += `SUMMARY:${activity.activity}\r\n`;
        icsContent += `DESCRIPTION:${activity.description.replace(/\n/g, "\\n")} | Time: ${activity.time} | Est. Cost: ${symbol}${activity.estimatedCost}\r\n`;
        icsContent += `LOCATION:${trip.destination}\r\n`;
        icsContent += `END:VEVENT\r\n`;
      });
    });

    icsContent += `END:VCALENDAR`;

    const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${trip.destination.replace(/\s+/g, "_")}_itinerary.ics`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading || fetching || !trip) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <div className="spinner"></div>
        {fetching && <p className="text-text-muted font-bold text-sm">Loading your custom travel planner...</p>}
      </div>
    );
  }

  const symbol = currencySymbols[trip.currency || "INR"] || trip.currency || "₹";

  const budgetCategories = [
    { key: "flights" as const, label: "Flights", icon: <Plane className="w-5 h-5 text-primary" /> },
    { key: "accommodation" as const, label: "Accommodation", icon: <Hotel className="w-5 h-5 text-accent" /> },
    { key: "food" as const, label: "Food & Dining", icon: <Utensils className="w-5 h-5 text-success" /> },
    { key: "activities" as const, label: "Activities", icon: <Sparkles className="w-5 h-5 text-primary" /> },
    { key: "transportation" as const, label: "Local Transport", icon: <Car className="w-5 h-5 text-accent" /> },
  ];

  const tierStyles: Record<string, string> = {
    Budget: "border-success/30 bg-success/5 hover:border-success",
    "Mid-Range": "border-accent/30 bg-accent/5 hover:border-accent",
    Luxury: "border-primary/30 bg-primary/5 hover:border-primary",
  };

  const tierBadge: Record<string, string> = {
    Budget: "bg-success/10 text-success border-success/35",
    "Mid-Range": "bg-accent/15 text-accent border-accent/35",
    Luxury: "bg-primary/10 text-primary border-primary/35",
  };

  const tabs = [
    { id: "itinerary" as const, label: "Itinerary", icon: <Compass className="w-4 h-4" /> },
    { id: "budget" as const, label: "Budget", icon: <DollarSign className="w-4 h-4" /> },
    { id: "transit" as const, label: "Transit & Visa", icon: <Car className="w-4 h-4" /> },
    { id: "hotels" as const, label: "Hotels", icon: <Hotel className="w-4 h-4" /> },
    { id: "packing" as const, label: "Packing", icon: <Luggage className="w-4 h-4" /> },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="animate-fade-in mb-8">
        <button
          onClick={() => router.push("/dashboard")}
          className="text-text-muted hover:text-primary text-sm font-bold mb-4 inline-flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </button>
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-accent uppercase tracking-wider mb-1">
              <MapPin className="w-3.5 h-3.5" />
              <span>{trip.startingPoint || "Origin"}</span>
              <span className="text-primary font-bold">➔</span>
              <span>{trip.destination}</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-text">{trip.destination}</h1>
            <p className="text-text-muted mt-1 text-sm font-bold">
              {trip.days} day{trip.days > 1 ? "s" : ""} · {trip.budgetType} Budget ·{" "}
              {trip.interests.join(", ")}
            </p>
          </div>
          <button
            onClick={handleExportCalendar}
            className="btn-secondary py-2.5 px-5 text-sm font-bold flex items-center gap-2 cursor-pointer"
          >
            <Calendar className="w-4 h-4" />
            <span>Export to Calendar</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-8 overflow-x-auto pb-2 border-b border-surface-lighter animate-fade-in scrollbar-none">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-5 py-3 rounded-xl text-sm font-extrabold whitespace-nowrap transition-all duration-200 cursor-pointer flex items-center gap-2 border ${
              activeTab === tab.id
                ? "bg-primary/8 text-primary border-primary/45 shadow-sm"
                : "bg-surface text-text-muted hover:bg-surface-light border-surface-lighter hover:text-text"
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* --- ITINERARY TAB --- */}
      {activeTab === "itinerary" && (
        <div className="space-y-4 stagger-children">
          {trip.itinerary.map((day) => (
            <div key={day.day} className="glass-card overflow-hidden border border-surface-lighter hover:border-primary/30">
              {/* Day Header (Accordion Toggle) */}
              <button
                onClick={() => setExpandedDay(expandedDay === day.day ? null : day.day)}
                className="w-full flex items-center justify-between p-6 text-left hover:bg-surface-light/40 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <span className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-extrabold text-lg border border-primary/20">
                    {day.day}
                  </span>
                  <div>
                    <h3 className="text-lg font-black text-text">Day {day.day}: {day.title}</h3>
                    <p className="text-text-muted text-xs font-bold mt-0.5 flex items-center gap-3">
                      <span>{day.activities.length} Activities</span>
                      <span className="text-surface-lighter font-normal">|</span>
                      <span className="text-success font-extrabold flex items-center">
                        <span className="mr-0.5">{symbol}</span>
                        {day.activities.reduce((sum, a) => sum + a.estimatedCost, 0).toLocaleString()} Est.
                      </span>
                    </p>
                  </div>
                </div>
                <ChevronDown
                  className={`w-5 h-5 text-text-muted transition-transform duration-300 ${
                    expandedDay === day.day ? "rotate-180 text-primary" : ""
                  }`}
                />
              </button>

              {/* Day Content (Expanded) */}
              {expandedDay === day.day && (
                <div className="px-6 pb-6 animate-fade-in">
                  <div className="border-t border-surface-light pt-4">
                    {/* Activities */}
                    <div className="space-y-3">
                      {day.activities.map((activity) => (
                        <div
                          key={activity._id}
                          className="flex items-start gap-4 p-4 rounded-xl bg-surface-light/40 border border-surface-lighter group hover:border-accent/40 transition-all"
                        >
                          <span className="text-xs font-bold text-primary bg-primary/8 border border-primary/20 px-2.5 py-1 rounded-lg whitespace-nowrap mt-0.5 flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            {activity.time}
                          </span>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-extrabold text-text">{activity.activity}</h4>
                            <p className="text-text-muted text-sm mt-1 leading-relaxed font-medium">{activity.description}</p>
                            <span className="text-success text-sm font-black mt-2 inline-flex items-center bg-success/8 px-2 py-0.5 rounded border border-success/15">
                              <span>{symbol}</span>
                              {activity.estimatedCost.toLocaleString()}
                            </span>
                          </div>
                          <button
                            onClick={() => handleRemoveActivity(day.day, activity._id)}
                            disabled={removingActivity === activity._id}
                            className="opacity-0 group-hover:opacity-100 text-danger hover:bg-danger/10 border border-danger/20 transition-all text-xs p-1.5 rounded-lg cursor-pointer shrink-0"
                            title="Remove activity"
                          >
                            {removingActivity === activity._id ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <X className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* Day Actions */}
                    <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t border-surface-light">
                      <button
                        onClick={() => handleAddActivity(day.day)}
                        disabled={addingActivity === day.day}
                        className="btn-secondary text-xs py-2 px-4 cursor-pointer font-bold flex items-center gap-1.5"
                      >
                        {addingActivity === day.day ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-accent" />
                            <span>Adding...</span>
                          </>
                        ) : (
                          <>
                            <Plus className="w-3.5 h-3.5" />
                            <span>Suggest New Activity</span>
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => {
                          setShowRegenerateModal(day.day);
                          setRegeneratePrompt("");
                        }}
                        disabled={regeneratingDay === day.day}
                        className="btn-secondary text-xs py-2 px-4 cursor-pointer font-bold flex items-center gap-1.5"
                      >
                        {regeneratingDay === day.day ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-accent" />
                            <span>Regenerating...</span>
                          </>
                        ) : (
                          <>
                            <RefreshCw className="w-3.5 h-3.5" />
                            <span>Regenerate Day Plan</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* --- BUDGET TAB --- */}
      {activeTab === "budget" && (
        <div className="animate-fade-in">
          {/* Total */}
          <div className="glass-card p-8 mb-6 text-center border-2 border-primary/20 bg-white/95">
            <p className="text-text-muted text-xs font-black uppercase tracking-widest mb-2.5">Total Scaled Budget</p>
            <p className="text-5xl font-black text-primary">{symbol}{trip.budget.total.toLocaleString()}</p>
            <p className="text-text-muted mt-2 text-sm font-bold">
              Scaled to {trip.currency || "INR"} pricing for {trip.days} days
            </p>
          </div>

          {/* Breakdown */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 stagger-children">
            {budgetCategories.map((cat) => {
              const amount = trip.budget[cat.key];
              const percentage = trip.budget.total > 0 ? (amount / trip.budget.total) * 100 : 0;
              return (
                <div key={cat.key} className="glass-card p-6 border border-surface-lighter hover:border-primary/25">
                  <div className="flex items-center gap-3.5 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-surface-light border border-surface-lighter flex items-center justify-center shrink-0">
                      {cat.icon}
                    </div>
                    <div>
                      <p className="text-text-muted text-xs font-bold uppercase tracking-wider">{cat.label}</p>
                      <p className="text-xl font-black mt-0.5">{symbol}{amount.toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="w-full h-2 bg-surface-light rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-700"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                  <p className="text-text-muted text-[10px] font-bold mt-2">{percentage.toFixed(1)}% of total</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* --- TRANSIT TAB --- */}
      {activeTab === "transit" && (
        <div className="space-y-6 animate-fade-in animate-duration-300">
          {/* Main Transit Details Header */}
          <div className="glass-card p-6 border-l-4 border-l-primary flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/95">
            <div>
              <h3 className="text-xl font-black text-text">Estimated Transit & Visa Expenses</h3>
              <p className="text-text-muted text-xs font-bold mt-1">
                Cost estimates from {trip.startingPoint || "Origin"} to {trip.destination} scaled in {trip.currency || "INR"}
              </p>
            </div>
            <div className={`px-4.5 py-2.5 rounded-xl border font-black text-xs uppercase tracking-wider flex items-center gap-2 ${
              trip.transitExpenses?.visaRequired
                ? "bg-primary/10 text-primary border-primary/35"
                : "bg-success/10 text-success border-success/35"
            }`}>
              <FileText className="w-4 h-4 shrink-0" />
              <span>{trip.transitExpenses?.visaRequired ? "Visa Required" : "No Visa Required / Visa Free"}</span>
            </div>
          </div>

          {/* Transit Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 stagger-children">
            {/* Flights */}
            <div className="glass-card p-5 border border-surface-lighter flex flex-col justify-between hover:border-primary/45 transition-all bg-white/90">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                  <Plane className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-text-muted uppercase tracking-wider">Flight</span>
              </div>
              <div>
                <p className="text-2xl font-black text-text">{symbol}{(trip.transitExpenses?.flight ?? 0).toLocaleString()}</p>
                <p className="text-text-muted text-[10px] font-bold mt-1">Estimated airfare</p>
              </div>
            </div>

            {/* Train */}
            <div className="glass-card p-5 border border-surface-lighter flex flex-col justify-between hover:border-accent/45 transition-all bg-white/90">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-9 h-9 rounded-lg bg-accent/15 border border-accent/30 flex items-center justify-center text-accent">
                  <Train className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-text-muted uppercase tracking-wider">Train</span>
              </div>
              <div>
                <p className="text-2xl font-black text-text">{symbol}{(trip.transitExpenses?.train ?? 0).toLocaleString()}</p>
                <p className="text-text-muted text-[10px] font-bold mt-1">Estimated rail fare</p>
              </div>
            </div>

            {/* Bus */}
            <div className="glass-card p-5 border border-surface-lighter flex flex-col justify-between hover:border-success/45 transition-all bg-white/90">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-9 h-9 rounded-lg bg-success/10 border border-success/20 flex items-center justify-center text-success">
                  <Bus className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-text-muted uppercase tracking-wider">Bus</span>
              </div>
              <div>
                <p className="text-2xl font-black text-text">{symbol}{(trip.transitExpenses?.bus ?? 0).toLocaleString()}</p>
                <p className="text-text-muted text-[10px] font-bold mt-1">Intercity coach fare</p>
              </div>
            </div>

            {/* Car/Cab */}
            <div className="glass-card p-5 border border-surface-lighter flex flex-col justify-between hover:border-primary/45 transition-all bg-white/90">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                  <Car className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-text-muted uppercase tracking-wider">Car / Cab</span>
              </div>
              <div>
                <p className="text-2xl font-black text-text">{symbol}{(trip.transitExpenses?.car ?? 0).toLocaleString()}</p>
                <p className="text-text-muted text-[10px] font-bold mt-1">Rental, fuel, or cab</p>
              </div>
            </div>

            {/* Visa application */}
            <div className="glass-card p-5 border border-surface-lighter flex flex-col justify-between hover:border-accent/45 transition-all bg-white/90">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-9 h-9 rounded-lg bg-accent/15 border border-accent/30 flex items-center justify-center text-accent">
                  <FileText className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-text-muted uppercase tracking-wider">Visa Fee</span>
              </div>
              <div>
                <p className="text-2xl font-black text-text">{symbol}{(trip.transitExpenses?.visa ?? 0).toLocaleString()}</p>
                <p className="text-text-muted text-[10px] font-bold mt-1">Application fees</p>
              </div>
            </div>
          </div>

          {/* Visa Notes & Travel Information */}
          {trip.transitExpenses?.notes && (
            <div className="glass-card p-6 border-l-4 border-l-accent flex items-start gap-4 bg-white/95">
              <Info className="w-6 h-6 text-accent shrink-0 mt-0.5" />
              <div>
                <h4 className="font-extrabold text-text">Important Entry & Travel Requirements</h4>
                <p className="text-text-muted text-sm mt-1.5 leading-relaxed font-semibold">
                  {trip.transitExpenses.notes}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* --- HOTELS TAB --- */}
      {activeTab === "hotels" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 stagger-children">
          {trip.hotels.map((hotel) => (
            <div
              key={hotel._id}
              className={`glass-card p-6 border-2 transition-all duration-300 hover:scale-[1.02] flex flex-col justify-between ${tierStyles[hotel.tier] || ""}`}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className={`text-[10px] font-extrabold px-3 py-1 rounded-full border uppercase tracking-wider ${tierBadge[hotel.tier] || ""}`}>
                    {hotel.tier}
                  </span>
                  <div className="flex items-center gap-1 bg-surface-light border border-surface-lighter px-2.5 py-1 rounded-lg">
                    <Star className="w-3.5 h-3.5 text-accent fill-accent" />
                    <span className="font-bold text-xs text-text">{hotel.rating}</span>
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-2.5 text-text">{hotel.name}</h3>
                <p className="text-text-muted text-sm mb-6 leading-relaxed font-medium">{hotel.description}</p>
              </div>
              <div className="pt-4 border-t border-surface-light mt-4">
                <p className="text-2xl font-black text-text">
                  {symbol}{hotel.pricePerNight.toLocaleString()}
                  <span className="text-text-muted text-xs font-bold uppercase tracking-wider"> / Night</span>
                </p>
                <p className="text-text-muted text-xs font-bold mt-1">
                  Est. Total: {symbol}{(hotel.pricePerNight * trip.days).toLocaleString()} for {trip.days} nights
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* --- PACKING LIST TAB --- */}
      {activeTab === "packing" && (
        <div className="space-y-4 stagger-children">
          {trip.packingList.map((category, catIdx) => {
            const packedCount = category.items.filter((i) => i.packed).length;
            const progressWidth = category.items.length > 0 ? (packedCount / category.items.length) * 100 : 0;
            return (
              <div key={category._id} className="glass-card p-6 border border-surface-lighter">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-text">{category.category}</h3>
                  <span className="text-xs font-bold text-text-muted bg-surface-light px-2.5 py-1 rounded-lg border border-surface-lighter">
                    {packedCount}/{category.items.length} Packed
                  </span>
                </div>
                <div className="w-full h-1.5 bg-surface-light rounded-full overflow-hidden mb-4">
                  <div
                    className="h-full bg-gradient-to-r from-success to-success-light rounded-full transition-all duration-500"
                    style={{
                      width: `${progressWidth}%`,
                    }}
                  ></div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {category.items.map((item, itemIdx) => (
                    <label
                      key={item._id}
                      className={`flex items-center gap-3 p-3.5 rounded-xl cursor-pointer transition-all duration-200 ${
                        item.packed
                          ? "bg-success/5 border border-success/20"
                          : "bg-surface-light/40 border border-surface-lighter hover:border-surface-light"
                      }`}
                    >
                      <div className="relative flex items-center justify-center shrink-0">
                        <input
                          type="checkbox"
                          checked={item.packed}
                          onChange={() => handleTogglePacking(catIdx, itemIdx, item.packed)}
                          className="sr-only"
                        />
                        <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
                          item.packed
                            ? "bg-success border-success text-white"
                            : "border-surface-lighter bg-white"
                        }`}>
                          {item.packed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>
                      </div>
                      <span
                        className={`text-sm font-semibold ${
                          item.packed ? "line-through text-text-muted" : "text-text"
                        }`}
                      >
                        {item.name}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Regenerate Day Modal */}
      {showRegenerateModal !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="glass-card p-8 max-w-lg w-full animate-fade-in border border-primary/20 shadow-md">
            <h3 className="text-xl font-bold mb-1 flex items-center gap-2">
              <RefreshCw className="w-5 h-5 text-primary" />
              <span>Adjust Day {showRegenerateModal}</span>
            </h3>
            <p className="text-text-muted text-xs font-semibold mb-4 leading-relaxed">
              Describe what changes you want on Day {showRegenerateModal}. scaled to {trip.currency || "INR"}.
            </p>
            <textarea
              value={regeneratePrompt}
              onChange={(e) => setRegeneratePrompt(e.target.value)}
              placeholder="e.g. Focus on local temples and shopping spots"
              className="input-field min-h-[120px] resize-none mb-5 font-semibold text-sm leading-relaxed"
              autoFocus
            />
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowRegenerateModal(null)}
                className="btn-secondary py-2.5 px-5 font-bold text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleRegenerateDay(showRegenerateModal)}
                disabled={!regeneratePrompt.trim()}
                className="btn-primary py-2.5 px-5 font-bold text-xs cursor-pointer"
              >
                Regenerate Plan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

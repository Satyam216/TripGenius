"use client";

/**
 * AuthCollageBackground — A cinematic full-screen collage background
 * with different image sets per page variant.
 *
 * Variants:
 * - "landing"  → Iconic world landmarks (Eiffel Tower, Taj Mahal, Colosseum, etc.)
 * - "login"    → Adventure & nature (mountains, ocean, aurora, desert)
 * - "register" → Urban & culture (cities, architecture, street scenes)
 */

interface AuthCollageBackgroundProps {
  variant?: "landing" | "login" | "register";
}

const IMAGE_SETS = {
  landing: [
    // Panel 1: Eiffel Tower, Paris
    "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=1200&auto=format&fit=crop",
    // Panel 2: Taj Mahal, India
    "https://images.unsplash.com/photo-1564507592333-c60657eea523?q=80&w=1200&auto=format&fit=crop",
    // Panel 3: Great Wall of China
    "https://images.unsplash.com/photo-1508804185872-d7badad00f7d?q=80&w=1200&auto=format&fit=crop",
    // Panel 4: Colosseum, Rome
    "https://images.unsplash.com/photo-1552832230-c0197dd311b5?q=80&w=1200&auto=format&fit=crop",
    // Panel 5: Christ the Redeemer, Rio
    "https://images.unsplash.com/photo-1483729558449-99ef09a8c325?q=80&w=1200&auto=format&fit=crop",
  ],
  login: [
    // Panel 1: Mountain lake reflection
    "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=1200&auto=format&fit=crop",
    // Panel 2: Maldives overwater bungalow
    "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?q=80&w=1200&auto=format&fit=crop",
    // Panel 3: Northern Lights Iceland
    "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?q=80&w=1200&auto=format&fit=crop",
    // Panel 4: Safari sunset Africa
    "https://images.unsplash.com/photo-1516426122078-c23e76319801?q=80&w=1200&auto=format&fit=crop",
    // Panel 5: Hot air balloons Cappadocia
    "https://images.unsplash.com/photo-1507041957456-9c397ce39c97?q=80&w=1200&auto=format&fit=crop",
  ],
  register: [
    // Panel 1: Tokyo neon streets
    "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?q=80&w=1200&auto=format&fit=crop",
    // Panel 2: Venice canals
    "https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?q=80&w=1200&auto=format&fit=crop",
    // Panel 3: Dubai skyline
    "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=1200&auto=format&fit=crop",
    // Panel 4: Santorini sunset
    "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?q=80&w=1200&auto=format&fit=crop",
    // Panel 5: New York Times Square
    "https://images.unsplash.com/photo-1534430480872-3498386e7856?q=80&w=1200&auto=format&fit=crop",
  ],
};

export default function AuthCollageBackground({
  variant = "landing",
}: AuthCollageBackgroundProps) {
  const images = IMAGE_SETS[variant];

  return (
    <div className="fixed inset-0 z-0 overflow-hidden">
      {/* ─── Image Grid: 3-column layout blending across the full screen ─── */}
      <div className="absolute inset-0 grid grid-cols-2 md:grid-cols-3 grid-rows-2 gap-0">
        {/* Panel 1: Top-left */}
        <div className="collage-panel relative col-span-1 row-span-1 overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={images[0]}
            alt=""
            aria-hidden="true"
            className="w-full h-full object-cover"
            style={{ animationDelay: "0s", animationDuration: "22s" }}
          />
        </div>

        {/* Panel 2: Top-center (tall, spans 2 rows on desktop) */}
        <div className="collage-panel relative col-span-1 row-span-2 overflow-hidden hidden md:block">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={images[1]}
            alt=""
            aria-hidden="true"
            className="w-full h-full object-cover"
            style={{ animationDelay: "3s", animationDuration: "28s" }}
          />
        </div>

        {/* Panel 3: Top-right */}
        <div className="collage-panel relative col-span-1 row-span-1 overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={images[2]}
            alt=""
            aria-hidden="true"
            className="w-full h-full object-cover"
            style={{ animationDelay: "5s", animationDuration: "26s" }}
          />
        </div>

        {/* Panel 4: Bottom-left */}
        <div className="collage-panel relative col-span-1 row-span-1 overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={images[3]}
            alt=""
            aria-hidden="true"
            className="w-full h-full object-cover"
            style={{ animationDelay: "2s", animationDuration: "24s" }}
          />
        </div>

        {/* Panel 5: Bottom-right */}
        <div className="collage-panel relative col-span-1 row-span-1 overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={images[4]}
            alt=""
            aria-hidden="true"
            className="w-full h-full object-cover"
            style={{ animationDelay: "4s", animationDuration: "30s" }}
          />
        </div>
      </div>

      {/* ─── Gradient mesh overlay for readability & mood ─── */}
      <div className="collage-overlay" />

      {/* ─── Top vignette ─── */}
      <div
        className="absolute inset-x-0 top-0 h-48 z-[3]"
        style={{
          background:
            "linear-gradient(to bottom, rgba(15,23,42,0.7) 0%, transparent 100%)",
        }}
      />

      {/* ─── Bottom vignette ─── */}
      <div
        className="absolute inset-x-0 bottom-0 h-48 z-[3]"
        style={{
          background:
            "linear-gradient(to top, rgba(15,23,42,0.7) 0%, transparent 100%)",
        }}
      />

      {/* ─── Subtle noise grain texture ─── */}
      <div
        className="absolute inset-0 z-[4] opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />
    </div>
  );
}

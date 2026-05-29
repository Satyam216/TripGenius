import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "TripGenius — AI Travel Planner",
  description:
    "Plan your perfect trip with AI. Generate day-by-day itineraries, budget estimates, hotel suggestions, and smart packing lists powered by Google Gemini.",
  keywords: ["travel planner", "AI itinerary", "trip planning", "travel budget", "hotel suggestions"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">
        <div className="travel-bg-overlay" />
        <AuthProvider>
          <Navbar />
          <main className="pt-16 min-h-screen">{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}

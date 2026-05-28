# 🌍 TripGenius — AI Travel Planner

> An intelligent full-stack travel planning application that generates personalized day-by-day itineraries, budget estimates, hotel suggestions, and smart packing lists using Google Gemini AI.

![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)
![Express](https://img.shields.io/badge/Express-4.x-green?logo=express)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-brightgreen?logo=mongodb)
![Gemini](https://img.shields.io/badge/Google-Gemini%202.5%20Flash-blue?logo=google)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?logo=typescript)

---

## 📋 Table of Contents

- [Project Overview](#project-overview)
- [Tech Stack](#tech-stack)
- [Features](#features)
- [Architecture](#architecture)
- [Setup Instructions](#setup-instructions)
- [Authentication & Authorization](#authentication--authorization)
- [AI Agent Design](#ai-agent-design)
- [Creative Feature](#creative-feature)
- [Design Decisions & Trade-offs](#design-decisions--trade-offs)
- [Known Limitations](#known-limitations)
- [Deployment](#deployment)

---

## 🎯 Project Overview

TripGenius is a multi-user trip planner where users can:
- **Register and login** securely
- **Create AI-powered trips** by providing a destination, duration, budget preference, and interests
- **View generated itineraries** with day-by-day activities, time slots, and cost estimates
- **Edit itineraries** — add/remove activities and regenerate specific days with custom AI prompts
- **View budget breakdowns** with visual progress bars
- **Browse hotel suggestions** across Budget, Mid-Range, and Luxury tiers
- **Track packing** with an interactive AI-generated checklist
- **Export to calendar** — download itineraries as .ics files

Each user's data is strictly isolated; users cannot access or modify other users' trips.

---

## 🛠 Tech Stack

| Layer | Technology | Justification |
|-------|-----------|---------------|
| **Frontend** | Next.js 15 (App Router) + Tailwind CSS v4 | Server-side rendering, file-based routing, and utility-first CSS for rapid development |
| **Backend** | Node.js + Express.js | Lightweight and widely used REST API framework |
| **Database** | MongoDB (via Mongoose) | Flexible document schema ideal for nested trip data (itineraries, hotels, packing lists) |
| **AI/LLM** | Google Gemini 2.5 Flash via `@google/generative-ai` | Fast inference (~2-4s), JSON schema enforcement, free tier available |
| **Auth** | JWT (jsonwebtoken) + bcryptjs | Stateless auth with secure password hashing |
| **Language** | TypeScript | Type safety across both frontend and backend |

---

## ✨ Features

### Core Features
1. **User Registration & Login** — JWT-based auth with bcrypt password hashing
2. **Trip Input Form** — Destination, duration slider, budget tier cards, interest tag selector
3. **AI Itinerary Generator** — Day-by-day plans with 3-4 activities, time slots, and costs
4. **Budget Estimation** — Complete breakdown: flights, accommodation, food, activities, transport
5. **Editable Itinerary** — Add/remove activities, regenerate specific days with custom AI prompts
6. **Hotel Suggestions** — 3 tiers: Budget, Mid-Range, Luxury with ratings and pricing

### Creative/Bonus Features
7. **🎒 Smart Packing Checklist** — AI generates destination-specific packing lists; users can track packed items with progress bars
8. **📅 Calendar Export (ICS)** — One-click download of itinerary as .ics file for Google/Apple Calendar import

---

## 🏗 Architecture

```
┌────────────────────────┐       ┌────────────────────────┐
│     Next.js Frontend   │ HTTP  │   Express.js Backend   │
│   (Port 3000)          │◄─────►│   (Port 5000)          │
│                        │ JWT   │                        │
│  • App Router          │       │  • /api/auth/*         │
│  • AuthContext         │       │  • /api/trips/*        │
│  • Tailwind CSS        │       │  • Auth Middleware      │
└────────────────────────┘       └───────┬───────┬────────┘
                                         │       │
                                         │       │
                                    ┌────▼──┐ ┌──▼─────────┐
                                    │MongoDB│ │Google Gemini│
                                    │ Atlas │ │  2.5 Flash  │
                                    └───────┘ └─────────────┘
```

### Key Components
- **Frontend**: React Client Components with AuthContext for state management, API utility module for all backend calls
- **Backend**: Controller-Service pattern — controllers handle HTTP, `geminiService.ts` handles all LLM interactions
- **Database**: Two collections — `users` and `trips` with compound index on `userId + createdAt`
- **LLM**: JSON schema enforcement via Gemini SDK's `responseSchema` — guarantees valid structured output

---

## 🚀 Setup Instructions

### Prerequisites
- Node.js 18+ and npm
- MongoDB Atlas account (free tier works) — [Sign up](https://www.mongodb.com/cloud/atlas)
- Google Gemini API key (free) — [Get key](https://aistudio.google.com/apikey)

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd "Trip Management System"
```

### 2. Backend Setup
```bash
cd backend
npm install

# Create environment file
cp .env.example .env
# Edit .env with your actual values:
#   MONGODB_URI=mongodb+srv://...
#   JWT_SECRET=<strong-random-string>
#   GEMINI_API_KEY=<your-gemini-key>
#   PORT=5000
#   FRONTEND_URL=http://localhost:3000

# Start dev server
npm run dev
```

### 3. Frontend Setup
```bash
cd frontend
npm install

# Create environment file
cp .env.example .env.local
# Edit .env.local:
#   NEXT_PUBLIC_API_URL=http://localhost:5000/api

# Start dev server
npm run dev
```

### 4. Access the Application
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000/api/health

---

## 🔐 Authentication & Authorization

### Approach
- **Registration**: Password hashed with bcrypt (12 salt rounds) before storing in MongoDB. Password field excluded from default queries via `select: false`.
- **Login**: Email lookup → bcrypt comparison → JWT token issued (7-day expiry).
- **Authorization**: Every protected route uses `authMiddleware` which extracts and verifies the JWT from `Authorization: Bearer <token>` header, attaching `req.user.id` to the request.
- **Data Isolation**: All trip queries include `userId: req.user.id` in the filter. Users can never access, modify, or delete other users' trips.

### Flow
```
Register → Hash password → Save user → Issue JWT
Login    → Verify password → Issue JWT
Request  → Extract JWT → Verify → Attach user ID → Filter by user ID
```

---

## 🤖 AI Agent Design

### Model: Google Gemini 2.5 Flash

The LLM is used as a **structured data generator**, not a chatbot. Every call enforces a JSON response schema, ensuring the frontend always receives well-typed data.

### How It Works

1. **System Instruction**: A detailed persona prompt establishing the AI as an expert travel planner
2. **User Prompt**: Dynamically constructed from trip inputs (destination, days, budget, interests)
3. **JSON Schema**: The SDK's `responseSchema` parameter forces Gemini to return data matching our exact TypeScript interfaces
4. **Three Functions**:
   - `generateFullTrip()` — Produces complete itinerary + budget + hotels + packing list
   - `regenerateDay()` — Rewrites a single day based on user prompt while considering the full trip context
   - `suggestActivity()` — Adds a single complementary activity to a specific day

### Why This Design
- **No parsing** — Schema enforcement means no regex or string manipulation needed
- **Isolated service** — All LLM logic is in one file (`geminiService.ts`), easy to swap models
- **Context-aware** — Regeneration sends the full itinerary so the AI avoids duplicates

---

## 💡 Creative Feature

### 🎒 Smart Packing Checklist

**What it does**: When a trip is generated, the AI creates a destination-specific packing list organized by category (Clothing, Toiletries, Electronics, Documents, etc.). Users can check off items as they pack, with per-category progress bars.

**Why I built it**: Planning what to pack is a major source of pre-travel anxiety. Generic packing lists don't account for destination climate, cultural norms, or planned activities. By having the AI generate a context-aware list (e.g., suggesting a rain jacket for London, modest clothing for temples in Tokyo, hiking boots for adventure trips), travelers can focus on excitement rather than worry.

**Problem it solves**: Eliminates forgotten items and reduces pre-trip stress by providing actionable, destination-aware packing guidance integrated directly into the trip plan.

### 📅 Calendar Export (ICS)

**What it does**: One-click export of the entire itinerary as a `.ics` file. Each activity becomes a calendar event with the activity name, description, estimated cost, and destination as the location.

**Why I built it**: Most travelers use phone calendars during trips. Instead of switching between the app and their calendar, they can have the full plan natively integrated. This bridges the gap between planning and execution.

---

## ⚖️ Design Decisions & Trade-offs

| Decision | Rationale | Trade-off |
|----------|-----------|-----------|
| **JWT in localStorage** | Simplicity; no cookie/CSRF complexity | Vulnerable to XSS (acceptable for this scope; production would use httpOnly cookies) |
| **Gemini 2.5 Flash** | Free tier, fast response, JSON schema support | Less capable than GPT-4 for nuanced travel advice, but sufficient for structured plans |
| **Monorepo structure** | Simpler setup for assessment; shared TypeScript | Frontend/backend can't be independently versioned easily |
| **Schema enforcement** | Eliminates parsing errors entirely | Constrains AI creativity to the defined schema |
| **Client-side auth state** | Simpler than server-side sessions | Page flash on reload until token is validated |

---

## ⚠️ Known Limitations

1. **LLM Accuracy**: Hotel names and prices are AI-generated and may not match real establishments. In production, this would be supplemented with a hotel booking API (e.g., Booking.com).
2. **No Real-time Pricing**: Budget estimates are AI approximations based on training data, not live market rates.
3. **Calendar Export**: Events are set as all-day events starting 7 days from export date. A date picker would improve this.
4. **No Password Reset**: Current auth doesn't include email-based password recovery.
5. **No Image Generation**: Trip plans are text-based. Adding destination photos via Unsplash API would enhance the UX.

---

## 🚀 Deployment

### Frontend (Vercel)
1. Push the `frontend/` directory to GitHub
2. Connect to Vercel → import repository
3. Set environment variable: `NEXT_PUBLIC_API_URL=<your-backend-url>/api`
4. Deploy

### Backend (Render)
1. Push the `backend/` directory to GitHub
2. Create a new Web Service on Render
3. Set build command: `npm install && npm run build`
4. Set start command: `npm start`
5. Add environment variables: `MONGODB_URI`, `JWT_SECRET`, `GEMINI_API_KEY`, `PORT`, `FRONTEND_URL`

---

## 📄 License

MIT License — feel free to use this project as a starting point for your own travel app.

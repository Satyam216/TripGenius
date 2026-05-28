import { Response } from "express";
import { AuthRequest } from "../middleware/authMiddleware";
import Trip from "../models/Trip";
import {
  generateFullTrip,
  regenerateDay,
  suggestActivity,
} from "../services/geminiService";

// ============================================================
// Normalization helpers — transform variable Gemini output
// into our exact Mongoose schema shape
// ============================================================

/**
 * Extract a numeric day number from strings like "Day 1: Title" or just 1
 */
function extractDayNumber(val: any, fallback: number): number {
  if (typeof val === "number") return val;
  if (typeof val === "string") {
    const match = val.match(/(\d+)/);
    if (match) return parseInt(match[1], 10);
  }
  return fallback;
}

/**
 * Extract a title from strings like "Day 1: Arrival & Exploration"
 * or return the value directly if it's already a clean title
 */
function extractTitle(dayObj: any): string {
  // If there's a dedicated title field, use it
  if (dayObj.title) return dayObj.title;
  // If the day field contains "Day X: Title", extract the title part
  if (typeof dayObj.day === "string") {
    const match = dayObj.day.match(/Day\s*\d+\s*[:\-–]\s*(.+)/i);
    if (match) return match[1].trim();
    return dayObj.day;
  }
  // Try other common field names
  return dayObj.theme || dayObj.name || dayObj.heading || `Day ${dayObj.day || ""}`;
}

/**
 * Parse a cost value — handles numbers, strings like "$15", "₹500", "15 USD"
 */
function parseCost(val: any): number {
  if (val === null || val === undefined) return 0;
  if (typeof val === "number") return val;
  if (typeof val === "string") {
    // Remove currency symbols, commas, and whitespace
    const cleaned = val.replace(/[$€£₹¥,\s]/g, "").replace(/[A-Za-z]+/g, "").trim();
    const num = parseFloat(cleaned);
    return isNaN(num) ? 0 : num;
  }
  return 0;
}

/**
 * Normalize a single activity object — handles various key names
 */
function normalizeActivity(act: any): any {
  const costValue = act.estimatedCost ?? act.estimated_cost ?? act.cost ?? act.price ?? 
    act.estimatedCostUSD ?? act.estimated_cost_usd ?? act.costUSD ?? act.cost_usd ?? 
    act.priceUSD ?? act.amount ?? 0;

  return {
    time: act.time || act.timeSlot || act.time_slot || act.startTime || act.start_time || "TBD",
    activity: act.activity || act.name || act.title || act.place || act.location || "Activity",
    description: act.description || act.details || act.desc || act.notes || act.tip || "",
    estimatedCost: parseCost(costValue),
  };
}

/**
 * Normalize a single day itinerary object
 */
function normalizeDay(dayObj: any, index: number): any {
  const dayNumber = extractDayNumber(dayObj.day ?? dayObj.dayNumber ?? dayObj.day_number, index + 1);
  const title = extractTitle(dayObj);

  // Activities might be under various keys
  const rawActivities = dayObj.activities || dayObj.items || dayObj.events || dayObj.plans || [];

  return {
    day: dayNumber,
    title: title,
    activities: rawActivities.map((a: any) => normalizeActivity(a)),
  };
}

/**
 * Normalize the budget object
 */
function normalizeBudget(budget: any): any {
  if (!budget) return { flights: 0, accommodation: 0, food: 0, activities: 0, transportation: 0, total: 0 };

  const flights = parseCost(budget.flights ?? budget.flight ?? budget.airfare ?? 0);
  const accommodation = parseCost(budget.accommodation ?? budget.hotel ?? budget.hotels ?? budget.lodging ?? budget.stay ?? 0);
  const food = parseCost(budget.food ?? budget.meals ?? budget.dining ?? budget.foodAndDining ?? budget.food_and_dining ?? 0);
  const activities = parseCost(budget.activities ?? budget.attractions ?? budget.sightseeing ?? budget.entertainment ?? 0);
  const transportation = parseCost(budget.transportation ?? budget.transport ?? budget.localTransport ?? budget.local_transport ?? budget.localTransportation ?? 0);
  const total = parseCost(budget.total ?? budget.totalBudget ?? budget.total_budget ?? budget.grandTotal ?? budget.totalEstimatedBudget ?? 0)
    || (flights + accommodation + food + activities + transportation);

  return { flights, accommodation, food, activities, transportation, total };
}

/**
 * Normalize a single hotel object
 */
function normalizeHotel(hotel: any): any {
  // Tier normalization
  let tier = hotel.tier || hotel.category || hotel.type || hotel.budgetCategory || hotel.budget_category || "Mid-Range";
  if (typeof tier === "string") {
    const lowerTier = tier.toLowerCase();
    if (lowerTier.includes("budget") || lowerTier.includes("economy") || lowerTier.includes("low")) tier = "Budget";
    else if (lowerTier.includes("luxury") || lowerTier.includes("premium") || lowerTier.includes("high")) tier = "Luxury";
    else tier = "Mid-Range";
  }

  return {
    name: hotel.name || hotel.hotelName || hotel.hotel_name || "Hotel",
    tier: tier,
    pricePerNight: parseFloat(hotel.pricePerNight ?? hotel.price_per_night ?? hotel.price ?? hotel.pricePerNightUSD ?? hotel.nightlyRate ?? hotel.rate ?? 0) || 0,
    rating: parseFloat(hotel.rating ?? hotel.stars ?? hotel.score ?? 0) || 4.0,
    description: hotel.description || hotel.details || hotel.about || hotel.notes || "",
  };
}

/**
 * Normalize the packing list — handles both array-of-strings and array-of-objects
 */
function normalizePackingList(packingList: any): any[] {
  if (!packingList || !Array.isArray(packingList)) return [];

  return packingList.map((cat: any) => {
    // Handle case where category is an object with category/items
    const categoryName = cat.category || cat.name || cat.title || cat.type || "Miscellaneous";
    let items = cat.items || cat.list || cat.things || [];

    // Items might be strings or objects
    const normalizedItems = items.map((item: any) => {
      if (typeof item === "string") {
        return { name: item, packed: false };
      }
      return {
        name: item.name || item.item || item.title || String(item),
        packed: false,
      };
    });

    return { category: categoryName, items: normalizedItems };
  });
}

/**
 * Normalize the entire AI response to match our Mongoose schema
 */
function normalizeAiResponse(aiResult: any): any {
  // Handle itinerary at top level or nested
  const rawItinerary = aiResult.itinerary || aiResult.days || aiResult.dayByDay || aiResult.plan || [];
  const itinerary = rawItinerary.map((day: any, index: number) => normalizeDay(day, index));

  const budget = normalizeBudget(aiResult.budget || aiResult.budgetEstimation || aiResult.budgetBreakdown || aiResult.estimatedBudget);
  
  const rawHotels = aiResult.hotels || aiResult.hotelSuggestions || aiResult.hotel_suggestions || aiResult.recommendedHotels || [];
  const hotels = rawHotels.map((h: any) => normalizeHotel(h));

  const packingList = normalizePackingList(aiResult.packingList || aiResult.packing_list || aiResult.packingChecklist || aiResult.packing || []);

  const rawTransit = aiResult.transitExpenses || aiResult.transit || {};
  const transitExpenses = {
    flight: parseCost(rawTransit.flight ?? rawTransit.flights ?? 0),
    train: parseCost(rawTransit.train ?? 0),
    bus: parseCost(rawTransit.bus ?? 0),
    car: parseCost(rawTransit.car ?? rawTransit.carRental ?? 0),
    visa: parseCost(rawTransit.visa ?? rawTransit.visaFee ?? 0),
    visaRequired: typeof rawTransit.visaRequired === "boolean" ? rawTransit.visaRequired : (!!(rawTransit.visaRequired || rawTransit.visa_required || false)),
    notes: rawTransit.notes || rawTransit.details || "",
  };

  return { itinerary, budget, hotels, packingList, transitExpenses };
}

/**
 * POST /api/trips
 * Create a new trip — calls Gemini LLM and saves the result
 */
export const createTrip = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { destination, startingPoint, currency = "INR", days, budgetType, interests } = req.body;

    // Validate input
    if (!destination || !startingPoint || !days || !budgetType || !interests?.length) {
      res.status(400).json({ message: "All trip fields are required." });
      return;
    }

    if (days < 1 || days > 30) {
      res
        .status(400)
        .json({ message: "Number of days must be between 1 and 30." });
      return;
    }

    // Call Gemini LLM to generate the trip
    const aiResult = await generateFullTrip(
      destination,
      startingPoint,
      currency,
      days,
      budgetType,
      interests
    );

    // Log raw AI response for debugging
    console.log("Raw AI response keys:", Object.keys(aiResult));

    // Normalize the AI response to match our schema
    const normalized = normalizeAiResponse(aiResult);

    // Save trip to database
    const trip = await Trip.create({
      userId: req.user!.id,
      destination,
      startingPoint,
      currency,
      days,
      budgetType,
      interests,
      itinerary: normalized.itinerary,
      budget: normalized.budget,
      hotels: normalized.hotels,
      packingList: normalized.packingList,
      transitExpenses: normalized.transitExpenses,
    });

    res.status(201).json({ message: "Trip created successfully.", trip });
  } catch (error) {
    console.error("Create trip error:", error);
    res
      .status(500)
      .json({ message: "Failed to generate trip. Please try again." });
  }
};

/**
 * GET /api/trips
 * Get all trips for the authenticated user
 */
export const getTrips = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const trips = await Trip.find({ userId: req.user!.id })
      .sort({ createdAt: -1 })
      .select("destination startingPoint currency days budgetType interests createdAt");

    res.status(200).json({ trips });
  } catch (error) {
    console.error("Get trips error:", error);
    res.status(500).json({ message: "Failed to fetch trips." });
  }
};

/**
 * GET /api/trips/:id
 * Get a single trip by ID (with ownership check)
 */
export const getTripById = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const trip = await Trip.findOne({
      _id: req.params.id,
      userId: req.user!.id,
    });

    if (!trip) {
      res.status(404).json({ message: "Trip not found." });
      return;
    }

    res.status(200).json({ trip });
  } catch (error) {
    console.error("Get trip error:", error);
    res.status(500).json({ message: "Failed to fetch trip." });
  }
};

/**
 * DELETE /api/trips/:id
 * Delete a trip (with ownership check)
 */
export const deleteTrip = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const trip = await Trip.findOneAndDelete({
      _id: req.params.id,
      userId: req.user!.id,
    });

    if (!trip) {
      res.status(404).json({ message: "Trip not found." });
      return;
    }

    res.status(200).json({ message: "Trip deleted successfully." });
  } catch (error) {
    console.error("Delete trip error:", error);
    res.status(500).json({ message: "Failed to delete trip." });
  }
};

/**
 * PUT /api/trips/:id/regenerate-day
 * Regenerate a specific day of the itinerary using Gemini
 */
export const regenerateTripDay = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { dayNumber, userRequest } = req.body;

    if (!dayNumber || !userRequest) {
      res
        .status(400)
        .json({ message: "Day number and request are required." });
      return;
    }

    const trip = await Trip.findOne({
      _id: req.params.id,
      userId: req.user!.id,
    });

    if (!trip) {
      res.status(404).json({ message: "Trip not found." });
      return;
    }

    // Call Gemini to regenerate the day
    const newDay = await regenerateDay(
      trip.destination,
      trip.days,
      trip.budgetType,
      trip.interests,
      dayNumber,
      userRequest,
      trip.itinerary
    );

    // Normalize and replace the day in the itinerary
    const normalizedDay = normalizeDay(newDay, dayNumber - 1);
    const dayIndex = trip.itinerary.findIndex(
      (d) => d.day === dayNumber
    );
    if (dayIndex !== -1) {
      trip.itinerary[dayIndex] = normalizedDay;
    }

    await trip.save();

    res.status(200).json({ message: "Day regenerated successfully.", trip });
  } catch (error) {
    console.error("Regenerate day error:", error);
    res
      .status(500)
      .json({ message: "Failed to regenerate day. Please try again." });
  }
};

/**
 * PUT /api/trips/:id/add-activity
 * Add an AI-suggested activity to a specific day
 */
export const addActivityToDay = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { dayNumber, timeSlot } = req.body;

    if (!dayNumber) {
      res.status(400).json({ message: "Day number is required." });
      return;
    }

    const trip = await Trip.findOne({
      _id: req.params.id,
      userId: req.user!.id,
    });

    if (!trip) {
      res.status(404).json({ message: "Trip not found." });
      return;
    }

    const dayIndex = trip.itinerary.findIndex(
      (d) => d.day === dayNumber
    );
    if (dayIndex === -1) {
      res.status(404).json({ message: "Day not found in itinerary." });
      return;
    }

    // Call Gemini to suggest an activity
    const newActivity = await suggestActivity(
      trip.destination,
      trip.budgetType,
      trip.interests,
      trip.itinerary[dayIndex].activities,
      timeSlot || "Afternoon"
    );

    // Normalize and add activity to the day
    const normalizedActivity = normalizeActivity(newActivity);
    trip.itinerary[dayIndex].activities.push(normalizedActivity);
    await trip.save();

    res
      .status(200)
      .json({ message: "Activity added successfully.", trip });
  } catch (error) {
    console.error("Add activity error:", error);
    res.status(500).json({ message: "Failed to add activity." });
  }
};

/**
 * PUT /api/trips/:id/remove-activity
 * Remove an activity from a specific day
 */
export const removeActivity = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { dayNumber, activityId } = req.body;

    if (!dayNumber || !activityId) {
      res
        .status(400)
        .json({ message: "Day number and activity ID are required." });
      return;
    }

    const trip = await Trip.findOne({
      _id: req.params.id,
      userId: req.user!.id,
    });

    if (!trip) {
      res.status(404).json({ message: "Trip not found." });
      return;
    }

    const dayIndex = trip.itinerary.findIndex(
      (d) => d.day === dayNumber
    );
    if (dayIndex === -1) {
      res.status(404).json({ message: "Day not found in itinerary." });
      return;
    }

    trip.itinerary[dayIndex].activities = trip.itinerary[
      dayIndex
    ].activities.filter((a: any) => a._id.toString() !== activityId);

    await trip.save();

    res
      .status(200)
      .json({ message: "Activity removed successfully.", trip });
  } catch (error) {
    console.error("Remove activity error:", error);
    res.status(500).json({ message: "Failed to remove activity." });
  }
};

/**
 * PUT /api/trips/:id/packing-list
 * Update packing list item status (toggle packed)
 */
export const updatePackingItem = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { categoryIndex, itemIndex, packed } = req.body;

    if (categoryIndex === undefined || itemIndex === undefined || packed === undefined) {
      res
        .status(400)
        .json({ message: "Category index, item index, and packed status are required." });
      return;
    }

    const trip = await Trip.findOne({
      _id: req.params.id,
      userId: req.user!.id,
    });

    if (!trip) {
      res.status(404).json({ message: "Trip not found." });
      return;
    }

    if (
      !trip.packingList[categoryIndex] ||
      !trip.packingList[categoryIndex].items[itemIndex]
    ) {
      res.status(404).json({ message: "Packing item not found." });
      return;
    }

    trip.packingList[categoryIndex].items[itemIndex].packed = packed;
    await trip.save();

    res
      .status(200)
      .json({ message: "Packing item updated.", trip });
  } catch (error) {
    console.error("Update packing error:", error);
    res.status(500).json({ message: "Failed to update packing list." });
  }
};

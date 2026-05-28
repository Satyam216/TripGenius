import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

const SYSTEM_INSTRUCTION = `You are an expert travel planner with extensive knowledge of worldwide destinations, local culture, cuisine, attractions, and practical travel logistics. Generate detailed, realistic, and actionable travel itineraries. 

Guidelines:
- Provide specific place names, not generic suggestions
- Include realistic time slots (morning to evening)
- Estimate costs in USD based on real-world pricing
- Consider the traveler's budget tier when making suggestions
- Suggest a mix of popular and hidden gem locations
- Include practical tips within descriptions
- For hotels, suggest real or realistic hotel names with accurate pricing tiers
- For packing lists, be practical and destination-specific (consider weather, culture, activities)`;

/**
 * Generate a complete trip plan using Gemini LLM
 */
export async function generateFullTrip(
  destination: string,
  days: number,
  budgetType: string,
  interests: string[]
): Promise<any> {
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    systemInstruction: SYSTEM_INSTRUCTION,
  });

  const prompt = `Plan a ${days}-day trip to ${destination}.
Budget preference: ${budgetType}
Interests: ${interests.join(", ")}

Generate a complete travel plan with:
1. A day-by-day itinerary with 3-4 activities per day. Each activity should have a specific time slot (e.g., "9:00 AM"), a name, a brief description with practical tips, and an estimated cost in USD.
2. An overall budget breakdown in USD including: flights (round trip estimate), accommodation (total for ${days} nights), food (total), activities (total), transportation (local transport total), and the grand total.
3. Exactly 3 hotel suggestions: one Budget tier, one Mid-Range tier, and one Luxury tier. Include price per night, a rating out of 5, and a brief description.
4. A packing checklist organized by category (e.g., Clothing, Toiletries, Electronics, Documents, Miscellaneous). Make it specific to ${destination} considering local weather and culture.

Adjust all costs and suggestions to match the "${budgetType}" budget preference.

Return a JSON object with keys: itinerary (array of day objects), budget (object), hotels (array), packingList (array of category objects).`;

  const result = await model.generateContent({
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    generationConfig: {
      responseMimeType: "application/json",
    },
  });

  const text = result.response.text();
  return JSON.parse(text);
}

/**
 * Regenerate a single day of the itinerary
 */
export async function regenerateDay(
  destination: string,
  days: number,
  budgetType: string,
  interests: string[],
  dayNumber: number,
  userRequest: string,
  currentItinerary: any[]
): Promise<any> {
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    systemInstruction: SYSTEM_INSTRUCTION,
  });

  const prompt = `I am on a ${days}-day trip to ${destination}.
Budget preference: ${budgetType}
Interests: ${interests.join(", ")}

Here is my current full itinerary:
${JSON.stringify(currentItinerary, null, 2)}

Please regenerate ONLY Day ${dayNumber} based on this request: "${userRequest}"

Keep the same format with 3-4 activities, time slots, descriptions, and estimated costs. Make sure the regenerated day fits well with the rest of the itinerary and avoids duplicating activities from other days.

Return a JSON object with keys: day (number), title (string), activities (array of objects with time, activity, description, estimatedCost).`;

  const result = await model.generateContent({
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    generationConfig: {
      responseMimeType: "application/json",
    },
  });

  const text = result.response.text();
  return JSON.parse(text);
}

/**
 * Generate a single activity suggestion for a specific day
 */
export async function suggestActivity(
  destination: string,
  budgetType: string,
  interests: string[],
  dayActivities: any[],
  timeSlot: string
): Promise<any> {
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    systemInstruction: SYSTEM_INSTRUCTION,
  });

  const prompt = `Suggest ONE new activity for a trip to ${destination}.
Budget preference: ${budgetType}
Interests: ${interests.join(", ")}
Preferred time slot: ${timeSlot}

Current activities for this day (avoid duplicates):
${JSON.stringify(dayActivities, null, 2)}

Suggest a single activity that complements the existing ones.

Return a JSON object with keys: time (string), activity (string), description (string), estimatedCost (number).`;

  const result = await model.generateContent({
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    generationConfig: {
      responseMimeType: "application/json",
    },
  });

  const text = result.response.text();
  return JSON.parse(text);
}

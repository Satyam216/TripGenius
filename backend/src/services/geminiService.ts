import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

const SYSTEM_INSTRUCTION = `You are an expert travel planner. Generate detailed, realistic travel itineraries as JSON.

CRITICAL: You must use EXACTLY these field names in your JSON response:
- Itinerary days: { "day": <number>, "title": "<string>", "activities": [...] }
- Activities: { "time": "<string>", "activity": "<string>", "description": "<string>", "estimatedCost": <number> }
- Budget: { "flights": <number>, "accommodation": <number>, "food": <number>, "activities": <number>, "transportation": <number>, "total": <number> }
- Hotels: { "name": "<string>", "tier": "<Budget|Mid-Range|Luxury>", "pricePerNight": <number>, "rating": <number>, "description": "<string>" }
- Packing: { "category": "<string>", "items": ["<string>", ...] }
- Transit Expenses: { "transitExpenses": { "flight": <number>, "train": <number>, "bus": <number>, "car": <number>, "visa": <number>, "visaRequired": <boolean>, "notes": "<string>" } }

IMPORTANT RULES:
- "day" must be a NUMBER (1, 2, 3), NOT a string like "Day 1: Title"
- "estimatedCost" must be a NUMBER (e.g., 15), NOT a string like "$15"
- "pricePerNight" must be a NUMBER, NOT a string
- All costs must be in the target currency and must be realistic non-zero values
- Every activity MUST have a non-zero estimatedCost (even free activities should show 0)`;

/**
 * Helper to call Gemini with a retry mechanism and fallback model support
 */
async function generateContentWithRetry(
  systemInstruction: string,
  prompt: string,
  modelName = "gemini-2.5-flash",
  retries = 3,
  delay = 1000
): Promise<string> {
  let lastError: any;
  for (let i = 0; i < retries; i++) {
    try {
      const model = genAI.getGenerativeModel({
        model: modelName,
        systemInstruction,
      });
      const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: "application/json",
        },
      });
      return result.response.text();
    } catch (error: any) {
      lastError = error;
      console.warn(`Gemini call failed with model ${modelName} (attempt ${i + 1}/${retries}):`, error.message || error);
      
      // If we encounter a temporary service issue or rate limit, wait and retry
      if (i < retries - 1) {
        await new Promise((resolve) => setTimeout(resolve, delay));
        delay *= 2.0; // exponential backoff
      }
    }
  }

  // If retries on the primary model fail, try a fallback model (e.g., gemini-1.5-flash)
  const fallbackModel = modelName === "gemini-2.5-flash" ? "gemini-1.5-flash" : "gemini-2.5-flash";
  console.warn(`Exhausted retries on ${modelName}. Trying fallback model ${fallbackModel}...`);
  try {
    const model = genAI.getGenerativeModel({
      model: fallbackModel,
      systemInstruction,
    });
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
      },
    });
    return result.response.text();
  } catch (fallbackError: any) {
    console.error(`Fallback to ${fallbackModel} also failed:`, fallbackError.message || fallbackError);
    throw lastError; // Throw the original error
  }
}

/**
 * Generate a complete trip plan using Gemini LLM
 */
export async function generateFullTrip(
  destination: string,
  startingPoint: string,
  currency: string,
  days: number,
  budgetType: string,
  interests: string[]
): Promise<any> {
  const prompt = `Plan a ${days}-day trip from ${startingPoint} to ${destination}.
Budget preference: ${budgetType}
Interests: ${interests.join(", ")}
Starting Point (Origin): ${startingPoint}
Destination: ${destination}
Target Currency: ${currency}

CRITICAL: All monetary values and costs (flights, accommodation, food, activities, transportation, hotels pricePerNight, and transitExpenses) MUST be output as raw numbers in the specified currency (${currency}). 
For example:
- If currency is INR (Indian Rupees), flight budget could be 45000, food could be 12000, activities could be 15000, accommodation could be 25000, hotel pricePerNight could be 3000 to 12000.
- If currency is USD (US Dollars), flight budget could be 600, food could be 200, activities could be 150, hotel pricePerNight could be 50 to 300.
Scale all values realistically based on the purchasing power and conversion rate of the specified currency (${currency}). Do NOT include currency symbols or text in the numeric fields, just raw numbers.
Ensure that the estimated flight budget is a realistic cost for travel between ${startingPoint} and ${destination} in ${currency}.

Return a JSON object with this EXACT structure:

{
  "itinerary": [
    {
      "day": 1,
      "title": "Arrival & Exploration",
      "activities": [
        {
          "time": "9:00 AM",
          "activity": "Visit Famous Temple",
          "description": "A beautiful temple known for...",
          "estimatedCost": 10
        }
      ]
    }
  ],
  "budget": {
    "flights": 400,
    "accommodation": 300,
    "food": 150,
    "activities": 100,
    "transportation": 80,
    "total": 1030
  },
  "hotels": [
    {
      "name": "Budget Inn",
      "tier": "Budget",
      "pricePerNight": 30,
      "rating": 3.5,
      "description": "A clean and affordable option..."
    },
    {
      "name": "City Hotel",
      "tier": "Mid-Range",
      "pricePerNight": 80,
      "rating": 4.0,
      "description": "Comfortable hotel in the city center..."
    },
    {
      "name": "Luxury Resort",
      "tier": "Luxury",
      "pricePerNight": 200,
      "rating": 4.8,
      "description": "Premium 5-star experience..."
    }
  ],
  "packingList": [
    {
      "category": "Clothing",
      "items": ["T-shirts", "Comfortable walking shoes", "Light jacket"]
    },
    {
      "category": "Toiletries",
      "items": ["Sunscreen", "Toothbrush", "Deodorant"]
    }
  ],
  "transitExpenses": {
    "flight": 450,
    "train": 80,
    "bus": 30,
    "car": 120,
    "visa": 60,
    "visaRequired": true,
    "notes": "Visa required for travelers from starting location to destination. Includes estimates for transit between startingPoint and destination."
  }
}

REQUIREMENTS:
- Generate ${days} days with 3-4 activities each
- "day" must be a number (1, 2, 3...), NOT a string
- Each activity must have a realistic "estimatedCost" as a number in ${currency}
- Budget values must reflect the "${budgetType}" tier realistically in ${currency}
- Include 3 hotels (Budget, Mid-Range, Luxury) with realistic pricePerNight as numbers in ${currency}
- Include 4-6 packing categories specific to ${destination}
- Include a realistic estimation of transit expenses inside the "transitExpenses" object in ${currency} (scale flights, train, bus, car, visa fees).
- Determine whether a visa is required between ${startingPoint} and ${destination} and set "visaRequired" to true or false. Detail the note accordingly.
- All monetary values must be numbers, NOT strings`;

  const text = await generateContentWithRetry(SYSTEM_INSTRUCTION, prompt, "gemini-2.5-flash");
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
  const prompt = `I am on a ${days}-day trip to ${destination}.
Budget preference: ${budgetType}
Interests: ${interests.join(", ")}

Here is my current full itinerary:
${JSON.stringify(currentItinerary, null, 2)}

Regenerate ONLY Day ${dayNumber} based on this request: "${userRequest}"

Return a JSON object with this EXACT structure:
{
  "day": ${dayNumber},
  "title": "New Day Title",
  "activities": [
    {
      "time": "9:00 AM",
      "activity": "Activity Name",
      "description": "Details about the activity...",
      "estimatedCost": 15
    }
  ]
}

IMPORTANT: "day" must be the number ${dayNumber}. Each activity must have a realistic "estimatedCost" as a number. Generate 3-4 activities.`;

  const text = await generateContentWithRetry(SYSTEM_INSTRUCTION, prompt, "gemini-2.5-flash");
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
  const prompt = `Suggest ONE new activity for a trip to ${destination}.
Budget preference: ${budgetType}
Interests: ${interests.join(", ")}
Preferred time slot: ${timeSlot}

Current activities for this day (avoid duplicates):
${JSON.stringify(dayActivities, null, 2)}

Return a JSON object with this EXACT structure:
{
  "time": "${timeSlot}",
  "activity": "Activity Name",
  "description": "Details about the activity...",
  "estimatedCost": 15
}

IMPORTANT: "estimatedCost" must be a realistic number, NOT a string.`;

  const text = await generateContentWithRetry(SYSTEM_INSTRUCTION, prompt, "gemini-2.5-flash");
  return JSON.parse(text);
}

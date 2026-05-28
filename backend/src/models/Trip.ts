import mongoose, { Document, Schema } from "mongoose";

// --- Sub-document interfaces ---

export interface IActivity {
  time: string;
  activity: string;
  description: string;
  estimatedCost: number;
}

export interface IDayItinerary {
  day: number;
  title: string;
  activities: IActivity[];
}

export interface IBudget {
  flights: number;
  accommodation: number;
  food: number;
  activities: number;
  transportation: number;
  total: number;
}

export interface IHotel {
  name: string;
  tier: "Budget" | "Mid-Range" | "Luxury";
  pricePerNight: number;
  rating: number;
  description: string;
}

export interface IPackingCategory {
  category: string;
  items: IPackingItem[];
}

export interface IPackingItem {
  name: string;
  packed: boolean;
}

// --- Main Trip interface ---

export interface ITrip extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  destination: string;
  days: number;
  budgetType: "Low" | "Medium" | "High";
  interests: string[];
  itinerary: IDayItinerary[];
  budget: IBudget;
  hotels: IHotel[];
  packingList: IPackingCategory[];
  createdAt: Date;
  updatedAt: Date;
}

// --- Sub-schemas ---

const activitySchema = new Schema<IActivity>(
  {
    time: { type: String, required: true },
    activity: { type: String, required: true },
    description: { type: String, required: true },
    estimatedCost: { type: Number, default: 0 },
  },
  { _id: true }
);

const dayItinerarySchema = new Schema<IDayItinerary>(
  {
    day: { type: Number, required: true },
    title: { type: String, required: true },
    activities: [activitySchema],
  },
  { _id: true }
);

const budgetSchema = new Schema<IBudget>(
  {
    flights: { type: Number, default: 0 },
    accommodation: { type: Number, default: 0 },
    food: { type: Number, default: 0 },
    activities: { type: Number, default: 0 },
    transportation: { type: Number, default: 0 },
    total: { type: Number, default: 0 },
  },
  { _id: false }
);

const hotelSchema = new Schema<IHotel>(
  {
    name: { type: String, required: true },
    tier: { type: String, enum: ["Budget", "Mid-Range", "Luxury"], required: true },
    pricePerNight: { type: Number, required: true },
    rating: { type: Number, required: true },
    description: { type: String, required: true },
  },
  { _id: true }
);

const packingItemSchema = new Schema<IPackingItem>(
  {
    name: { type: String, required: true },
    packed: { type: Boolean, default: false },
  },
  { _id: true }
);

const packingCategorySchema = new Schema<IPackingCategory>(
  {
    category: { type: String, required: true },
    items: [packingItemSchema],
  },
  { _id: true }
);

// --- Main Trip schema ---

const tripSchema = new Schema<ITrip>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    destination: {
      type: String,
      required: [true, "Destination is required"],
      trim: true,
    },
    days: {
      type: Number,
      required: [true, "Number of days is required"],
      min: [1, "Trip must be at least 1 day"],
      max: [30, "Trip cannot exceed 30 days"],
    },
    budgetType: {
      type: String,
      enum: ["Low", "Medium", "High"],
      required: [true, "Budget type is required"],
    },
    interests: {
      type: [String],
      required: [true, "At least one interest is required"],
      validate: {
        validator: (v: string[]) => v.length > 0,
        message: "At least one interest must be selected",
      },
    },
    itinerary: [dayItinerarySchema],
    budget: budgetSchema,
    hotels: [hotelSchema],
    packingList: [packingCategorySchema],
  },
  {
    timestamps: true,
  }
);

// Compound index for efficient user-specific queries
tripSchema.index({ userId: 1, createdAt: -1 });

const Trip = mongoose.model<ITrip>("Trip", tripSchema);
export default Trip;

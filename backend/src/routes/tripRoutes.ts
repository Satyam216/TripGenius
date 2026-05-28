import { Router } from "express";
import authMiddleware from "../middleware/authMiddleware";
import {
  createTrip,
  getTrips,
  getTripById,
  deleteTrip,
  regenerateTripDay,
  addActivityToDay,
  removeActivity,
  updatePackingItem,
} from "../controllers/tripController";

const router = Router();

// All routes are protected
router.use(authMiddleware);

router.post("/", createTrip);
router.get("/", getTrips);
router.get("/:id", getTripById);
router.delete("/:id", deleteTrip);
router.put("/:id/regenerate-day", regenerateTripDay);
router.put("/:id/add-activity", addActivityToDay);
router.put("/:id/remove-activity", removeActivity);
router.put("/:id/packing-list", updatePackingItem);

export default router;

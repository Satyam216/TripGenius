import { Router } from "express";
import { register, login, getMe, forgotPassword } from "../controllers/authController";
import authMiddleware from "../middleware/authMiddleware";

const router = Router();

// Public routes
router.post("/register", register);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);

// Protected route
router.get("/me", authMiddleware, getMe);

export default router;

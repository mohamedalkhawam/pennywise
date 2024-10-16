import express from "express";
const router = express.Router();
import { healthCheck } from "../controllers/health.controller";

router.route("/").get(healthCheck);

export default router;

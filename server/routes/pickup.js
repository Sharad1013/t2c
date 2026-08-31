import express from "express";
import { deletePickup, getPickUpsHistoryByUserId, registerPickup, updatePickup, updatePickupStatusUsingOtp, getPickupsPerInspector, updatePickupStatusToDelivered } from "../controllers/pickup.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import upload from "../middlewares/multer.js";



const router = express.Router();

router.route("/")
    .post(authMiddleware, upload.array("images", 3), registerPickup)
    .get(authMiddleware, getPickUpsHistoryByUserId)

// delete route
router.route("/:pickupId")
    .delete(authMiddleware, deletePickup)
    .patch(authMiddleware, updatePickup);

router.route("/:pickupId/verify-otp")
    .patch(authMiddleware, updatePickupStatusUsingOtp);

router.route("/:inspectorId")
    .get(authMiddleware, getPickupsPerInspector)

router.route("/delivered/:pickupId")
    .patch(authMiddleware, upload.array("images", 3), updatePickupStatusToDelivered)


export default router;
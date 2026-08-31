// routes/admin.js
import express from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { authorizeRoles } from "../middlewares/roleMiddleware.js";
import { fetchInspectorsAsPerStatus, approveRejectPendingInspectors, fetchAllInspectors } from "../controllers/admin/inspectors.js";
import { getAllUsers } from "../controllers/admin/users.js";
import { fetchAllPickups, fetchPickupsAsPerStatus } from "../controllers/admin/pickups.js";

const router = express.Router();

// runs for ALL routes below, in order: authenticate, then check role
router.use(authMiddleware, authorizeRoles("admin"));

router.route("/pending-inspectors")
    .get(fetchInspectorsAsPerStatus);

router.route("/inspectors")
    .get(fetchAllInspectors);

router.route("/inspectors/:inspectorId")
    .patch(approveRejectPendingInspectors);

// add more admin routes here — all are admin-gated automatically

// Users
router.route("/users")
    .get(getAllUsers);

// Pickups
router.route("/pickups")
    .get(fetchAllPickups);

router.route("/pickups-status")
    .get(fetchPickupsAsPerStatus);

export default router;
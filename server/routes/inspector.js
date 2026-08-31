import express from "express";
import {
    registerInspector,
    loginInspector,
    getLoggedInInspector,
    toggleInspectorAvailability,
    updateInspector,
} from "../controllers/inspector.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import upload from "../middlewares/multer.js";

const router = express.Router();

router.route("/register").post(
    upload.fields([
        { name: "profilePhoto", maxCount: 1 },
        { name: "aadhaarFront", maxCount: 1 },
        { name: "aadhaarBack", maxCount: 1 },
        { name: "panImage", maxCount: 1 },
        { name: "rcImage", maxCount: 1 },
    ]),
    registerInspector
);

router.route("/login").post(loginInspector);
router.route("/me")
    .get(authMiddleware, getLoggedInInspector)
    .patch(
        authMiddleware,
        upload.fields([{ name: "profilePhoto", maxCount: 1 }]),
        updateInspector
    );
router.route("/availability").patch(authMiddleware, toggleInspectorAvailability);

export default router;

import express from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import upload from "../middlewares/multer.js";
import { createResaleProduct, getAllResaleProductsPerSeller } from "../controllers/resaleStore/resaleStore.js";

const router = express.Router();

router.route("/")
    .post(authMiddleware, upload.array("images", 4), createResaleProduct)
    .get(authMiddleware, getAllResaleProductsPerSeller)

export default router;
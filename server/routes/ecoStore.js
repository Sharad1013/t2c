import express from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { getAllProducts, getProductDetails, purchaseEcoStoreProduct } from "../controllers/ecoStore/ecostore.js";

const router = express.Router();

router.route("/")
    .get(authMiddleware, getAllProducts)

router.route("/:productId")
    .get(authMiddleware, getProductDetails)
    .post(authMiddleware, purchaseEcoStoreProduct)

export default router;
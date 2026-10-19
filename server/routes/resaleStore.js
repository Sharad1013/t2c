import express from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import upload from "../middlewares/multer.js";
import {
    createResaleProduct,
    getAllResaleProductsPerSeller,
    getLiveResaleProducts,
    getResaleProductDetails,
    deleteResaleProduct,
} from "../controllers/resaleStore/resaleStore.js";

const router = express.Router();

// Live products for store browsing (active / live products)
router.get("/live", authMiddleware, getLiveResaleProducts);

// Products listed by current authenticated user
router.get("/my-products", authMiddleware, getAllResaleProductsPerSeller);

router.route("/")
    .post(authMiddleware, upload.array("images", 4), createResaleProduct)
    .get(authMiddleware, (req, res, next) => {
        if (req.query.mine === "true" || req.query.seller === "true") {
            return getAllResaleProductsPerSeller(req, res, next);
        }
        return getLiveResaleProducts(req, res, next);
    });

router.route("/:productId")
    .get(authMiddleware, getResaleProductDetails)
    .delete(authMiddleware, deleteResaleProduct);

export default router;
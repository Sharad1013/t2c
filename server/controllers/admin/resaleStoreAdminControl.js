import { resaleStoreProducts } from "../../models/resaleStore/resaleStoreProducts.js";
import { uploadToCloudinary } from "../../utils/cloudinary.js";

export const updateResaleProduct = async (req, res) => {
    try {
        const adminId = req.user?.userId;
        if (!adminId) {
            return res.status(401).json({ success: false, message: "Login first." });
        }

        const { productId } = req.params;
        const { name, description, brand, stock, price, liveFrom, liveTill, status, rejectionReason } = req.body;

        const product = await ResaleStoreProducts.findById(productId);
        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found." });
        }

        const updates = {};

        // plain editable fields — set only if provided
        if (name !== undefined) updates.name = name;
        if (description !== undefined) updates.description = description;
        if (brand !== undefined) updates.brand = brand;

        if (stock !== undefined) {
            const s = Number(stock);
            if (Number.isNaN(s) || s < 0) {
                return res.status(400).json({ success: false, message: "stock must be a non-negative number." });
            }
            updates.stock = s;
        }

        // ---- status-driven validation ----
        if (status !== undefined) {
            if (status === "live") {
                // going live REQUIRES price + a valid date window
                const p = Number(price ?? product.price);
                if (Number.isNaN(p) || p <= 0) {
                    return res.status(400).json({ success: false, message: "A price is required to make a product live." });
                }
                const from = liveFrom ? new Date(liveFrom) : product.liveFrom;
                const till = liveTill ? new Date(liveTill) : product.liveTill;
                if (!from || !till) {
                    return res.status(400).json({ success: false, message: "liveFrom and liveTill are required to make a product live." });
                }
                if (till <= from) {
                    return res.status(400).json({ success: false, message: "liveTill must be after liveFrom." });
                }
                updates.price = p;
                updates.liveFrom = from;
                updates.liveTill = till;
                updates.status = "live";
                updates.verifiedBy = adminId;
                updates.verifiedAt = new Date();
            } else if (status === "rejected") {
                if (!rejectionReason) {
                    return res.status(400).json({ success: false, message: "A rejection reason is required." });
                }
                updates.status = "rejected";
                updates.rejectionReason = rejectionReason;
                updates.verifiedBy = adminId;
                updates.verifiedAt = new Date();
            } else {
                // any other allowed status transition (approved, sold, expired…)
                updates.status = status;
            }
        } else {
            // no status change, but admin may still be setting price/dates independently
            if (price !== undefined) {
                const p = Number(price);
                if (Number.isNaN(p) || p < 0) {
                    return res.status(400).json({ success: false, message: "price must be a non-negative number." });
                }
                updates.price = p;
            }
            if (liveFrom !== undefined) updates.liveFrom = new Date(liveFrom);
            if (liveTill !== undefined) updates.liveTill = new Date(liveTill);
        }

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({ success: false, message: "No fields provided to update." });
        }

        const updated = await ResaleStoreProducts.findByIdAndUpdate(
            productId,
            { $set: updates },
            { new: true, runValidators: true }
        );

        return res.status(200).json({
            success: true,
            message: "Resale product updated successfully.",
            resaleProduct: updated,
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: `Error while updating resale product ${err.message}`,
        });
    }
};


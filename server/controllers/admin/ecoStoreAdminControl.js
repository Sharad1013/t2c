import { EcoStoreProducts } from "../../models/ecoStore/ecoStoreProducts.js";
import { uploadToCloudinary } from "../../utils/cloudinary.js";

export const createEcoStoreProduct = async (req, res) => {
    try {
        const userId = req.user.userId;

        if (!userId) {
            return res.status(400)
                .json({
                    message: `login first.`
                })
        }

        const {
            name,
            description,
            currency,
            mrp,
            discountPercentage,
            maxCoinPercent,
            category,
            subCategory,
            brand,
            stock,
            ratingAvg,
            ratingCount,
            isActive
        } = req.body;

        if (!name || !description || mrp == undefined || !category || !brand || !stock) {
            return res.status(400)
                .json({
                    success: false,
                    message: `Missing required Field.`
                })
        }

        // mrp / stock arrive as strings from multipart form-data — coerce and sanity-check
        const mrpNum = Number(mrp);
        if (Number.isNaN(mrpNum) || mrpNum < 0) {
            return res.status(400).json({ success: false, message: "mrp must be a non-negative number." });
        }

        const discountNum = discountPercentage !== undefined ? Number(discountPercentage) : 0;
        if (Number.isNaN(discountNum) || discountNum < 0 || discountNum > 100) {
            return res.status(400).json({ success: false, message: "discountPercentage must be between 0 and 100." });
        }

        // images are required by the schema
        if (!req.files?.length) {
            return res.status(400).json({ success: false, message: "At least one image is required." });
        }

        const uploads = await Promise.all(
            req.files.map((f) => uploadToCloudinary(f.buffer, "ecostore-products"))
        );

        const imageUrls = uploads.map((u) => u.secure_url);

        // build the doc — only include optional fields when provided, so schema defaults apply
        const product = await EcoStoreProducts.create({
            name,
            description,
            mrp: mrpNum,
            discountPercentage: discountNum,
            category,
            brand,
            imageUrls,
            ...(currency && { currency }),
            ...(maxCoinPercent !== undefined && { maxCoinPercent: Number(maxCoinPercent) }),
            ...(subCategory && { subCategory }),
            ...(stock !== undefined && { stock: Number(stock) }),
        });

        return res.status(201).json({
            success: true,
            message: "Product created successfully.",
            product,
        });

    } catch (error) {
        return res.status(500)
            .json(
                {
                    success: false,
                    message: `Error while creating the EcoStoreProduct ${error}`
                }
            )
    }
}

export const deleteEcoStoreProduct = async (req, res) => {
    const { productId } = req.params;

    if (!productId) {
        return res.status(400)
            .json({
                success: true,
                message: `No productId found.`
            })
    }
    
    try {

        const deletedProduct = await EcoStoreProducts.findByIdAndDelete(productId);

        if (!deletedProduct) {
            return res.status(404).json({
                success: false,
                message: "Product not found.",
            });
        }

        return res.status(200)
            .json({
                success: true,
                message: `Product Deleted Successfully.`,
                deletedProduct
            })
    } catch (error) {
        return res.status(500)
            .json({
                success: false,
                message: `Error While Updating the product ${error}`
            })
    }
}

export const updateEcoStoreProduct = async (req, res) => {
    try {
        const userId = req.user.userId;
        if (!userId) {
            return res.status(401)
            .json({ 
                success: false, 
                message: "Login first."
            });
        }

        const { productId } = req.params;

        const {
            name,
            description,
            currency,
            mrp,
            discountPercentage,
            maxCoinPercent,
            category,
            subCategory,
            brand,
            stock,
            ratingAvg,
            ratingCount,
            isActive,
        } = req.body;

        const updates = {};

        // strings — set only if provided
        if (name !== undefined) updates.name = name;
        if (description !== undefined) updates.description = description;
        if (currency !== undefined) updates.currency = currency;
        if (category !== undefined) updates.category = category;
        if (subCategory !== undefined) updates.subCategory = subCategory;
        if (brand !== undefined) updates.brand = brand;

        // numbers — coerce and validate each if provided
        if (mrp !== undefined) {
            const mrpNum = Number(mrp);
            if (Number.isNaN(mrpNum) || mrpNum < 0) {
                return res.status(400).json({ success: false, message: "mrp must be a non-negative number." });
            }
            updates.mrp = mrpNum;
        }

        if (discountPercentage !== undefined) {
            const d = Number(discountPercentage);
            if (Number.isNaN(d) || d < 0 || d > 100) {
                return res.status(400).json({ success: false, message: "discountPercentage must be between 0 and 100." });
            }
            updates.discountPercentage = d;
        }

        if (maxCoinPercent !== undefined) {
            const m = Number(maxCoinPercent);
            if (Number.isNaN(m) || m < 0 || m > 100) {
                return res.status(400).json({ success: false, message: "maxCoinPercent must be between 0 and 100." });
            }
            updates.maxCoinPercent = m;
        }

        if (stock !== undefined) {
            const s = Number(stock);
            if (Number.isNaN(s) || s < 0) {
                return res.status(400).json({ success: false, message: "stock must be a non-negative number." });
            }
            updates.stock = s;
        }

        if (ratingAvg !== undefined) {
            const r = Number(ratingAvg);
            if (Number.isNaN(r) || r < 0 || r > 5) {
                return res.status(400).json({ success: false, message: "ratingAvg must be between 0 and 5." });
            }
            updates.ratingAvg = r;
        }

        if (ratingCount !== undefined) {
            const c = Number(ratingCount);
            if (Number.isNaN(c) || c < 0) {
                return res.status(400).json({ success: false, message: "ratingCount must be a non-negative number." });
            }
            updates.ratingCount = c;
        }

        if (isActive !== undefined) {
            // form-data sends "true"/"false" as strings
            updates.isActive = isActive === true || isActive === "true";
        }

        const existing = await EcoStoreProducts.findById(productId);
        if (!existing) {
            return res.status(404).json({
                success: false,
                message: "Product not found.",
            });
        }

        // new images (optional) — append to the current gallery
        if (req.files?.length) {
            const existing = await EcoStoreProducts.findById(productId).select("imageUrls");
            const uploads = await Promise.all(
                req.files.map((f) => uploadToCloudinary(f.buffer, "ecostore-products"))
            );
            const newUrls = uploads.map((u) => u.secure_url);
            updates.imageUrls = [...(existing?.imageUrls || []), ...newUrls].slice(0, 3); // respect the max-3 cap
        }

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({ success: false, message: "No fields provided to update." });
        }

        const product = await EcoStoreProducts.findByIdAndUpdate(
            productId,
            { $set: updates },
            { new: true, runValidators: true }
        );

        if (!product) {
            return res.status(404)
            .json({ 
                success: false, 
                message: "Product not found."
            })
        }

        return res.status(200).json({
            success: true,
            message: "Product updated successfully.",
            product,
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: `Error While Updating the product ${err.message}`,
        });
    }
};
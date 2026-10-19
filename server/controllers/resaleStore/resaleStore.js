import { ResaleStoreProducts } from "../../models/resaleStore/resaleStoreProducts.js";
import { uploadToCloudinary } from "../../utils/cloudinary.js";
import { analyzeProductImage } from "../../utils/geminiService.js";
import { estimateResaleCoins } from "../../utils/coinsService.js";
import { User } from "../../models/user.js";

export const createResaleProduct = async (req, res) => {
    try {
        const {
            name,
            brand,
            stock,
            lng,
            lat,
        } = req.body;

        if (lng === undefined || lat === undefined) {
            return res.status(400).json(
                {
                    success: false,
                    message: "Product location is required."
                });
        }

        const userId = req.user?.userId;

        if (!userId) {
            return res.status(403)
                .json({
                    message: `Login First.`
                })
        }

        const existingUser = await User.findById(userId);

        if (!existingUser) {
            return res.status(404)
                .json(
                    {
                        message: `User not found.`
                    }
                )
        }

        const imageUrls = [];
        let aiAnalysis = null;

        if (req.files && req.files.length > 0) {
            for (const file of req.files) {
                const uploadedImage = await uploadToCloudinary(
                    file.buffer,
                    "resale-products"
                );

                imageUrls.push(uploadedImage.secure_url);
            }

            // analyse the images using gemini ai.
            try {
                aiAnalysis = await analyzeProductImage(
                    req.files
                );
            } catch (aiErr) {
                console.error("AI analysis failed:", aiErr.message);
            }
        }

        const resaleProduct = await ResaleStoreProducts.create({
            seller: existingUser._id,
            name,
            brand,
            stock: Number(stock) || 1,
            imageUrls,
            status: "pending_review",
            location: {
                type: "Point",
                coordinates: [Number(lng), Number(lat)],
                address: req.body.address || undefined,
            },
            description: req.body.description || aiAnalysis?.description || undefined,
            ...(aiAnalysis?.category && { estimatedResaleCoins: estimateResaleCoins(aiAnalysis.category) }),
            aiAnalysis: aiAnalysis ? {
                category: aiAnalysis.category,
                confidence: String(aiAnalysis.confidence || ""),
                description: aiAnalysis.description,
            } : undefined,
        });

        return res.status(201).json({
            success: true,
            message: "Resale product created successfully and sent for admin review",
            resaleProduct
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: `Error while creating resale product: ${error.message || error}`
        })
    }
}

export const getAllResaleProductsPerSeller = async (req, res) => {
    const userId = req.user?.userId;

    if (!userId) {
        return res.status(403)
            .json({
                success: false,
                message: `Login First.`
            })
    }

    try {
        const allResaleProducts = await ResaleStoreProducts.find({
            seller: userId
        }).sort({ createdAt: -1 });

        return res.status(200)
            .json({
                success: true,
                message: allResaleProducts.length
                    ? `fetched ${allResaleProducts.length} resale products`
                    : `No Resale Product Found.`,
                allResaleProducts
            })

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: `Error while fetching all resale products: ${error.message || error}`
        })
    }
}

export const getLiveResaleProducts = async (req, res) => {
    try {
        const now = new Date();
        const liveProducts = await ResaleStoreProducts.find({
            status: "live",
            $or: [
                { liveTill: { $gte: now } },
                { liveTill: null }
            ]
        })
        .populate("seller", "firstName lastName email phone")
        .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            message: `Fetched ${liveProducts.length} live resale products.`,
            allResaleProducts: liveProducts,
            products: liveProducts
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: `Error while fetching live resale products: ${error.message || error}`
        });
    }
};

export const getResaleProductDetails = async (req, res) => {
    try {
        const productId = req.params.productId || req.params.id;
        const product = await ResaleStoreProducts.findById(productId)
            .populate("seller", "firstName lastName email phone")
            .populate("verifiedBy", "firstName lastName email");

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found."
            });
        }

        return res.status(200).json({
            success: true,
            product,
            foundProduct: product
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: `Error while fetching resale product details: ${error.message || error}`
        });
    }
};

export const deleteResaleProduct = async (req, res) => {
    const productToDelete = req.params.productToDelete || req.params.productId;

    if (!productToDelete) {
        return res.status(400)
            .json({
                success: false,
                message: `No product to delete.`
            })
    }

    const userId = req.user?.userId;

    if (!userId) {
        return res.status(403)
            .json({
                success: false,
                message: `Login First.`
            })
    }

    try {
        const product = await ResaleStoreProducts.findById(productToDelete);

        if (!product) {
            return res.status(404)
                .json({
                    success: false,
                    message: `No product found.`
                })
        }

        if (product.seller.toString() !== userId) {
            return res.status(403)
                .json({
                    success: false,
                    message: `You are not authorized to delete this product.`
                })
        }

        const deletedProduct = await ResaleStoreProducts.deleteOne({
            _id: productToDelete,
        })

        return res.status(200)
            .json({
                success: true,
                message: `Product deleted successfully.`,
                deletedProduct
            })

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: `Error while deleting resale product: ${error.message || error}`
        })
    }
}
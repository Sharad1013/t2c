import { EcoStoreProducts } from "../../models/ecoStore/ecoStoreProducts.js";
import { User } from "../../models/user.js";
import { COINS_PER_RUPEE } from "../../utils/constants.js";  // 20

export const getAllProducts = async (req, res) => {
    try {
        const allProducts = await EcoStoreProducts.find({});

        return res.status(200)
            .json({
                success: true,
                message: allProducts.length
                    ? `fetched ${allProducts.length} products.`
                    : "No products found.",
                allProducts
            })
    } catch (error) {
        return res.status(500)
            .json({
                success: false,
                message: `Error while fetching all products ${error}`
            })
    }
}

export const getProductDetails = async (req, res) => {
    const { productId } = req.params;

    if (!productId) {
        return res.status(400)
            .json({
                success: false,
                message: `No Product id found.`
            })
    }

    try {
        const foundProduct = await EcoStoreProducts.findById(productId)

        if (!foundProduct) {
            return res.status(404)
                .json({
                    success: false,
                    message: `No Product found.`
                })
        }


        return res.status(200)
            .json({
                success: true,
                message: "Product found.",
                foundProduct
            })

    } catch (error) {
        return res.status(500)
            .json({
                success: false,
                message: `Error while fetching product details ${error}`
            })
    }
}

export const purchaseEcoStoreProduct = async (req, res) => {
    const userId = req.user?.userId;
    const { productId } = req.params;

    if (req.user?.role === "admin") {
        return res.status(403).json({ success: false, message: "Admins cannot purchase products." });
    }
    if (!userId) {
        return res.status(401).json({ success: false, message: "No user id found." });
    }

    const quantity = Number(req.body.quantity);
    if (!Number.isInteger(quantity) || quantity < 1) {
        return res.status(400).json({ success: false, message: "Quantity must be a positive whole number." });
    }

    try {
        // 1. read product without mutating
        const product = await EcoStoreProducts.findOne({ 
            _id: productId, 
            isActive: true
        });

        if (!product) {
            return res.status(404).json({ success: false, message: "Product not available." });
        }
        if (product.stock < quantity) {
            return res.status(409).json({ success: false, message: "Not enough stock." });
        }

        // 2. compute coin requirement (discountedPrice is a virtual on the schema)
        const totalPrice = product.discountedPrice * quantity;
        // 1 coin = ₹1, so the cap is just the rupee value of the allowed percentage
        const maxCoinsUsable = Math.ceil(totalPrice * (product.maxCoinPercent / 100));

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found." });
        }

        // 3. reject BEFORE reserving anything if coins are short
        if (user.trashCoins < maxCoinsUsable) {
            return res.status(400).json({
                success: false,
                message: `Not enough TrashCoins. This purchase requires ${maxCoinsUsable} coins, you have ${user.trashCoins}.`,
            });
        }

        // 4. reserve stock atomically (last mutating step that can't be pre-checked)
        const reserved = await EcoStoreProducts.findOneAndUpdate(
            { _id: productId, stock: { $gte: quantity } },
            { $inc: { stock: -quantity } },
            { new: true }
        );
        if (!reserved) {
            return res.status(409).json({ success: false, message: "Stock changed, please retry." });
        }

        // 5. deduct coins atomically, guarding against concurrent spend
        const coinsSpent = maxCoinsUsable;
        const cashToPay = Math.round((totalPrice - coinsSpent) * 100) / 100;  // coins are rupees 1:1   // user must cover the full allowed coin portion

        const userUpdate = await User.findOneAndUpdate(
            { _id: userId, trashCoins: { $gte: coinsSpent } },
            { $inc: { trashCoins: -coinsSpent } },
            { new: true }
        );
        if (!userUpdate) {
            // balance changed under us — roll back the stock we reserved
            await EcoStoreProducts.updateOne({ _id: productId }, { $inc: { stock: quantity } });
            return res.status(409).json({ success: false, message: "Coin balance changed, please retry." });
        }

        return res.status(200).json({
            success: true,
            message: "Purchase successful.",
            product: reserved.name,
            quantity,
            totalPrice,
            coinsSpent,
            cashToPay,
            remainingStock: reserved.stock,
            remainingCoins: userUpdate.trashCoins,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: `Error while buying the product ${error.message}`,
        });
    }
};
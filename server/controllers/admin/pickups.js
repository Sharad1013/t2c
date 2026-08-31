import { Pickup } from "../../models/pickup.js";

export const fetchPickupsAsPerStatus = async (req, res) => {
    const { status, state } = req.query;
    const filter = {};
    try {
        if (!status && !state) {
            return res.status(400).json({
                success: false,
                message: `Invalid status or state.`,
            });
        }

        if (status) {
            filter.status = status;
        }

        if (state) {
            filter["address.state"] = state;
        }

        const pickups = await Pickup.find(filter)

        if (pickups.length === 0) {
            return res.status(200)
                .json({
                    success: true,
                    message: `No pickups found.`
                })
        }

        return res.status(200)
            .json({
                success: true,
                message: `fetched ${pickups.length} ${filter} pickups.`,
                pickups: pickups
            })

    } catch (error) {
        return res.status(500)
            .json({
                success: false,
                message: `Error while fetching pickups.`
            })
    }
}

export const fetchAllPickups = async (req, res) => {
    try {
        const pickups = await Pickup.find({})

        if (pickups.length === 0) {
            return res.status(200)
                .json({
                    success: true,
                    message: `No pickups found.`
                })
        }

        return res.status(200)
            .json({
                success: true,
                message: `fetched ${pickups.length} pickups.`,
                pickups: pickups
            })

    } catch (error) {
        return res.status(500)
            .json({
                success: false,
                message: `Error while fetching all pickups.`
            })
    }
}
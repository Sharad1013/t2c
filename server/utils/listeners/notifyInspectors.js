import pickupEmitter from "../pickupEmitter.js";
import { Notification } from "../../models/notification.js";
import { User } from "../../models/user.js";
import { Inspector } from "../../models/inspector.js";

pickupEmitter.on('pickup:registered', async (pickup) => {
    try {
        const city = pickup?.address?.city;
        const inspectors = await Inspector.find({
            'address.city': city
        },
            { _id: 1 } // only need the ids
        ).lean();

        if (inspectors.length === 0) return;

        const docs = inspectors.map((ins) => ({
            recipientModel: 'Inspector',
            recipient: ins._id,
            type: 'PICKUP_REGISTERED',
            pickup: pickup._id,
            message: `New pickup registered in ${city} at ${pickup.address.street}`,
        }));

        await Notification.insertMany(docs);  // one DB call for all inspectors

    } catch (err) {
        console.error("Error in notifyInspectors listener:", err.message);
    }
});
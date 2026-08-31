import { Notification } from "../models/notification.js";

export async function getNotifications(req, res) {
    const { unreadOnly } = req.query;
    
    const filter = { recipient: req.user.userId };
    if (unreadOnly === 'true') filter.isRead = false;

    const items = await Notification.find(filter)
        .sort({ createdAt: -1 })
        .limit(50)
        .populate('pickup')
        .lean()

    const unreadCount = await Notification.countDocuments({
        recipient: req.user.userId,
        isRead: false,
    });

    res.json({ success: true, items, unreadCount });
}

export async function markRead(req, res) {
    const { ids } = req.body;
    const filter = { recipient: req.user.userId, isRead: false };
    if (ids?.length) filter._id = { $in: ids };

    await Notification.updateMany(filter, { $set: { isRead: true } });
    res.json({ success: true });
}
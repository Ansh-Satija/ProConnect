import Notification from "../models/notification.model.js";

// 1. TO GET ALL NOTIFICATIONS RECEIVED BY THE LOGGED-IN USER
export const getNotifications = async (req, res) => {

    try {

        const user = req.user;

        const notifications = await Notification.find({
            recipient: user._id    // FETCH ALL NOTIFICATIONS RECEIVED BY LOGGED-IN USER
        })
            .populate("sender", "name username profilePicture")
            .populate("post", "body")
            .sort({ createdAt: -1 });

        // Remove legacy post notifications whose post was deleted before the
        // delete handler used the correct `post` field.
        const orphanedPostNotifications = notifications.filter(notification =>
            (notification.type === "LIKE" || notification.type === "COMMENT") && !notification.post
        );
        if (orphanedPostNotifications.length > 0) {
            await Notification.deleteMany({
                _id: { $in: orphanedPostNotifications.map(notification => notification._id) }
            });
        }

        const activeNotifications = notifications.filter(notification => !orphanedPostNotifications.includes(notification));

        return res.status(200).json({ notifications: activeNotifications })
    }
    catch (err) {
        return res.status(500).json({ message: err.message });
    }
}

// 2. TO MARK A NOTIFICATION AS READ I.E. CHANGE THE "ISREAD" FIELD TO TRUE IN ITS DOC IN DB
export const markNotificationAsRead = async (req, res) => {

    const { notificationId } = req.params;
    try {

        const user = req.user; // AFTER AUTHENTICATION, THE AUTH MIDDLEWARE PUTS ENTIRE USER DOC IN REQ.BODY

        const notification = await Notification.findOne({
            _id: notificationId,
            recipient: user._id
        });

        if (!notification) {
            return res.status(404).json({ message: "Notification Not Found" });
        }

        // IF YOU FIND THE REQUIRED NOTIFICATION OBJECT
        notification.isRead = true;

        await notification.save();

        return res.status(200).json({ message: "Notification Marked As Read" })
    }
    catch (err) {
        return res.status(500).json({ message: err.message })
    }
}

// 3. TO MARK ALL NOTIFICATIONS AS READ AT ONCE
export const markAllNotificationsAsRead = async (req, res) => {

    try {
        const user = req.user;

        // UPDATE ALL NOTIFICATION OBJECTS WHERE RECIPIENT = CURR LOGGED-IN USER AND MARK ISREAD FIELD = TRUE IN THEM
        await Notification.updateMany(
            {
                recipient: user._id,
                isRead: false
            },
            {
                $set: {isRead: true}
            }
        );

        return res.status(200).json({message: "All Notifications Marked As Read"});
    }
    catch (err) {
        return res.status(500).json({ message: err.message });
    }
}

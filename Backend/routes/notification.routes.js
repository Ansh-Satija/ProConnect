import {Router} from "express"

import { authenticateUser } from "../middlewares/auth.middleware.js"
import { getNotifications, markAllNotificationsAsRead, markNotificationAsRead } from "../controllers/notification.controller.js"

const router = Router();

// TO GET ALL NOTIFICATIONS RECEIVED BY THE LOGGED-IN USER
router.route("/notifications").get(authenticateUser, getNotifications)

// TO MARK A SINGLE NOTIFICATION AS READ
router.route("/notifications/:notificationId/read").patch(authenticateUser, markNotificationAsRead)

// TO MARK ALL NOTIFICATIONS AS READ
router.route("/notifications/read-all").patch(authenticateUser, markAllNotificationsAsRead)

export default router;
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import UserLayout from '@/layout/UserLayout';
import DashboardLayout from "@/layout/DashbaordLayout";
import { markNotificationAsRead, markAllNotificationsAsRead } from "@/config/redux/action/notificationAction";
import styles from "./index.module.css"
import { mediaUrl } from "@/config";
import { useRouter } from "next/router";

export default function Notifications() {

    const notificationState = useSelector((state) => state.notification);
    const notifications = notificationState.notifications;

    const dispatch = useDispatch();
    const router = useRouter();

    // EVENT HANDLER FUNCTION - EXECUTED TO MARK A SINGLE NOTIFICATION AS READ
    const handleNotificationClick = (notification) => {

        const token = localStorage.getItem("token");
        if (!notification.isRead) {
            dispatch(markNotificationAsRead({
                notificationId: notification._id,
                token
            }));
        }

        if (notification.type === "CONNECTION_REQUEST") {
            router.push("/my_connections");
        }
        else if (notification.type === "CONNECTION_ACCEPTED") {
            router.push(
                `/view_profile/${encodeURIComponent(notification.sender.username)}`
            );
        }
        else if((notification.type === "LIKE" || notification.type === "COMMENT") && notification.post?._id){
            router.push(`/dashboard?postId=${notification.post._id}`)
        }
    }

    // EVENT HANDLER FUNCTION - EXECUTED TO MARK ALL NOTIFICATIONS AS READ
    const handleMarkAllAsRead = () => {
        const token = localStorage.getItem("token")

        dispatch(markAllNotificationsAsRead({ token }))
    }

    return (

        <UserLayout>
            <DashboardLayout>

                <h1 className={styles.heading}>Notifications</h1>
                <div className={styles.container}>

                    {/* MARK ALL AS READ BUTTON */}
                    {notifications.some((notification) => !notification.isRead) && (
                        <button
                            onClick={() => {
                                handleMarkAllAsRead()
                            }}
                            className={styles.markAllBtn}
                        >Mark All as Read</button>
                    )}

                    {notifications.length === 0 && (
                        <p className={styles.empty}>No Notifications</p>
                    )}

                    {/* NOTIFICATIONS LIST */}
                    <div className={styles.notificationList}>

                        {notifications.map((notification) => (

                            <div
                                key={notification._id}
                                className={`${styles.notification} ${!notification.isRead ? styles.unread : styles.read}`}
                                onClick={() => {
                                    handleNotificationClick(notification)
                                }}
                            >
                                <div className={styles.content}>

                                    <img
                                        src={mediaUrl(notification.sender?.profilePicture)} alt="profilePicture"
                                        onClick={(e) => {
                                            router.push(`/view_profile/${encodeURIComponent(notification.sender.username)}`)
                                            e.stopPropagation()
                                        }}
                                    />
                                    <p
                                        className={styles.sender}
                                        onClick={(e) => {
                                            router.push(`/view_profile/${encodeURIComponent(notification.sender.username)}`)
                                            e.stopPropagation()
                                        }}
                                    >
                                        {notification.sender?.name}
                                    </p>
                                    <p className={styles.message}>
                                        {notification.type === "CONNECTION_REQUEST" && "Sent You a Connection Request"}
                                        {notification.type === "CONNECTION_ACCEPTED" && "Accepted Your Connection Request"}
                                        {notification.type === "LIKE" && "Liked Your Post"}
                                        {notification.type === "COMMENT" && "Commented on Your Post"}
                                    </p>

                                </div>

                                {/* BUTTON TO MARK A SINGLE NOTIFICATION AS READ
                                {!notification.isRead && (
                                    <button
                                        className={styles.readButton}
                                        onClick={(e) => {
                                            handleMarkAsRead(notification._id)
                                            e.stopPropagation()
                                        }}
                                    >
                                        Mark as Read
                                    </button>
                                )} */}
                            </div>
                        ))}
                    </div>

                </div>
            </DashboardLayout>
        </UserLayout>
    )
}

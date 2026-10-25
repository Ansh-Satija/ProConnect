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
            if (notification.sender?.username) {
                router.push(`/view_profile/${encodeURIComponent(notification.sender.username)}`);
            }
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

    const formatTimestamp = (value) => {
        if (!value) return "";
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return "";
        return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }).format(date);
    };

    const unreadCount = notifications.filter((notification) => !notification.isRead).length;

    return (

        <UserLayout>
            <DashboardLayout>

                <main className={styles.page}>
                    <header className={styles.pageHeading}>
                        <div>
                            <span className={styles.eyebrow}>STAY IN THE LOOP</span>
                            <h1 className={styles.heading}>Notifications</h1>
                            <p>See what’s happening across your network.</p>
                        </div>
                        {unreadCount > 0 && <span className={styles.unreadSummary}>{unreadCount} unread</span>}
                    </header>

                    <section className={styles.container}>
                        <div className={styles.listHeader}>
                            <h2>Your updates</h2>
                            {unreadCount > 0 && (
                                <button type="button" onClick={handleMarkAllAsRead} className={styles.markAllBtn}>Mark all as read</button>
                            )}
                        </div>

                        {notifications.length === 0 && (
                            <div className={styles.empty}>
                                <span aria-hidden="true">✓</span>
                                <h2>You’re all caught up</h2>
                                <p>When someone connects with you or interacts with your posts, you’ll see it here.</p>
                            </div>
                        )}

                        <div className={styles.notificationList}>

                            {notifications.map((notification) => {
                                const message = {
                                    CONNECTION_REQUEST: "sent you a connection request",
                                    CONNECTION_ACCEPTED: "accepted your connection request",
                                    LIKE: "liked your post",
                                    COMMENT: "commented on your post",
                                }[notification.type] || "interacted with you";
                                const typeIcon = { CONNECTION_REQUEST: "+", CONNECTION_ACCEPTED: "✓", LIKE: "♥", COMMENT: "…" }[notification.type] || "•";

                                return (
                                    <div
                                        key={notification._id}
                                        role="button"
                                        tabIndex={0}
                                        className={`${styles.notification} ${!notification.isRead ? styles.unread : styles.read}`}
                                        onClick={() => handleNotificationClick(notification)}
                                        onKeyDown={(event) => {
                                            if (event.target === event.currentTarget && (event.key === "Enter" || event.key === " ")) {
                                                event.preventDefault();
                                                handleNotificationClick(notification);
                                            }
                                        }}
                                    >
                                        <div className={styles.content}>
                                            <div className={styles.avatarWrap}>
                                                <img
                                                    src={mediaUrl(notification.sender?.profilePicture)}
                                                    alt=""
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        if (notification.sender?.username) router.push(`/view_profile/${encodeURIComponent(notification.sender.username)}`);
                                                    }}
                                                />
                                                <span className={styles.typeMarker} aria-hidden="true">{typeIcon}</span>
                                            </div>
                                            <div className={styles.notificationCopy}>
                                                <p>
                                                    <button
                                                        type="button"
                                                        className={styles.sender}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            if (notification.sender?.username) router.push(`/view_profile/${encodeURIComponent(notification.sender.username)}`);
                                                        }}
                                                    >{notification.sender?.name || "Someone"}</button>{" "}
                                                    <span className={styles.message}>{message}</span>
                                                </p>
                                                {notification.createdAt && <time className={styles.timestamp} dateTime={notification.createdAt}>{formatTimestamp(notification.createdAt)}</time>}
                                            </div>
                                        </div>
                                        {!notification.isRead && <span className={styles.unreadDot} aria-label="Unread" />}
                                    </div>
                                );
                            })}
                        </div>
                    </section>
                </main>
            </DashboardLayout>
        </UserLayout>
    )
}

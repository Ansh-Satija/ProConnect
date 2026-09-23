import React, { useEffect } from 'react'
import styles from "./styles.module.css"
import { useRouter } from 'next/router'
import { useDispatch, useSelector } from 'react-redux'
import { reset } from '@/config/redux/reducer/authReducer'  // USED FOR LOGOUT 
import { getNotifications } from '@/config/redux/action/notificationAction'


function NavbarComponent() {

    const router = useRouter()
    const authState = useSelector((state) => state.auth)
    const dispatch = useDispatch();

    const notificationState = useSelector((state) => state.notification);
    const notifications = notificationState.notifications;  // THIS ARRAY CONTAINS ALL THE NOTIFICATIONS DATA 

    // Calculate unread count - ONLY COUNT THOSE NOTIFICATION DOCS WHERE ISREAD VALUE = FALSE
    const unreadCount = notifications.filter((notification) => !notification.isRead).length;

    // Dispatch getNotifications() action when the logged-in navbar loads
    useEffect(() => {

        if (authState.profileFetched) {
            const token = localStorage.getItem("token");

            if (token) {
                dispatch(getNotifications({ token }));
            }
        }
    }, [authState.profileFetched, dispatch])




    return (

        <div className={styles.container}>

            <nav className={styles.navBar}>

                <h1
                    className={styles.title}
                    onClick={() => { router.push("/") }}>ProConnect</h1>

                <div className={styles.navBarOptionContainer}>

                    {authState.profileFetched && <div>

                        <div style={{ display: "flex", gap: "1.2rem" }}>

                            {/* NOTIFICATIONS */}
                            <div className={styles.notificationWrapper}>
                                <span className={styles.bell}
                                    onClick={() => {
                                        router.push("/notifications")
                                    }}
                                >
                                    🔔
                                </span>
                                <span>Notifications</span>

                                {unreadCount > 0 && (
                                    <span className={styles.notificationCount}>
                                        {unreadCount}
                                    </span>
                                 
                                )}

                            </div>

                            {/* PROFILE */}
                            <p onClick={() => {
                                router.push("/profile")
                            }} className={styles.navbarOption} >Profile</p>

                            {/* LOGOUT OPTION */}
                            <p onClick={() => {
                                localStorage.removeItem("token")
                                router.push("/login")
                                dispatch(reset())
                            }}
                                className={styles.navbarOption} >Logout</p>

                        </div>

                    </div>}

                    {!authState.profileFetched && <div onClick={() => {
                        router.push("/login")
                    }}
                        className={styles.buttonJoin}>
                        <p>Be a Part</p>
                    </div>}


                </div>

            </nav>

        </div>
    )
}

export default NavbarComponent

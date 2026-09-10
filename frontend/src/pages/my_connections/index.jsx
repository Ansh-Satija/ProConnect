import { acceptConnection, getConnectionRequest, getMyConnectionRequests } from '@/config/redux/action/authAction';
import DashboardLayout from '@/layout/DashbaordLayout'
import UserLayout from '@/layout/UserLayout'
import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import styles from "./index.module.css"
import { BASE_URL } from '@/config';
import { useRouter } from 'next/router';

function MyConnectionsPage() {

    const dispatch = useDispatch();
    const authState = useSelector((state) => state.auth)
    const router = useRouter();

    useEffect(() => {
        const token = localStorage.getItem("token");

        // A connection can be a request received by the user or one they sent
        // that was accepted by the recipient, so load both directions.
        dispatch(getMyConnectionRequests({ token }));
        dispatch(getConnectionRequest({ token }));
    }, [])

    const pendingRequests = authState.connectionRequest.filter(
        (connection) => connection.status_accepted === null
    );

    const acceptedConnections = [
        // Requests received by this user: show the sender.
        ...authState.connectionRequest
            .filter((connection) => connection.status_accepted === true)
            .map((connection) => ({ ...connection, connectedUser: connection.userId })),
        // Requests sent by this user: show the recipient.
        ...authState.connections
            .filter((connection) => connection.status_accepted === true)
            .map((connection) => ({ ...connection, connectedUser: connection.connectionId }))
    ];

    return (
        <UserLayout>

            <DashboardLayout>
                <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>

                    <h2>My Connections</h2>

                    {pendingRequests.length === 0 && <h1>No Connection Requests</h1>}


                    {/* IF LOGGED-IN USER HAS REJECTED A CONNECTION REQUEST, DON'T SHOW IT IN THIS PAGE */}
                    {/* ONLY SHOW PENDING AND ACCEPTED REQUESTS */}
                    {
                        pendingRequests.map((user, index) => {
                            return (
                                <div onClick={() => {
                                    router.push(`/view_profile/${user.userId.username}`)
                                }}
                                    className={styles.userCard} key={index}>

                                    <div style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "1.2rem",
                                        justifyContent: "space-between"
                                    }}
                                    >
                                        <div className={styles.profilePicture}>
                                            <img src={`${BASE_URL}/${user.userId.profilePicture}`} alt="Your Profile Picture" />
                                        </div>

                                        <div className={styles.userInfo}>
                                            <h3>{user.userId.name}</h3>
                                            <p>{user.userId.username}</p>
                                        </div>

                                        {/* REJECT/ IGNORE REQUEST BTN */}
                                        <button
                                            className={styles.rejectButton}
                                            onClick={(e) => {
                                                e.stopPropagation();

                                                dispatch(acceptConnection({
                                                    token: localStorage.getItem("token"),
                                                    connectionId: user._id,
                                                    action: "reject"
                                                }))
                                            }}
                                        >Ignore</button>

                                        <button
                                            className={styles.connectedButton}
                                            onClick={(e) => {
                                                e.stopPropagation();

                                                dispatch(acceptConnection({
                                                    token: localStorage.getItem("token"),
                                                    connectionId: user._id,
                                                    action: "accept"
                                                }))
                                            }}
                                        >Accept</button>
                                    </div>

                                </div>
                            )
                        })

                    }

                    {/* SHOW ALL ACCEPTED REQUESTS HERE */}
                    <h2>My Network</h2>
                    {acceptedConnections.map((user, index) => {

                        return (
                            <div onClick={() => {
                                router.push(`/view_profile/${user.connectedUser.username}`)
                            }}
                                className={styles.userCard} key={index}>

                                <div style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "1.2rem",
                                    justifyContent: "space-between"
                                }}
                                >
                                    <div className={styles.profilePicture}>
                                            <img src={`${BASE_URL}/${user.connectedUser.profilePicture}`} alt="Your Profile Picture" />
                                    </div>

                                    <div className={styles.userInfo}>
                                            <h3>{user.connectedUser.name}</h3>
                                            <p>{user.connectedUser.username}</p>
                                    </div>

                                </div>

                            </div>
                        )

                    })}
                </div>
            </DashboardLayout>

        </UserLayout>
    )
}

export default MyConnectionsPage

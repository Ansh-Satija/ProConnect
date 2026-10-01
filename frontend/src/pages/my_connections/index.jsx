import { acceptConnection, getConnectionRequest, getMyConnectionRequests, sendConnectionRequest } from '@/config/redux/action/authAction';
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

                    <section className={styles.buildYourNetwork}>
                        <h2>Build Your Network</h2>
                        <p className={styles.networkIntro}>People you may know</p>
                        <div className={styles.networkSuggestions}>
                            {authState.suggestedUsers?.map((user) => {
                                const sent = authState.connections.find((request) => request.connectionId?._id === user._id);
                                const received = authState.connectionRequest.find((request) => request.userId?._id === user._id);
                                const relationship = sent || received;
                                const status = relationship?.status_accepted === true
                                    ? "Connected"
                                    : sent?.status_accepted === null
                                        ? "Pending"
                                        : received?.status_accepted === null
                                            ? "Accept"
                                            : "Connect";

                                return (
                                    <div className={styles.networkSuggestion} key={user._id}>
                                        <img src={`${BASE_URL}/${user.profilePicture}`} alt="" />
                                        <div className={styles.networkUserInfo}>
                                            <h3>{user.name}</h3>
                                            <p>@{user.username}</p>
                                        </div>
                                        {status === "Connect" && (
                                            <button onClick={() => dispatch(sendConnectionRequest({
                                                token: localStorage.getItem("token"), user_id: user._id
                                            }))}>Connect</button>
                                        )}
                                        {status === "Accept" && (
                                            <button onClick={() => dispatch(acceptConnection({
                                                token: localStorage.getItem("token"), connectionId: relationship._id, action: "accept"
                                            }))}>Accept</button>
                                        )}
                                        {(status === "Pending" || status === "Connected") && (
                                            <span className={styles.networkStatus}>{status}</span>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </section>
                </div>
            </DashboardLayout>

        </UserLayout>
    )
}

export default MyConnectionsPage

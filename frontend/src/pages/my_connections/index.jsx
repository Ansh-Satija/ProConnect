import { acceptConnection, getConnectionRequest, getMyConnectionRequests, sendConnectionRequest } from '@/config/redux/action/authAction';
import DashboardLayout from '@/layout/DashbaordLayout'
import UserLayout from '@/layout/UserLayout'
import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import styles from "./index.module.css"
import { mediaUrl } from '@/config';
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
                <main className={styles.connectionsPage}>
                    <header className={styles.pageHeading}>
                        <span className={styles.eyebrow}>YOUR PROFESSIONAL CIRCLE</span>
                        <h1>Connections</h1>
                        <p>Manage your requests and stay close to the people in your network.</p>
                    </header>

                    <section className={styles.connectionSection}>
                        <div className={styles.sectionHeader}>
                            <div><h2>Connection requests</h2><p>People who would like to connect with you</p></div>
                            <span className={styles.requestCount}>{pendingRequests.length}</span>
                        </div>
                        {pendingRequests.length === 0 && (
                            <div className={styles.emptyState}><span aria-hidden="true">✓</span><p>You’re all caught up. New requests will show up here.</p></div>
                        )}
                        <div className={styles.connectionList}>
                            {pendingRequests.map((user) => (
                                <article
                                    onClick={() => router.push(`/view_profile/${encodeURIComponent(user.userId.username)}`)}
                                    onKeyDown={(event) => event.target === event.currentTarget && event.key === "Enter" && router.push(`/view_profile/${encodeURIComponent(user.userId.username)}`)}
                                    tabIndex={0}
                                    className={styles.userCard}
                                    key={user._id}
                                >
                                    <div className={styles.userIdentity}>
                                        <div className={styles.profilePicture}><img src={mediaUrl(user.userId?.profilePicture)} alt="Profile picture" /></div>
                                        <div className={styles.userInfo}><h3>{user.userId.name}</h3><p>@{user.userId.username}</p></div>
                                    </div>
                                    <div className={styles.requestActions}>
                                        <button className={styles.rejectButton} onClick={(e) => {
                                            e.stopPropagation();
                                            dispatch(acceptConnection({ token: localStorage.getItem("token"), connectionId: user._id, action: "reject" }));
                                        }}>Ignore</button>
                                        <button className={styles.connectedButton} onClick={(e) => {
                                            e.stopPropagation();
                                            dispatch(acceptConnection({ token: localStorage.getItem("token"), connectionId: user._id, action: "accept" }));
                                        }}>Accept</button>
                                    </div>
                                </article>
                            ))}
                        </div>
                    </section>

                    <section className={styles.connectionSection}>
                        <div className={styles.sectionHeader}>
                            <div><h2>My network</h2><p>People you’re connected with</p></div>
                            <span className={styles.requestCount}>{acceptedConnections.length}</span>
                        </div>
                        {acceptedConnections.length === 0 ? (
                            <div className={styles.emptyState}><span aria-hidden="true">↗</span><p>Your network is just getting started. Accept a request or discover new people.</p></div>
                        ) : (
                            <div className={styles.connectionList}>
                                {acceptedConnections.map((user) => (
                                    <article
                                        onClick={() => router.push(`/view_profile/${encodeURIComponent(user.connectedUser.username)}`)}
                                        onKeyDown={(event) => event.target === event.currentTarget && event.key === "Enter" && router.push(`/view_profile/${encodeURIComponent(user.connectedUser.username)}`)}
                                        tabIndex={0}
                                        className={styles.userCard}
                                        key={user._id}
                                    >
                                        <div className={styles.userIdentity}>
                                            <div className={styles.profilePicture}><img src={mediaUrl(user.connectedUser?.profilePicture)} alt="Profile picture" /></div>
                                            <div className={styles.userInfo}><h3>{user.connectedUser.name}</h3><p>@{user.connectedUser.username}</p></div>
                                        </div>
                                        <span className={styles.viewProfile}>View profile <span aria-hidden="true">→</span></span>
                                    </article>
                                ))}
                            </div>
                        )}
                    </section>

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
                                        <img src={mediaUrl(user.profilePicture)} alt="" />
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
                </main>
            </DashboardLayout>

        </UserLayout>
    )
}

export default MyConnectionsPage

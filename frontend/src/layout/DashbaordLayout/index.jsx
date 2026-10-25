import React, { useEffect } from 'react'

import styles from "./index.module.css"
import { useRouter } from 'next/router'
import { setTokenIsThere } from '@/config/redux/reducer/authReducer';
import { useDispatch, useSelector } from 'react-redux';
import { acceptConnection, getConnectionRequest, getMyConnectionRequests, getSuggestedUsers, sendConnectionRequest } from '@/config/redux/action/authAction';
import { mediaUrl } from '@/config';

export default function DashboardLayout({ children }) {

  const router = useRouter();

  const dispatch = useDispatch();

  const authState = useSelector((state) => state.auth);
  const navigationItems = [
    { label: "Home", href: "/dashboard", icon: "m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" },
    { label: "Discover", href: "/discover", icon: "m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" },
    { label: "Connections", href: "/my_connections", icon: "M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" },
  ];

  // AUTH GUARD - USER SHOULD BE LOGGED IN FIRST TO ACCESS DASHBOARDLAYOUT COMPONENTS, IF NOT LOGGED IN THEN REDIRECT TO LOGIN PAGE
  useEffect(() => {
    if (localStorage.getItem("token") === null) {
      router.push("/login");
    }
    dispatch(setTokenIsThere());
  }, [])

  // FETCH SUGGESTED USERS DATA AND CONNECTIONS FROM REDUX STORE BY DISPATCHING THESE ACTIONS (FOR RIGHT SIDEBAR)
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      // FOR SUGGESTED USERS DATA - 
      dispatch(getSuggestedUsers({ token }));
      // FOR CONNECTION DATA - 
      dispatch(getConnectionRequest({ token }));
      dispatch(getMyConnectionRequests({ token }))
    }
  }, [dispatch])

  // FUNCTION TO DETERMINE THE "CONNECT" (CONNECT/ PENDING/ CONNECTED/ RECEIVED) BTN'S STATE IN "BUILD YOUR NETWORK" SECTION 
  const getConnectionStatus = (userId) => {

    // Did I (LOGGED-IN USER) send this user a request?
    const sentRequest = authState.connections?.find(
      request => request.connectionId?._id === userId
    );

    if (sentRequest) { // IF REQUEST ALREADY SENT - CHECK IF HE ACCEPTED IT OR NOT AND DISPLAY BUTTON ACCORDINGLY

      if (sentRequest.status_accepted === true) {
        return {
          status: "connected",
          requestId: sentRequest._id
        }
      }
      if (sentRequest.status_accepted === null) {
        return {
          status: "pending",
          requestId: sentRequest._id
        }
      }
    }

    // Did this user send me a request?
    const receivedRequest = authState.connectionRequest?.find(
      request => request.userId?._id === userId
    );

    if (receivedRequest) { // IF LOGGED-IN USER RECEIVED THE REQUEST - CHECK IF HE ACCEPTED IT OR NOT AND DISPLAY BTN ACCORDINGLY

      if (receivedRequest.status_accepted === true) {
        return {
          status: "connected",
          requestId: receivedRequest._id
        };
      }
      if (receivedRequest.status_accepted === null) {
        return {
          status: "received",
          requestId: receivedRequest._id
        };
      }
    }
    // No relationship exists I.E. NO REQUEST SENT BY A->B OR B->A (A = LOGGED-IN USER, B = OTHER USER)
    // TO SEND NEW REQUEST
    return {
      status: "connect",
      requestId: null
    };
  };

  // (FOR RIGHT SIDEBAR) - FUNCTION TO SEND NEW CONNECTION REQUEST (IF NO CONNECTION EXISTS B/W LOGGED IN USER AND THE OTHER USER
  //  IN "BUILD YOUR NETWORK" SECTION) WHEN LOGGED-IN USER CLICKS "CONNECT" FOR ANY OTHER USER'S PROFILE IN RIGHT SIDEBAR
  const handleConnect = (userId) => {

    const token = localStorage.getItem("token");

    dispatch(
      sendConnectionRequest({
        token,
        user_id: userId
      })
    );
  };

  const handleAccept = (requestId) => {

    const token = localStorage.getItem("token");

    dispatch(
      acceptConnection({
        token,
        connectionId: requestId,
        action: "accept"
      })
    );
  };

  return (
    <div>

      <div className={styles.container}>

        <div className={styles.homeContainer}>

          <aside className={styles.homeContainer_leftBar} aria-label="Workspace navigation">
            <p className={styles.railLabel}>YOUR SPACE</p>
            {navigationItems.map((item) => (
              <button
                type="button"
                key={item.href}
                onClick={() => router.push(item.href)}
                className={`${styles.sideBarOption} ${router.pathname === item.href ? styles.sideBarOptionActive : ""}`}
                aria-current={router.pathname === item.href ? "page" : undefined}
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.7} stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                </svg>
                <span>{item.label}</span>
              </button>
            ))}
          </aside>

          {/* MIDDLE OF PAGE */}
          <div className={styles.homeContainer_feedContainer}>
            {children}
          </div>

          {/* RIGHT SIDE OF PAGE - BUILD YOUR NETWORK/ PEOPLE YOU MAY KNOW SECTION */}
          <div className={styles.homeContainer_extraContainer}>

            <div className={styles.railHeading}>
              <span className={styles.railKicker}>GROW YOUR CIRCLE</span>
              <h3>Build your network</h3>
              <p>People you may know</p>
            </div>

            <div className={styles.suggestedUsersList}>
            {authState.suggestedUsers?.map((user) => {

              const connection = getConnectionStatus(user._id);

              return (
                <div
                  key={user._id}
                  className={styles.suggestedProfile}
                  onClick={() => {
                    router.push(`/view_profile/${encodeURIComponent(user.username)}`)
                  }}
                >

                  {/* OPEN THE OTHER USERS PROFILE PAGE WHEN LOGGED-IN USERS CLICKS ON DP OR NAME FROM BUILD YOUR NETWORK SECTION */}
                  <img
                    src={mediaUrl(user.profilePicture)}
                    alt="Profile Picture"
                  // className={styles.userDetails}
                  // onClick={() => {
                  //   router.push(`/view_profile/${user.username}`)
                  // }}
                  />

                  <div>
                    <h4 className={styles.userDetails}>
                      {user.name}
                    </h4>
                    <p>@{user.username}</p>
                  </div>

                  {
                    connection.status === "connect" && (
                      <button
                        className={styles.connectButton}
                        onClick={(e) => {
                          handleConnect(user._id)
                          e.stopPropagation()
                        }}
                      >
                        Connect
                      </button>
                    )
                  }

                  {
                    connection.status === "pending" && (
                      <button
                        className={styles.pendingButton}
                        disabled
                        onClick={(e) => e.stopPropagation()}
                      >
                        Pending
                      </button>
                    )
                  }

                  {
                    connection.status === "connected" && (
                      <button
                        className={styles.connectedButton}
                        disabled
                        onClick={(e) => e.stopPropagation()}
                      >
                        Connected
                      </button>
                    )
                  }

                  {
                    connection.status === "received" && (
                      <button
                        className={styles.acceptButton}
                        onClick={(e) => {
                          handleAccept(connection.requestId)
                          e.stopPropagation()
                        }}
                      
                      >
                        Accept
                      </button>
                    )
                  }

                </div>
              );
            })}
            </div>
          </div>

        </div>


      </div>

      {/* TO DISPLAY NAVBAR OPTIONS (SCROLL, DISCOVER, MYCONNECTIONS) AT THE BOTTOM LIKE MOBILE VIEW 
      WHEN SCREEN SIZE < 600PX FOR RESPONSIVE DESIGN */}
      <nav className={styles.mobileNavbar} aria-label="Workspace navigation">
        {navigationItems.map((item) => (
          <button
            type="button"
            key={item.href}
            onClick={() => router.push(item.href)}
            className={`${styles.mobileNavItem} ${router.pathname === item.href ? styles.mobileNavItemActive : ""}`}
            aria-current={router.pathname === item.href ? "page" : undefined}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.7} stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
            </svg>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
    </div >
  )
}


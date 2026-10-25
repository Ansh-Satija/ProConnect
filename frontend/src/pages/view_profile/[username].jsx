import { clientServer, mediaUrl } from '@/config';
import DashboardLayout from '@/layout/DashbaordLayout';
import UserLayout from '@/layout/UserLayout';
import React, { useEffect, useState } from 'react'
import styles from "./index.module.css"
import { useRouter } from 'next/router';
import { useDispatch, useSelector } from 'react-redux';
import { getAllPosts } from '@/config/redux/action/postAction';
import { getAboutUser, getConnectionRequest, getMyConnectionRequests, sendConnectionRequest } from '@/config/redux/action/authAction';

export default function ViewProfilePage({ userProfile }) {

  const router = useRouter();
  const postReducer = useSelector((state) => state.postReducer)
  const dispatch = useDispatch();

  const authState = useSelector((state) => state.auth)
  const isOwnProfile = authState.userProfile?.userId?._id?.toString() === userProfile.userId?._id?.toString();

  const [userPosts, setUserPosts] = useState([]);

  const [isCurrentUserInConnection, setIsCurrentUserInConnection] = useState(false);

  const [isConnectionNull, setIsConnectionNull] = useState(true);


  const getUsersPost = async () => {
    const token = localStorage.getItem("token");
    await dispatch(getAllPosts());
    await dispatch(getConnectionRequest({
      token
    }))

    await dispatch(getMyConnectionRequests({
      token
    }))
    await dispatch(getAboutUser({ token }));
  }

  // RETURN ALL POSTS OF CURRENT USER TO DISPLAY IN THAT USER'S PROFILE PAGE
  useEffect(() => {

    const posts = postReducer.posts.filter((post) => {
      return post.userId.username === router.query.username;
    });

    setUserPosts(posts);

  }, [postReducer.posts, router.query.username]);

  useEffect(() => {
    const connection = authState.connections.find(
      (user) => user.connectionId?._id === userProfile.userId?._id
    );

    setIsCurrentUserInConnection(Boolean(connection));
    setIsConnectionNull(!connection?.status_accepted);

    if (authState.connectionRequest.some(user => user.userId._id === userProfile.userId._id)) {
      setIsCurrentUserInConnection(true)
      if (authState.connectionRequest.find(user => user.userId._id === userProfile.userId._id).status_accepted === true) {
        setIsConnectionNull(false)
      }
    }

  }, [authState.connections, userProfile.userId?._id, authState.connectionRequest])


  useEffect(() => {
    getUsersPost();
  }, [])


  useEffect(() => {
    console.log("From View: View Profile")
  })

  return (
    <UserLayout>
      <DashboardLayout>

        {/* PROFILE PAGE OF USER */}
        <div className={styles.container}>

          {/* TOP SECTION OF PROFILE PAGE - BACKDROP + PROFILE PICTURE */}
          <div className={styles.backDropContainer}>
            <img className={styles.backDrop} src={mediaUrl(userProfile.userId?.profilePicture)} alt="" />
          </div>


          <div className={styles.profileContainer_details}>

            {/* USER DETAILS - IT HAS LEFT SECTION + RIGHT SECTION */}
            <div className={styles.profileContainer_flex}>

              {/* LEFT SECTION OF USER DETAILS */}
                <div className={styles.profileMain}>

                <div className={styles.profileTitleRow}>
                  <h1>{userProfile.userId.name}</h1>
                  <p>@{userProfile.userId.username}</p>
                </div>

                <div className={styles.profileActions}>

                  {/* TO DISPLAY CONNECT BTN IF NOT A CONNECTION AND CONNECTED BTN IF IT IS A CONNECTION */}
                  {authState.userProfile && !isOwnProfile && (isCurrentUserInConnection ?
                    <button className={styles.connectedButton}>
                      {isConnectionNull ? "Pending" : "Connected"}
                    </button>
                    :
                    <button onClick={() => {
                      dispatch(sendConnectionRequest({
                        token: localStorage.getItem("token"),
                        user_id: userProfile.userId._id
                      }))
                    }}
                      className={styles.connectBtn}
                    >Connect</button>
                  )}

                  {/* DOWNLOAD PROFILE AS RESUME BUTTON */}
                  <button type="button"
                    className={styles.resumeButton}
                    onClick={async () => {
                      try {
                        const response = await clientServer.get("/user/download_resume", {
                          params: {
                            id: userProfile.userId._id,
                            token: localStorage.getItem("token")
                          },
                          responseType: "blob"
                        });
                        window.open(URL.createObjectURL(response.data), "_blank");
                      } catch (error) {
                        console.error("Resume download failed:", error);
                        window.alert(error.response?.data?.message || "Could not download this resume. Please sign in and try again.");
                      }
                    }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                    </svg>
                    <span>Download resume</span>
                  </button>

                </div>

                <div className={styles.profileIntro}>
                  <p>{userProfile.bio || "No introduction has been added yet."}</p>
                </div>

              </div>

              {/* RIGHT SECTION OF USER DETAILS */}
              <div className={styles.rightColumn} >

                <h3>Recent Activity</h3>

                {/* POST = STATE VARIABLE CONTAINING ALL THE POSTS OF CURRENT USER ONLY */}
                {userPosts.length === 0 && <p className={styles.emptyActivity}>No recent posts to show.</p>}
                {userPosts.map((post) => {

                  return (
                    <div key={post._id} className={styles.postCard}>
                      <div className={styles.card}>
                        <p>{post.body}</p>

                        <div className={styles.card_profileContainer}>

                          {post.media ? <img src={mediaUrl(post.media)} alt="Post attachment" />
                            :
                            <div style={{ width: "3.4rem", height: "3.4rem" }}></div>
                          }

                        </div>


                      </div>
                    </div>
                  )
                })}

              </div>

            </div>
          </div>

          {/* WORK HISTORY SECTION */}
          <div className={styles.workHistory}>
            <h3>Work History</h3>

            <div className={styles.workHistoryContainer}>
              {
                userProfile.pastWork.map((work, index) => {
                  return (
                    <div key={index} className={styles.workHistoryCard}>
                      <p style={{
                        fontWeight: "bold",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.8rem"
                      }}>
                        {work.company} - {work.position}
                      </p>
                      <p>{work.years}</p>
                    </div>
                  )
                })
              }
            </div>

          </div>

          {/* EDUCATION DETAILS SECTION */}
          <div className={styles.workHistory}>
            <h3>Education</h3>

            <div className={styles.workHistoryContainer}>
              {
                userProfile.education.map((work, index) => {
                  return (
                    <div key={index} className={styles.workHistoryCard}>
                      <p style={{
                        fontWeight: "bold",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.8rem"
                      }}>
                        {work.school}
                      </p>
                      <p>{work.degree} - {work.fieldOfStudy}</p>
                    </div>
                  )
                })
              }
            </div>

          </div>



        </div>

      </DashboardLayout>
    </UserLayout>
  )
}

export async function getServerSideProps(context) {
  const username = context.params?.username;

  if (typeof username !== "string" || !username.trim()) {
    return { notFound: true };
  }

  try {
    const request = await clientServer.get("/user/get_profile_based_on_username", {
      params: {
        username
      }
    })

    if (!request.data?.profile) {
      return { notFound: true };
    }

    return { props: { userProfile: request.data.profile } }
  }
  catch (err) {
    if (err.response?.status === 404) return { notFound: true };
    throw err;
  }
}

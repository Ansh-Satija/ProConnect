import { BASE_URL, clientServer } from '@/config';
import DashboardLayout from '@/layout/DashbaordLayout';
import UserLayout from '@/layout/UserLayout';
import { useSearchParams } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import styles from "./index.module.css"
import { useRouter } from 'next/router';
import { useDispatch, useSelector } from 'react-redux';
import { getAllPosts } from '@/config/redux/action/postAction';
import { getConnectionRequest, getMyConnectionRequests, sendConnectionRequest } from '@/config/redux/action/authAction';

export default function ViewProfilePage({ userProfile }) {

  const router = useRouter();
  const postReducer = useSelector((state) => state.postReducer)
  const dispatch = useDispatch();

  const authState = useSelector((state) => state.auth)

  const [userPosts, setUserPosts] = useState([]);

  const [isCurrentUserInConnection, setIsCurrentUserInConnection] = useState(false);

  const [isConnectionNull, setIsConnectionNull] = useState(true);


  const getUsersPost = async () => {
    await dispatch(getAllPosts());
    await dispatch(getConnectionRequest({
      token: localStorage.getItem("token")
    }))

    await dispatch(getMyConnectionRequests({
      token: localStorage.getItem("token")
    }))
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


  const searchParameters = useSearchParams();

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
            <img className={styles.backDrop} src={`${BASE_URL}/${userProfile.userId.profilePicture}`} alt="" />
          </div>


          <div className={styles.profileContainer_details}>

            {/* USER DETAILS - IT HAS LEFT SECTION + RIGHT SECTION */}
            <div className={styles.profileContainer_flex}>

              {/* LEFT SECTION OF USER DETAILS */}
              <div style={{ flex: "0.7" }}>

                <div style={{ display: "flex", width: "fit-content", alignItems: "center", gap: "1rem", marginBottom: "1rem" }}>
                  <h2>{userProfile.userId.name}</h2>
                  <p style={{ color: "grey" }}>@{userProfile.userId.username}</p>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "1.2rem", marginBottom: "1rem" }}>

                  {/* TO DISPLAY CONNECT BTN IF NOT A CONNECTION AND CONNECTED BTN IF IT IS A CONNECTION */}
                  {isCurrentUserInConnection ?
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
                  }

                  {/* DOWNLOAD PROFILE AS RESUME BUTTON */}
                  <div
                    className={styles.resumeButton}
                    onClick={async () => {
                      const response = await clientServer.get(`/user/download_resume?id=${userProfile.userId._id}`)
                      window.open(`${BASE_URL}/${response.data.message}`, "_blank")
                    }}
                    style={{ cursor: "pointer" }}
                  >
                    <svg style={{ width: "1.2em" }} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                    </svg>

                  </div>

                </div>

                <div>
                  <p>{userProfile.bio}</p>
                </div>

              </div>

              {/* RIGHT SECTION OF USER DETAILS */}
              <div className={styles.rightColumn} >

                <h3>Recent Activity</h3>

                {/* POST = STATE VARIABLE CONTAINING ALL THE POSTS OF CURRENT USER ONLY */}
                {userPosts.map((post) => {

                  return (
                    <div key={post._id} className={styles.postCard}>
                      <div className={styles.card}>
                        <p>{post.body}</p>

                        <div className={styles.card_profileContainer}>

                          {post.media !== "" ? <img src={`${BASE_URL}/${post.media}`} />
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

  console.log("From View")
  console.log(context.query.username)

  const request = await clientServer.get("/user/get_profile_based_on_username", {
    params: {
      username: context.query.username
    }
  })

  const response = await request.data;
  console.log(response)

  return { props: { userProfile: request.data.profile } }
}

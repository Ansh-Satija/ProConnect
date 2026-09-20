import { BASE_URL, clientServer } from '@/config';
import { getAboutUser } from '@/config/redux/action/authAction';
import { getAllPosts } from '@/config/redux/action/postAction';
import UserLayout from '@/layout/UserLayout'
import DashboardLayout from '@/layout/DashbaordLayout';
import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import styles from "./index.module.css"


export default function ProfilePage() {

    const authState = useSelector((state) => state.auth)
    const postReducer = useSelector((state) => state.postReducer)

    const dispatch = useDispatch();

    const [userProfile, setUserProfile] = useState({});
    const [userPosts, setUserPosts] = useState([])

    // TO TRACK IF POPUP WINDOW FOR ADDING WORK HISTORY IS OPEN OR NOT
    const [isModalOpen, setIsModalOpen] = useState(false);

    // TO TRACK AND UPDATE THE FIELDS FOR ADDING WORK HISTORY POPUP WINDOW
    const [inputData, setInputData] = useState({ company: "", position: "", years: "" })
    const handleWorkInputChange = (e) => {
        const { name, value } = e.target;

        setInputData({ ...inputData, [name]: value })
    }

    // TO TRACK IF POPUP WINDOW FOR ADDING EDUCATION DETAILS IS OPEN OR NOT 
    const [isEducationModalOpen, setIsEducationModalOpen] = useState(false);

    // TO TRACK AND UPDATE THE FIELDS IN ADDING EDUCATION DETAILS POPUP WINDOW
    const [educationInputData, setEducationInputData] = useState({ school: "", degree: "", fieldOfStudy: "" });
    const handleEducationInputChange = (e) => {
        const { name, value } = e.target;

        setEducationInputData({
            ...educationInputData,
            [name]: value
        });
    };



    // TO FETCH LOGGED-IN USER'S PROFILE DETAILS AND POSTS
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            dispatch(getAboutUser({ token }));
            dispatch(getAllPosts());
        }
    }, [dispatch])

    useEffect(() => {
        if (authState.userProfile) {
            setUserProfile(authState.userProfile)
        }
    }, [authState.userProfile])

    useEffect(() => {
        if (userProfile?.userId?._id && Array.isArray(postReducer?.posts)) {
            const myPosts = postReducer.posts.filter((post) => {
                return post?.userId && (
                    post.userId?._id === userProfile.userId._id ||
                    post.userId === userProfile.userId._id ||
                    post.userId?.username === userProfile.userId.username
                );
            });
            setUserPosts(myPosts);
        }
    }, [postReducer?.posts, userProfile?.userId?._id, userProfile?.userId?.username])

    // TO EDIT PROFILE PICTURE OF LOGGED-IN USER
    const updateProfilePicture = async (file) => {
        if (!file) return;

        const token = localStorage.getItem("token");
        const formData = new FormData();
        formData.append("profile_picture", file);
        formData.append("token", token)

        const response = await clientServer.post("/update_profile_picture", formData, {
            headers: {
                "Content-Type": "multipart/form-data"
            }
        });

        dispatch(getAboutUser({
            token: localStorage.getItem("token")
        }))
    }

    // EVENT HANDLER FUNCTION TRIGGERED WHEN UPDATE BUTTON (AT END OF PAGE) IS CLICKED - TO SAVE CHANGES MADE BY LOGGED-IN USER IN ANY FIELD OF PROFILE PAGE
    const updateProfileData = async () => {
        try {
            const token = localStorage.getItem("token");

            console.log("UPDATE BUTTON CLICKED");
            console.log("TOKEN EXISTS:", !!token);

            if (!token) return;

            console.log("CALLING /user_update");

            const userResponse = await clientServer.post("/user_update", {
                token,
                name: userProfile?.userId?.name || ""
            });

            console.log("USER UPDATE SUCCESS:", userResponse.data);
            console.log("CALLING /update_profile_data");

            const profileResponse = await clientServer.post(
                "/update_profile_data",
                {
                    token,
                    bio: userProfile?.bio || "",
                    currentPost: userProfile?.currentPost || "",
                    pastWork: userProfile?.pastWork || [],
                    education: userProfile?.education || []
                }
            );

            console.log("PROFILE UPDATE SUCCESS:", profileResponse.data);

            const result = await dispatch(getAboutUser({ token }));

            console.log("GET ABOUT USER RESULT:", result);

        } catch (err) {
            console.log("UPDATE ERROR:", err);
            console.log("STATUS:", err.response?.status);
            console.log("DATA:", err.response?.data);
        }
    };

    return (
        <UserLayout>
            <DashboardLayout>

                {/* RENDER THIS COMPONENT ONLY WHEN PROFILE DATA IS LOADED */}
                {userProfile && userProfile.userId ? (
                    <div className={styles.container}>

                        {/* TOP SECTION OF PROFILE PAGE - BACKDROP + PROFILE PICTURE */}
                        <div className={styles.backDropContainer}>

                            {/* TO EDIT PROFILE PICTURE */}
                            <label htmlFor='profilePictureUpload' className={styles.backDrop_overlay}>
                                <p>Edit</p>
                            </label>
                            <input
                                onChange={(e) => {
                                    updateProfilePicture(e.target.files[0])
                                }}
                                hidden type="file" id="profilePictureUpload"
                            />
                            <img src={`${BASE_URL}/${userProfile.userId?.profilePicture || 'default.jpg'}`} alt="Profile" />

                        </div>

                        <div className={styles.profileContainer_details}>

                            {/* TWO-COLUMN LAYOUT: LEFT (USER INFO + WORK HISTORY) & RIGHT (RECENT ACTIVITY) */}
                            <div style={{ display: "flex", gap: "1.5rem" }}>

                                {/* LEFT COLUMN */}
                                <div style={{ flex: "0.68" }}>

                                    {/* USER DETAILS - NAME, USERNAME, BIO */}
                                    <div className={styles.nameRow} >
                                        <input   // IT IS A FORM FIELD SO IT IS EDITABLE. CLICK ON IT AND START EDITING -> CLICK ON UPDATE BTN TO SAVE CHANGESS
                                            className={styles.nameEdit}
                                            value={userProfile.userId?.name || ""}
                                            onChange={(e) => {
                                                setUserProfile({
                                                    ...userProfile,
                                                    userId: {
                                                        ...userProfile.userId, name: e.target.value
                                                    }
                                                })
                                            }}
                                            type="text" />
                                        <p style={{ color: "grey" }}>@{userProfile.userId?.username}</p>
                                    </div>

                                    {/* USER'S BIO SECTION */}
                                    <div style={{ marginBottom: "1.5rem", width: "100%" }}>

                                        <textarea
                                            value={userProfile.bio || ""}
                                            onChange={(e) => {
                                                setUserProfile({ ...userProfile, bio: e.target.value });
                                            }}

                                            rows={Math.max(3, Math.ceil(userProfile.bio.length / 80))}

                                        />


                                    </div>

                                    {/* WORK HISTORY SECTION - SHIFTED UPWARDS UNDER BIO */}
                                    <div className={styles.workHistory}>
                                        <h3>Work History</h3>

                                        <div className={styles.workHistoryContainer}>
                                            {
                                                userProfile.pastWork && userProfile.pastWork.map((work, index) => {
                                                    return (
                                                        <div key={work?._id || index} className={styles.workHistoryCard}>
                                                            <p style={{
                                                                fontWeight: "bold",
                                                                display: "flex",
                                                                alignItems: "center",
                                                                gap: "0.8rem"
                                                            }}>
                                                                {work?.company} - {work?.position}
                                                            </p>
                                                            <p>{work?.years}</p>
                                                        </div>
                                                    )
                                                })
                                            }


                                        </div>
                                        {/* BUTTON TO OPEN THE ADD WORK HISTORY POPUP WINDOW */}
                                        <button className={styles.addWorkButton}
                                            onClick={() => {
                                                setIsModalOpen(true)
                                            }}>Add Work</button>
                                    </div>

                                    {/* EDUCATION DETAILS SECTION */}
                                    <div className={styles.workHistory}>  {/* REUSE SAME CSS CLASSES AS WORK HISTORY */}
                                        <h3>Education</h3>

                                        <div className={styles.workHistoryContainer}>
                                            {
                                                userProfile.education && userProfile.education.map((work, index) => {
                                                    return (
                                                        <div key={work?._id || index} className={styles.workHistoryCard}>
                                                            <p style={{
                                                                fontWeight: "bold",
                                                                display: "flex",
                                                                alignItems: "center",
                                                                gap: "0.8rem"
                                                            }}>
                                                                {work?.school}
                                                            </p>
                                                            <p>{work?.degree} - {work?.fieldOfStudy}</p>
                                                        </div>
                                                    )
                                                })
                                            }

                                        </div>

                                        {/* BUTTON TO OPEN THE ADD EDUCATION DETAILS POPUP WINDOW */}
                                        <button className={styles.addWorkButton}
                                            onClick={() => {
                                                setIsEducationModalOpen(true)
                                            }}>Add Education</button>
                                    </div>

                                    {/* UPDATE BUTTON TO UPDATE/REFRESH UI WHEN LOGGED-IN USER EDITS/UPDATES ANY FIELD OF HIS PROFILE PAGE */}
                                    {/* BUTTON GETS VISIBLE TO LOGGED-IN USER ONLY WHEN HE EDITS/UPDATES ANY FIELD IN HIS PROFILE PAGE */}
                                    {authState.userProfile && JSON.stringify(userProfile) !== JSON.stringify(authState.userProfile) && (
                                        <div
                                            onClick={() => {
                                                updateProfileData()
                                            }}
                                            className={styles.updateProfileBtn}>
                                            Update Profile
                                        </div>
                                    )}

                                </div>

                                {/* RIGHT COLUMN: RECENT ACTIVITY - BESIDE USERNAME */}
                                <div className={styles.rightColumn}>
                                    <h3>Recent Activity</h3>

                                    {/* POST = STATE VARIABLE CONTAINING ALL THE POSTS OF CURRENT USER ONLY */}
                                    {userPosts.map((post, index) => {
                                        return (
                                            <div key={post?._id || index} className={styles.postCard}>
                                                <div className={styles.card}>
                                                    <div className={styles.card_profileContainer}>
                                                        {post?.media ? <img src={`${BASE_URL}/${post.media}`}
                                                            className={styles.postImage} alt="" /> :
                                                            <div style={{ width: "3.4rem", height: "3.4rem" }}></div>
                                                        }
                                                    </div>

                                                    <p>{post?.body}</p>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>

                            </div>

                        </div>
                    </div>
                ) : (
                    <p style={{ padding: "2rem" }}>Loading profile...</p>
                )}


                {/* WINDOW POPUP FOR ADD WORK HISTORY SECTION (SAME AS COMMENT POPUP WINDOW UNDER A POST) - ONLY APPEARS WHEN WE CLICK ADD WORK HISTORY BTN */}
                {
                    isModalOpen &&
                    <div

                        // TO REMOVE THE POPUP WINDOW FROM SCREEN WHEN USER CLICKS ELSEWHERE (IN BACKGROUND) OTHER THAN POPUP WINDOW 
                        onClick={() => {
                            setIsModalOpen(false)
                        }}
                        className={styles.commentsContainer}
                    >

                        {/* ADD WORK HISTORY WINDOW */}
                        <div
                            onClick={(e) => {
                                e.stopPropagation()
                            }}
                            className={styles.allCommentsContainer}
                        >

                            <h2>Add Work History</h2>

                            <input onChange={handleWorkInputChange} name='company' className={styles.inputField} type="text" placeholder="Enter Company" />
                            <input onChange={handleWorkInputChange} name='position' className={styles.inputField} type="text" placeholder="Enter Position" />
                            <input onChange={handleWorkInputChange} name='years' className={styles.inputField} type="number" placeholder="Enter Years" />

                            <div onClick={() => {
                                setUserProfile({ ...userProfile, pastWork: [...userProfile.pastWork, inputData] })
                                setIsModalOpen(false)
                            }} className={styles.updateProfileBtn}> Add Work </div>

                        </div>

                    </div>


                }

                {/* WINDOW POPUP FOR ADDING EDUCATION DETAILS (SAME AS COMMENT POPUP WINDOW UNDER A POST) - ONLY APPEARS WHEN WE CLICK ADD WORK HISTORY BTN */}
                {
                    isEducationModalOpen &&
                    <div

                        // TO REMOVE THE POPUP WINDOW FROM SCREEN WHEN USER CLICKS ELSEWHERE (IN BACKGROUND) OTHER THAN POPUP WINDOW 
                        onClick={() => {
                            setIsEducationModalOpen(false)
                        }}
                        className={styles.commentsContainer}
                    >

                        {/* ADD EDUCATION DETAILS WINDOW */}
                        <div
                            onClick={(e) => {
                                e.stopPropagation()
                            }}
                            className={styles.allCommentsContainer}
                        >

                            <h2>Add Education Details</h2>

                            <input onChange={handleEducationInputChange} name='school' className={styles.inputField} type="text" placeholder="Enter School" />
                            <input onChange={handleEducationInputChange} name='degree' className={styles.inputField} type="text" placeholder="Enter Degree" />
                            <input onChange={handleEducationInputChange} name='fieldOfStudy' className={styles.inputField} type="text" placeholder="Enter Field of Study" />

                            <div onClick={() => {
                                setUserProfile({ ...userProfile, education: [...userProfile.education, educationInputData] })
                                setIsEducationModalOpen(false)
                            }} className={styles.updateProfileBtn}> Add Education </div>

                        </div>

                    </div>

                }

            </DashboardLayout>
        </UserLayout>
    )
}


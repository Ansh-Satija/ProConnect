import { getAboutUser, getAllUsers } from '@/config/redux/action/authAction';
import { createPost, deletePost, getAllComments, getAllPosts, incrementPostLike, postComment } from '@/config/redux/action/postAction';
import DashboardLayout from '@/layout/DashbaordLayout';
import UserLayout from '@/layout/UserLayout';
import { useRouter } from 'next/router'
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import styles from "./index.module.css"
import { mediaUrl } from '@/config';
import { resetPostId } from '@/config/redux/reducer/postReducer';

function Dashboard() {

  const router = useRouter();
  const dispatch = useDispatch();
  const authState = useSelector((state) => state.auth)

  // The feed can render before its slice is available (for example, during a
  // client-side hydration/update). Keep the view safe until posts are loaded.
  const postState = useSelector((state) => state.postReducer);
  const posts = postState.posts;



  useEffect(() => {
    if (authState.isTokenThere) {
      dispatch(getAllPosts());
      dispatch(getAboutUser({
        token: localStorage.getItem("token")
      }))
    }

    if (!authState.all_profiles_fetched) {
      dispatch(getAllUsers())
    }
  }, [authState.isTokenThere])

  // LOCAL REACT STATE VARIABLES TO MAKE <TEXTAREA> AND <INPUT> CONTROLLED COMPONENTS
  const [postContent, setPostContent] = useState("");
  const [fileContent, setFileContent] = useState();

  // FOR COMMENT BOX INPUT
  const [commentText, setCommentText] = useState("");
  const [pendingLikePostIds, setPendingLikePostIds] = useState(() => new Set());

  const handleToggleLike = async (postId) => {
    if (pendingLikePostIds.has(postId)) return;

    setPendingLikePostIds((current) => new Set(current).add(postId));
    try {
      await dispatch(incrementPostLike({
        post_id: postId,
        token: localStorage.getItem("token")
      }));
      await dispatch(getAllPosts());
    } finally {
      setPendingLikePostIds((current) => {
        const next = new Set(current);
        next.delete(postId);
        return next;
      });
    }
  };

  const handleUpload = async () => {
    const resultAction = await dispatch(createPost({
      file: fileContent,
      body: postContent
    }));

    if (createPost.fulfilled.match(resultAction)) {
      setPostContent("");
      setFileContent(null);
      dispatch(getAllPosts());
    }

    dispatch(getAllPosts())
  }

  // TO SCROLL TO A SPECIFIC POST WHEN USER GETS NOTIFICATION THAT SOMEONE HAS LIKED/ COMMENTED ON THEIR POST (FOR LIKE/ COMMENT)
  const { postId } = router.query;
  useEffect(() => {

    if (!router.isReady || !postId || posts.length == 0) {
      return;
    }
    const postElement = document.getElementById(`post-${postId}`)

    if (postElement) {
      postElement.scrollIntoView({
        behavior: "smooth",
        block: "center"
      })
    }
  }, [router.isReady, postId, posts])

  return (
    <UserLayout>

      <DashboardLayout>
        <div className={styles.scrollComponent}>

          <div className={styles.wrapper}>

            {/* POST CONTAINER */}
            <div className={styles.createPostContainer}>

              {/* TO CREATE A NEW POST BY LOGGED-IN USER IN "SCROLL" PAGE */}
              {authState.userProfile?.userId?.profilePicture && (
                <img
                  className={styles.userProfile}
                  src={mediaUrl(authState.userProfile.userId.profilePicture)}
                  alt="Your profile"
                />
              )}
              <textarea onChange={(e) => setPostContent(e.target.value)} value={postContent}
                placeholder={"What's in your mind?"} className={styles.textAreaOfContent} name="" id="">

              </textarea>

              {/* THIS PLUS(+) ICON IS A LABEL FOR THE FILE INPUT FIELD, 
            SO WHEN IT IS CLICKED THE FILE INPUT FIELD IS TRIGGERED */}
              <label htmlFor="fileUpload">
                <div className={styles.Fab}>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                </div>
              </label>
              {/* INPUT FIELD TO ATTACH FILES IN POST */}
              <input onChange={(e) => setFileContent(e.target.files?.[0] ?? null)}
                type="file" hidden id='fileUpload' />

              {/* ACTION IS CALLED, POST GETS SAVED IN DB AND CREATED IN FRONTEND WHEN THIS BTN IS CLICKED */}
              {postContent.length > 0 &&
                <div onClick={handleUpload} className={styles.uploadButton}>Post</div>
              }

            </div>

            {/* FEED SECTION - SHOW ALL POSTS */}
            <div
              className={styles.postsContainer}
            >

              {posts.filter((post) => post?.userId).map((post) => {

                return (
                  <div key={post._id} id={`post-${post._id}`} className={styles.singleCard}>

                    <div className={styles.singleCard_profileContainer}>

                      {/* USER PROFILE PICTURE */}
                      <img className={styles.userProfile} src={mediaUrl(post.userId.profilePicture)} alt="" />
                      <div className={styles.singleCard_content}>

                        <div style={{
                          display: "flex",
                          gap: "1rem",
                          justifyContent: "space-between",
                        }}>

                          {/* WHEN YOU CLICK THE NAME OF AUTHOR ON HIS POST, IT OPENS THE PROFILE PAGE OF THAT USER */}
                          <p onClick={() => {
                            router.push(`/view_profile/${encodeURIComponent(post.userId.username)}`)
                          }}
                            className={styles.singleCard_Name}>{post.userId.name}</p>

                          {/* DELETE POST BUTTON SHOULD ONLY BE VISIBLE TO THE AUTHOR OF THAT POST */}
                          {
                            (post.userId._id === authState.userProfile?.userId?._id) &&
                            <div
                              onClick={async () => {
                                await dispatch(deletePost({
                                  post_id: post._id
                                })),
                                  await dispatch(getAllPosts())
                              }}
                              style={{ cursor: "pointer" }}>
                              <svg style={{ height: "1.2em", color: "red" }} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                              </svg>
                            </div>
                          }

                        </div>

                        <p style={{ color: "grey" }}>@{post.userId.username}</p>
                        <p style={{ paddingTop: "1rem" }}>{post.body}</p>

                        {post.media && (
                          /\.(mp4|webm|mov)$/i.test(post.media) ? (
                            <video
                              className={styles.singleCard_image}
                              src={mediaUrl(post.media)}
                              controls
                              style={{ maxWidth: "100%" }}
                            />
                          ) : /\.(jpe?g|png|gif|webp)$/i.test(post.media) ? (
                            <div className={styles.singleCard_image}>
                              <img
                                src={mediaUrl(post.media)}
                                alt="Uploaded post media"
                              />
                            </div>
                          ) : (
                            <a
                              href={mediaUrl(post.media)}
                              target="_blank"
                              rel="noreferrer"
                            >
                              View attachment
                            </a>
                          )
                        )}

                        {/* POST OPTIONS - LIKE, COMMENT, SHARE */}
                        <div className={styles.optionsContainer}>

                          {/* LIKE BUTTON */}
                          <div
                            role="button"
                            tabIndex={pendingLikePostIds.has(post._id) ? -1 : 0}
                            aria-label={post.likedByCurrentUser ? "Unlike post" : "Like post"}
                            aria-disabled={pendingLikePostIds.has(post._id)}
                            onKeyDown={(event) => {
                              if (event.key === "Enter" || event.key === " ") {
                                event.preventDefault();
                                handleToggleLike(post._id);
                              }
                            }}
                            onClick={() => handleToggleLike(post._id)}
                            className={`${styles.singleOption_optionsContainer} ${post.likedByCurrentUser ? styles.likedOption : ''} ${pendingLikePostIds.has(post._id) ? styles.likePending : ''}`}>
                            <svg xmlns="http://www.w3.org/2000/svg" fill={post.likedByCurrentUser ? "currentColor" : "none"} viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6.633 10.25c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 0 1 2.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 0 0 .322-1.672V2.75a.75.75 0 0 1 .75-.75 2.25 2.25 0 0 1 2.25 2.25c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282m0 0h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 0 1-2.649 7.521c-.388.482-.987.729-1.605.729H13.48c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 0 0-1.423-.23H5.904m10.598-9.75H14.25M5.904 18.5c.083.205.173.405.27.602.197.4-.078.898-.523.898h-.908c-.889 0-1.713-.518-1.972-1.368a12 12 0 0 1-.521-3.507c0-1.553.295-3.036.831-4.398C3.387 9.953 4.167 9.5 5 9.5h1.053c.472 0 .745.556.5.96a8.958 8.958 0 0 0-1.302 4.665c0 1.194.232 2.333.654 3.375Z" />
                            </svg>
                            <p>{post.likes}</p>
                          </div>

                          {/* COMMENT BUTTON */}
                          <div
                            onClick={ () => {
                               dispatch(getAllComments({ post_id: post._id }))
                               dispatch(getAllPosts())   // refreshes commentsCount on the feed
                            }}
                            className={styles.singleOption_optionsContainer}>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.501 48.172 48.172 0 0 0 3.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" />
                            </svg>
                            <p>{post.commentsCount ?? 0}</p>
                          </div>

                          {/* SHARE BUTTON - TO SHARE POST ON TWITTER */}
                          <div
                            onClick={() => {
                              const text = encodeURIComponent(post.body)
                              // HERE ADD THE LINK OF WEBSITE AFTER DEPLOYING
                              const url = encodeURIComponent("Testlink9898.com")

                              const twitterURL = `https://twitter.com/intent/tweet?text=${text}&url=${url}`;

                              window.open(twitterURL, "_blank")
                            }}
                            className={styles.singleOption_optionsContainer}>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.933-2.185 2.25 2.25 0 0 0-3.933 2.185Z" />
                            </svg>

                          </div>

                        </div>

                      </div>

                    </div>

                  </div>
                )

              })}

            </div>
          </div>


        </div>

        {/* COMMENTS WINDOW POPUP - ONLY APPEARS WHEN WE CLICK COMMENT BTN */}
        {
          postState.postId !== "" &&
          <div

            // TO REMOVE THE POPUP COMMENT WINDOW FROM SCREEN WHEN USER CLICKS ELSEWHERE (IN BACKGROUND) OTHER THAN COMMENT WINDOW 
            onClick={() => {
              dispatch(resetPostId())
            }}
            className={styles.commentsContainer}
          >

            {/* COMMENT BOX */}
            <div
              onClick={(e) => {
                e.stopPropagation()
              }}
              className={styles.allCommentsContainer}
            >
              {/* IF NO COMMENTS FOR A POST */}
              {postState.comments.length === 0 && <h2>No Comments</h2>}

              {/* DISPLAY ALL COMMENTS INSIDE THE COMMENT BOX */}
              {postState.comments.length !== 0 &&
                <div>

                  {postState.comments.map((comment, index) => {
                    // FOR EACH COMMENT - 
                    return (
                      <div className={styles.singleComment} key={comment._id}>

                        <div className={styles.singleComment_profileContainer}>

                          {/* Add a commenter's profile image here if needed. */}

                          <div>
                            <p style={{ fontWeight: "bold", fontSize: "1rem" }}>{comment.userId.name}</p>
                            <p> @{comment.userId.username}</p>
                          </div>

                        </div>

                        <p>
                          {comment.body}
                        </p>

                      </div>
                    )
                  })}

                </div>
              }

              {/* TO WRITE NEW COMMENT */}
              <div className={styles.postCommentContainer}>

                {/* INPUT FIELD TO WRITE COMMENT */}
                <input
                  type="text" value={commentText}
                  onChange={(e) => { setCommentText(e.target.value) }}
                  placeholder="Add a comment..."
                  style={{ fontSize: "14px" }}
                />

                {/* SUBMIT COMMENT BUTTON */}
                <div
                  onClick={async () => {
                    const resultAction = await dispatch(postComment({
                      post_id: postState.postId,
                      body: commentText
                    }))
                    if (postComment.fulfilled.match(resultAction)) {
                      setCommentText("")
                    }
                    await dispatch(getAllComments({
                      post_id: postState.postId,
                    }))
                    await dispatch(getAllPosts())   // refreshes commentsCount on the feed
                  }}
                  className={styles.postCommentContainer_commentBtn}
                >
                  <p>Comment</p>
                </div>

              </div>

            </div>


          </div>
        }
      </DashboardLayout>

    </UserLayout>
  )
}

export default Dashboard

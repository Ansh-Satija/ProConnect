import {Router} from "express"

import { activeCheck, createPost, getAllPosts, getPostsByUsername, deletePost, commentPost, getCommentsByPost, deleteComment,
     incrementLikes } from "../controllers/posts.controller.js";
     
// import {getMyComments} from "../controllers/posts.controller.js" (FOR FUTURE SCOPE)

// USING CLOUDINARY STORAGE FOR STORING FILES/ UPLOADS
import { uploadPostMedia } from "../middlewares/upload.middleware.js";

// IMPORT AUTH MIDDLEWARE FUNCTION
import {authenticateUser} from "../middlewares/auth.middleware.js"

const router = Router();



// <----- POSTS ROUTES -----> 
// TEST ROUTE
router.route('/').get(activeCheck);

// CREATE NEW POST 
router.route("/post").post(uploadPostMedia.single('media'), authenticateUser, createPost);

// GET ALL POSTS
router.route("/posts").get(authenticateUser, getAllPosts);
router.route("/user_posts").get(authenticateUser, getPostsByUsername);

// DELETE A POST (ONLY THE AUTHOR CAN DELETE OWN POST)
router.route("/delete_post").delete(authenticateUser, deletePost);

// <--- ROUTES FOR CRUD OPERATIONS ON COMMENTS UNDER A POST --->

// TO CREATE A COMMENT
router.route("/comment").post(authenticateUser, commentPost);

// TO GET ALL COMMENTS UNDER A POST 
router.route("/get_comments").get(getCommentsByPost);

// TO DELETE A COMMENT
router.route("/delete_comment").delete(authenticateUser, deleteComment)

// TO INCREMENT NUMBER OF LIKES OF A POST
router.route("/increment_post_like").post(authenticateUser, incrementLikes)

// // TO GET ALL COMMENTS CREATED BY CURR LOGGED-IN USER ACROSS ALL POSTS (FUTURE SCOPE)
// router.route("/get_my_comments").get(authenticateUser, getMyComments)


export default router

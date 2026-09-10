import {Router} from "express"
import { activeCheck, createPost, getAllPosts, deletePost, commentPost, getCommentsByPost, deleteComment,
     incrementLikes } from "../controllers/posts.controller.js";
     
// import {getMyComments} from "../controllers/posts.controller.js" (FOR FUTURE SCOPE)

import multer from "multer"
import { diskStorage } from "multer";

const router = Router();

// CREATE MULTER STORAGE TO BE USED TO HANDLE MEDIA (PHOTOS, VIDEOS) UPLOADED IN POSTS BY THE USER
const storage = multer.diskStorage({
    destination: (req,file,cb) => {
        cb(null, 'uploads/')
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname)
    }
});

const upload = multer({storage: storage})

// <----- POSTS ROUTES -----> 
// TEST ROUTE
router.route('/').get(activeCheck);

// CREATE NEW POST 
router.route("/post").post(upload.single('media'), createPost);

// GET ALL POSTS
router.route("/posts").get(getAllPosts);

// DELETE A POST (ONLY THE AUTHOR CAN DELETE OWN POST)
router.route("/delete_post").delete(deletePost);

// <--- ROUTES FOR CRUD OPERATIONS ON COMMENTS UNDER A POST --->

// TO CREATE A COMMENT
router.route("/comment").post(commentPost);

// TO GET ALL COMMENTS UNDER A POST 
router.route("/get_comments").get(getCommentsByPost);

// TO DELETE A COMMENT
router.route("/delete_comment").delete(deleteComment)

// TO INCREMENT NUMBER OF LIKES OF A POST
router.route("/increment_post_like").post(incrementLikes)

// // TO GET ALL COMMENTS CREATED BY CURR LOGGED-IN USER ACROSS ALL POSTS (FUTURE SCOPE)
// router.route("/get_my_comments").get(getMyComments)


export default router
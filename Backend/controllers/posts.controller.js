// IMPORT ALL THE REQUIRED MODELS FROM THESE FILES TO BE USED IN THIS FILE
import User from "../models/user.model.js"
import Profile from "../models/profile.models.js"
import Post from "../models/posts.model.js"
import Comment from "../models/comments.model.js"

// TEST ROUTE
export const activeCheck = async (req,res) => {
    return res.json({message: "RUNNING"})
}

// TO CREATE A NEW POST 
export const createPost = async (req,res) => {

    try{
        const user = req.user;

        const post = new Post({
            userId: user._id,
            body: req.body.body,
            media: (req.file != undefined) ? req.file.filename : "",
            fileType: (req.file != undefined) ? req.file.mimetype.split("/")[1] : ""
        });

        await post.save();
        return res.status(200).json({message: "Post Created"})
    }

    catch(err){
        res.status(500).json({message: err.message})
    }

}

// TO GET ALL POSTS (ALL DOCS IN POSTS COLLECTION)
export const getAllPosts = async (req,res) => {

    try{
        const posts = await Post.find().populate('userId', 'name username profilePicture');

        return res.json({posts});   
    }

    catch(err){
        res.status(500).json({message: err.message});
    }
}

// TO DELETE A POST (ONLY THE AUTHOR OF THE POST CAN DELETE OWN POST, NOBODY ELSE)
export const deletePost = async (req,res) => {
    const { post_id } = req.body;

    try{
        // FIND CURRENTLY LOGGED IN USER'S DOC IN DB TO GET HIS USERID
        const user = req.user

        // FIND POST'S DOC (STORING THE CURRENT POST'S BODY AND AUTHOR DETAILS) IN DB
        const post = await Post.findOne({_id: post_id})

        if(!post){
            return res.status(404).json({message: "Post Not Found"})
        }

        // AUTHORIZATION - ONLY THE POST'S AUTHOR CAN DELETE HIS OWN POST
        // CHECK IF THE USER TRYING TO DELETE THE POST IS AUTHOR OF THE POST OR NOT
        if(post.userId.toString() !== user._id.toString()){
            return res.status(401).json({message: "Unauthorized"})
        }

        await Post.deleteOne({_id: post_id})

        return res.json({message: "Post Deleted"})
    }

    catch(err){
        return res.status(500).json({message: err.message})
    }

}

// <--- CRUD FUNCTIONALITY FOR COMMENTS --->

// CREATE A COMMENT UNDER A POST
export const commentPost = async (req,res) => {
    const { post_id, commentBody} = req.body;

    try{
        const user = req.user;

        const post = await Post.findOne({_id: post_id});

        if(!post){
            res.status(404).json({message: "Post Not Found"});
        }

        const comment = new Comment({
            userId: user._id,
            postId: post._id,
            body: commentBody
        });

        await comment.save();

        res.status(200).json({message: "New Comment Added"})

    }

    catch(err){
        res.status(500).json({message: err.message});
    }
}

// TO GET/DISPLAY ALL COMMENTS UNDER A SPECIFIC POST
export const getCommentsByPost = async (req,res) => {
    const {post_id} = req.query; //NOT REQ.BODY AS IT IS A GET REQUEST NOT POST REQUEST

    try{
        const post = await Post.findOne({"_id": post_id});

        if(!post){
            return res.status(404).json({message: "Post Not Found"});
        }

        const comments = await Comment
        .find({postId: post_id})
        .populate("userId", "name username profilePicture");

        res.json(comments.reverse())
    }

    catch(err){
        res.status(500).json({message: err.message})
    }
}

// TO DELETE A COMMENT (ONLY AUTHOR OF COMMENT CAN DELETE OWN COMMENT)
export const deleteComment = async (req,res) => {
    const {comment_id} = req.body;

    try{
        const user = req.user;

        const comment = await Comment.findOne({_id: comment_id})

        if(!comment){
            return res.status(404).json({message: "Comment Not Found"})
        }

        // AUTHORIZATION: Only the comment author can delete it
        if(comment.userId.toString() !== user._id.toString()){
            return res.status(401).json({message: "Unauthorized"})
        }

        await Comment.deleteOne({_id: comment_id})

        return res.json({message: "Comment Deleted"})

    }
    catch(err){
        res.status(500).json({message: err.message})
    }
}

// TO INCREMENT NUMBER OF LIKES OF A POST
export const incrementLikes = async (req,res) => {

    const {post_id} = req.body;

    try{
        const post = await Post.findOne({_id: post_id});

        if(!post){
            return res.status(404).json({message: "Post Not Found"})
        }

        // IF POST FOUND
        post.likes = post.likes + 1;

        await post.save();

        return res.json({message: "Likes Incremented"})
    }
    catch(err){
        res.status(500).json({message: err.message})
    }
}



// // TO GET ALL COMMENTS CREATED BY CURR LOGGED-IN USER ACROSS ALL POSTS (NOT IMPLEMENTED NOW (FUTURE SCOPE))
// export const getMyComments = async (req,res) => {

//     try{
//         const user = req.user;

//         const comments = await Comment.find({userId: user._id}).populate("postId", "body");

//         return res.json({comments});
//     }
//     catch(err){
//         res.status(500).json({message: err.message})
//     }
// }
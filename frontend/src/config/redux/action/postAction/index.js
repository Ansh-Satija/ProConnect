import { clientServer } from "@/config";
import { createAsyncThunk } from "@reduxjs/toolkit";


// ASYNC THUNK ACTION CREATORS TO HANDLE THE FOLLOWING ACTIONS - 
export const getAllPosts = createAsyncThunk(
    "post/getAllPosts",

    async (_, thunkAPI) => {

        try {

            const response = await clientServer.get("/posts")

            return thunkAPI.fulfillWithValue(response.data);
        }
        catch (err) {
            return thunkAPI.rejectWithValue(err.response.data)
        }
    }
)

export const createPost = createAsyncThunk(
    "post/createPost",

    async (userData, thunkAPI) => {
        const { file, body } = userData;

        try {
            const formData = new FormData();

            formData.append('token', localStorage.getItem("token"))
            formData.append('body', body)
            formData.append('media', file)

            const response = await clientServer.post("/post", formData, {
                headers: {
                    "Content-Type": "multipart/form-data"
                }
            });

            if (response.status === 200) {
                return thunkAPI.fulfillWithValue("Post Uploaded Successfully!")
            }
            else {
                return thunkAPI.rejectWithValue("Unable to Upload Post")
            }
        }
        catch (err) {
            return thunkAPI.rejectWithValue(err.response.data)
        }
    }
)

export const deletePost = createAsyncThunk(
    "post/deletePost",
    async (post_id, thunkAPI) => {

        try {
            const response = await clientServer.delete("/delete_post", {
                data: {
                    token: localStorage.getItem("token"),
                    post_id: post_id.post_id
                }
            });

            return thunkAPI.fulfillWithValue(response.data)
        }
        catch (err) {
            return thunkAPI.rejectWithValue("Something Went Wrong")
        }
    }
)

export const incrementPostLike = createAsyncThunk(
    "post/incrementLike",
    async (post, thunkAPI) => {

        try {
            const response = await clientServer.post("/increment_post_like", 
                {
                    post_id: post.post_id,
                    token: post.token
                }
            );
            return thunkAPI.fulfillWithValue(response.data);
        }
        catch(err){
            return thunkAPI.rejectWithValue(err.response.data.message)
        }
    }
)

export const getAllComments = createAsyncThunk(
    "post/getAllComments",
    async (postData, thunkAPI) => {

        try{
            const response = await clientServer.get("/get_comments", {
                // IT IS A GET REQUEST SO CANNOT SEND DATA VIA REQ.BODY
                // THAT IS WHY USING PARAMS
                params: {
                    post_id: postData.post_id
                }
            });

            return thunkAPI.fulfillWithValue({
                comments: response.data,
                post_id: postData.post_id
            })
        }
        catch(err){
            return thunkAPI.rejectWithValue("Something Went Wrong");
        }
    }
)

export const postComment = createAsyncThunk(
    "post/postComment", 
    async (commentData, thunkAPI) => {

        try{
            console.log({
                post_id: commentData.post_id,
                body: commentData.body
            })

            const response = await clientServer.post("/comment", {
                token: localStorage.getItem("token"),
                post_id: commentData.post_id,
                commentBody: commentData.body
            })

            return thunkAPI.fulfillWithValue(response.data)
        }
        catch(err){
            return thunkAPI.rejectWithValue("Something went wrong")
        }
    }
)
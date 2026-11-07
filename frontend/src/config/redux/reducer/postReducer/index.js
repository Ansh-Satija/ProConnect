import { createSlice } from "@reduxjs/toolkit"
import { getAllComments, getAllPosts, incrementPostLike, deletePost } from "../../action/postAction"

const initialState = {
    posts: [],
    isError: false,
    postFetched: false,
    isLoading: false,
    loggedIn: false,
    message: "",
    comments: [],
    postId: "",
    nextCursor: null
}

const postSlice = createSlice({
    name: "post",
    initialState,

    reducers: {
        reset: () => initialState,
        resetPostId: (state) => {
            state.postId = "";
        },
    },

    extraReducers: (builder) => {
        builder
            .addCase(getAllPosts.pending, (state) => {
                state.isLoading = true;
                state.message = "Fetching all the posts..."
            })
            .addCase(getAllPosts.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isError = false;
                state.postFetched = true;

                const { posts, nextCursor } = action.payload;
                // cursor was passed → "load more" → append. No cursor → first page → replace.
                state.posts = action.meta.arg?.cursor ? [...state.posts, ...posts] : posts;
                state.nextCursor = nextCursor;
            })
            .addCase(getAllPosts.rejected, (state, action) => {
                state.isLoading = false,
                    state.isError = true,
                    state.message = action.payload
            })
            .addCase(getAllComments.fulfilled, (state, action) => {
                state.postId = action.payload.post_id;
                state.comments = action.payload.comments;
                const post = state.posts.find(p => p._id === action.payload.post_id);
                if (post) post.commentsCount = action.payload.comments.length;

            })
            .addCase(incrementPostLike.fulfilled, (state, action) => {
                const post = state.posts.find(p => p._id === action.meta.arg.post_id);
                if (!post) return;
                post.likedByCurrentUser = action.payload.liked;       // backend returns { liked: true/false }
                post.likes = Math.max(0, post.likes + (action.payload.liked ? 1 : -1));
            })
            .addCase(deletePost.fulfilled, (state, action) => {
                state.posts = state.posts.filter(p => p._id !== action.meta.arg.post_id);
            })

    }
})

export const { resetPostId } = postSlice.actions;

export default postSlice.reducer;

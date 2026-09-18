import { createSlice } from "@reduxjs/toolkit";
import { getAboutUser, getAllUsers, getConnectionRequest, getMyConnectionRequests, getSuggestedUsers, loginUser, registerUser, searchUsers } from "../../action/authAction";

// ALL STATE VARIABLES BEING USED IN THE PROJECT FOR AUTHENTICATION, STORED IN REDUX STORE
const initialState = {
    user: undefined,
    isError: false,
    isSuccess: false,
    isLoading: false,
    loggedIn: false,
    message: "",
    isTokenThere: false,
    profileFetched: false,
    connections: [], // STORES LIST OF ALL USERS WHOM CURRENT LOGGED IN USER SENT CONNECTION REQUEST
    connectionRequest: [], // LIST OF ALL USER WHO SENT REQUEST TO CURRENT LOGGED IN USER
    all_users: [],
    all_profiles_fetched: false,
    suggestedUsers: [],
    searchResults: []
};

const authSlice = createSlice({
    name: "auth",
    initialState,

    reducers: {
        reset: () => initialState,

        handleLoginUser: (state) => {
            state.message = "hello";
        },

        emptyMessage: (state) => {
            state.message = "";
        },

        setTokenIsThere: (state) => {
            state.isTokenThere = true;
        },

        setTokenIsNotThere: (state) => {
            state.isTokenThere = false;
        }
    },

    extraReducers: (builder) => {
        builder
            .addCase(loginUser.pending, (state) => {
                state.isLoading = true;
                state.message = "Logging You In...";
            })

            .addCase(loginUser.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isError = false;
                state.isSuccess = true;
                state.loggedIn = true;
                state.message = "Login Is Successful";
            })

            .addCase(loginUser.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
            })

            .addCase(registerUser.pending, (state) => {
                state.isLoading = true;
                state.message = "Registering You...";
            })

            .addCase(registerUser.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isError = false;
                state.isSuccess = true;
                // Registration does not return or store an auth token. Keep the
                // user on /login so they can sign in and receive one.
                state.loggedIn = false;
                state.message = {
                    message: "Registration is Successful, Please Login!"
                }
            })

            .addCase(registerUser.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
            })

            .addCase(getAboutUser.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isError = false;
                state.profileFetched = true;
                state.loggedIn = true;
                state.userProfile = action.payload.userProfile;
            })

            // TO GET DATA OF ALL USERS TO BE DISPLAYED IN /DISCOVER PAGE AND TOP PROFILE SECTION IN ALL PAGES USING DASHBOARDLAYOUT 
            .addCase(getAllUsers.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isError = false;
                state.all_profiles_fetched = true;
                state.all_users = action.payload.profiles
            })

            // FOR CONNECTION REQUEST FUNCTIONALITY

            // 'CONNECTIONS' ARRAY HAS LIST OF ALL USERS WHOME LOGGED IN USER SENT REQUEST TO 
            .addCase(getConnectionRequest.fulfilled, (state, action) => {
                state.connections = action.payload
            })

            .addCase(getConnectionRequest.rejected, (state, action) => {
                state.message = action.payload
            })

            // 'CONNECTIONREQUEST' ARRAY HAS LIST OF ALL USER WHO SENT REQUEST TO LOGGED IN USER
            .addCase(getMyConnectionRequests.fulfilled, (state, action) => {
                state.connectionRequest = action.payload
            })

            .addCase(getMyConnectionRequests.rejected, (state, action) => {
                state.message = action.payload
            })

            // STORE SUGGESTED USERS DATA IN REDUX STORE (FOR BUILD YOUR NETWORK/ PEOPLE YOU MAY KNOW SECTION IN RIGHT
            // SIDEBAR OF DASHBOARDLAYOUT)
            .addCase(getSuggestedUsers.fulfilled, (state, action) => {
                state.suggestedUsers = action.payload
            })

            // FOR SEARCH BAR: IN /DISCOVER PAGE
            .addCase(searchUsers.fulfilled, (state, action) => {
                state.searchResults = action.payload;
            })
    }
});

export const { reset, handleLoginUser, emptyMessage, setTokenIsThere, setTokenIsNotThere } = authSlice.actions;

export default authSlice.reducer;

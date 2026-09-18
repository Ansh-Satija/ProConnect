import { clientServer } from "@/config";
import { createAsyncThunk } from "@reduxjs/toolkit";

// ASYNC THUNK ACTION CREATOR FOR LOGINUSER API CALL (MAKES CALL FROM FRONTEND->BACKEND, THEN UPDATES REDUX STORE STATE WITH RESPONSE FROM BACKEND)
export const loginUser = createAsyncThunk(
    "user/login",
    async (user, thunkAPI) => {

        try{
            const response = await clientServer.post('/login', {
                email: user.email,
                password: user.password
            });

            // IF SUCCESSFUL LOGIN AND SERVER GENERATED A TOKEN, STORE IT
            if(response.data.token){
                localStorage.setItem("token", response.data.token)
            }
            else{
                return thunkAPI.rejectWithValue({
                    message: "Token Not Provided"
                })
            }

            return thunkAPI.fulfillWithValue(response.data.token)

        }
        catch(err){
            return thunkAPI.rejectWithValue(err.response.data)
        }
    }
)

// ASYNC THUNK ACTION CREATOR EXECUTED WHEN USER FILLS THE FORM TO SIGN UP FROM FRONTEND
export const registerUser = createAsyncThunk(
    "user/register",
    async (user ,thunkAPI) => {
        
        try {
            const request = await clientServer.post("/register", {
                username: user.username, 
                password: user.password,
                email: user.email,
                name: user.name
            });
            return true;
        }
        catch(err){
            return thunkAPI.rejectWithValue(err.response.data)
        }
    }
)

// ASYNC THUNK ACTION CREATOR TO FETCH CURRENT (LOGGED IN) USER'S PROFILE DETAILS FROM DB
export const getAboutUser = createAsyncThunk(
    "user/getAboutUser",
    async(user, thunkAPI) => {
        
        try{

            const response = await clientServer.get("/get_user_and_profile", {
                params: {
                    token: user.token   
                }
            });

            return thunkAPI.fulfillWithValue(response.data)

        }
        catch(err){
            return thunkAPI.rejectWithValue(err.response.data)
        }
    }
)

// ASYNC THUNK ACTION CREATOR TO FETCH ALL USER PROFILES FOR DISCOVER PAGE
export const getAllUsers = createAsyncThunk(
    "user/getAllUsers",  
    async (_, thunkAPI) => {

        try{
            const response = await clientServer.get("/user/get_all_users");

            return thunkAPI.fulfillWithValue(response.data)
        }
        catch(err){
            return thunkAPI.rejectWithValue(err.response.data)
        }
    }
)

// TO SEND A CONNECTION REQUEST FROM LOGGED IN USER TO THE USER WHOSE
//  PROFILE PAGE LOGGED IN USER IS VIEWING
export const sendConnectionRequest = createAsyncThunk(
    "user/sendConnectionRequest",
    async (user, thunkAPI) => {

        try{
            const response = await clientServer.post("/user/send_connection_request", {
                token: user.token, //ID OF SENDER OF REQUEST
                connectionId: user.user_id //ID OF RECEIVER OF REQUEST
            });

            thunkAPI.dispatch(getConnectionRequest({token: user.token}))

            return thunkAPI.fulfillWithValue(response.data)
            
        }
        catch(err){
            return thunkAPI.rejectWithValue(err.response.data)
        }
    }
)

// TO GET LIST OF ALL THE CONNECTION REQUESTS SENT BY CURRENT LOGGED IN USER TO OTHER USERS
export const getConnectionRequest = createAsyncThunk(
    "user/getConnectionRequest",
    async (user, thunkAPI) => {
        try{
            const response = await clientServer.get("/user/get_connection_requests", {
                // PARAMS BECAUSE IT IS A GET REQUEST
                params: {
                    token: user.token
                }
            });

            return thunkAPI.fulfillWithValue(response.data.connections);

        }
        catch(err){
            return thunkAPI.rejectWithValue(err.response.data.message)
        }
    }
)

// TO GET LIST OF ALL CONNECTION REQUEST RECEIVED BY LOGGED IN USER (SENT BY OTHER USERS)
export const getMyConnectionRequests = createAsyncThunk(
    "user/getMyConnectionRequests",
    async (user, thunkAPI) => {
        try{
            const response = await clientServer.get("/user/user_connection_request", {
                params: {
                    token: user.token,
                }
            });
            return thunkAPI.fulfillWithValue(response.data)

        }
        catch(err){
            return thunkAPI.rejectWithValue(err.response.data.message)
        }
    }
)

// TO ACCEPT OR REJECT A CONNECTION REQUEST
export const acceptConnection = createAsyncThunk(
    "user/acceptConnection",
    async (user, thunkAPI) => {

        try{
            const response = await clientServer.post("/user/accept_connection_request", {
                token: user.token,
                requestId: user.connectionId,
                action_type: user.action
            });

            thunkAPI.dispatch(getConnectionRequest({token: user.token}))
            thunkAPI.dispatch(getMyConnectionRequests({token: user.token}))
            return thunkAPI.fulfillWithValue(response.data)
        }
        catch(err){
            return thunkAPI.rejectWithValue(err.response.data.message)
        }
    }
)


// TO GET LIST OF ALL SUGGESTED USERS FOR "BUILD YOUR NETWORK/ PEOPLE YOU MAY KNOW" SECTION IN RIGHT SIDEBAR OF DASHBOARDLAYOUT
export const getSuggestedUsers = createAsyncThunk(
    "user/getSuggestedUsers",
    async (user, thunkAPI) => {

        try{
            const response = await clientServer.get("/user/get_suggested_users", {
                params: {
                    token: user.token
                }
            })

            return thunkAPI.fulfillWithValue(response.data.users)
        }
        catch(err){
            return thunkAPI.rejectWithValue(err.response?.data)
        }
    }
)

// FOR SEARCH BAR: TO FETCH DETAILS OF SEARCHED USERS FROM DB
export const searchUsers = createAsyncThunk(
    "user/searchUsers",
    async (query, thunkAPI) => {

        try{
            const response = await clientServer.get("/user/search_users", {
                params: {
                    query
                }
            });

            return thunkAPI.fulfillWithValue(response.data.users)
        }
        catch(err){
            return thunkAPI.rejectWithValue(err.response?.data?.message)
        }

    }
)
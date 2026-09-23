import { clientServer } from "@/config";
import { createAsyncThunk } from "@reduxjs/toolkit";

// ASYNC THUNK ACTION CREATOR TO GET ALL NOTIFICATIONS OF CURRENT LOGGED-IN USER - 
export const getNotifications = createAsyncThunk(
    "notification/getNotifications",
    async (user, thunkAPI) => {

        try{
            const response = await clientServer.get("/notifications", {
                params: {
                    token: user.token
                }
            });

            return thunkAPI.fulfillWithValue(response.data.notifications);
        }
        catch(err){
            return thunkAPI.rejectWithValue(err.response?.data?.message);
        }
    }
)

// TO MARK A SINGLE NOTIFICATION AS READ
export const markNotificationAsRead = createAsyncThunk(
    "notification/markNotificationAsRead",
    async (notification, thunkAPI) => {

        try {
            const response = await clientServer.patch(`/notifications/${notification.notificationId}/read`, null, {
                params: {
                    token: notification.token
                }
            });

            // FETCH FRESH NOTIFICATIONS FROM BACKEND SO THAT NOTIFICATION THAT YOU JUST MARKED AS "READ" DISAPPEARS FROM UI
            thunkAPI.dispatch(getNotifications({
                token: notification.token
            }))

            return thunkAPI.fulfillWithValue(response.data);
        }
        catch(err){
            return thunkAPI.rejectWithValue(err.response?.data?.message)
        }
    }
)

// TO MARK ALL NOTIFICATIONS AS READ
export const markAllNotificationsAsRead = createAsyncThunk(
    "notification/markAllNotificationsAsRead",
    async (user, thunkAPI) => {

        try{
            const response = await clientServer.patch("/notifications/read-all", null, {
                params: {
                    token: user.token
                }
            });

            // REFETCH FRESH NOTIFICATIONS FROM BACKEND (NOW THEY ALL HAVE ISREAD VALUE = TRUE
            //  AS USER CLICKED ON BTN = MARK ALL AS READ)
            thunkAPI.dispatch(getNotifications({
                token: user.token
            }))

            return thunkAPI.fulfillWithValue(response.data)
        }
        catch(err){
            return thunkAPI.rejectWithValue(err.response?.data?.message)
        }
    }
)

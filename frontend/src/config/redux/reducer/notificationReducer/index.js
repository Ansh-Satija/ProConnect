import { createSlice } from "@reduxjs/toolkit";
import { getNotifications, markNotificationAsRead, markAllNotificationsAsRead } from "../../action/notificationAction";

const initialState = {
    notifications: [],
    isError: false,
    isSuccess: false,
    isLoading: false,
    message: ""
};

const notificationSlice = createSlice({
    name: "notification",
    initialState,

    reducers: {
        reset: () => initialState
    },

    extraReducers: (builder) => {
        builder

        // GET ALL NOTIFICATIONS RECEIVED BY CURR LOGGED-IN USER
        .addCase(getNotifications.pending, (state) => {
            state.isLoading = true;
            state.isError = false;
        })
        .addCase(getNotifications.fulfilled, (state, action) => {
            state.isLoading = false;
            state.isError = false;
            state.isSuccess = true;
            state.notifications = action.payload
        })
        .addCase(getNotifications.rejected, (state, action) => {
            state.isLoading = false;
            state.isError = true;
            state.message = action.payload
        })


        // MARK A SINGLE NOTIFICATION AS READ
        .addCase(markNotificationAsRead.fulfilled, (state, action) => {
            state.isSuccess = true;
            state.message = action.payload.message;
        })
        .addCase(markNotificationAsRead.rejected, (state, action) => {
            state.isError = true;
            state.message = action.payload
        })

        // MARK ALL NOTIFICAITONS AS READ AT ONCE
        .addCase(markAllNotificationsAsRead.fulfilled, (state, action) => {
            state.isSuccess = true;
            state.message = action.payload.message;
        })
        .addCase(markAllNotificationsAsRead.rejected, (state, action) => {
            state.isError = true;
            state.message = action.payload
        })
    }
});

export const {reset} = notificationSlice.actions;
export default notificationSlice.reducer;
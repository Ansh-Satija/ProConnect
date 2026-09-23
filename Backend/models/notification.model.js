import mongoose, { mongo } from "mongoose"

const NotificationSchema = new mongoose.Schema(
    {
        recipient: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        type: {  // WHAT IS THE TYPE OF NOTIFICATION (FOR WHAT ACTION) - FOR REQUEST, LIKE UPDATE ETC.
            type: String,
            enum: [
                "CONNECTION_REQUEST",
                "CONNECTION_ACCEPTED",
                "LIKE",
                "COMMENT"
            ],
            required: true
        },

        post: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Post",
            default: null
        },

        isRead: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true
    }
);

const Notification = mongoose.model("Notification", NotificationSchema)
export default Notification
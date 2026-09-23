import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import mongoose from "mongoose"


// BASIC REQUIRED CODE 
dotenv.config();

const app = express();

app.use(cors());
app.use(express.json())

//MIDDLEWARE TO USE ROUTES FROM ROUTER OBJECT OF POSTS.ROUTES.JS
import postRoutes from "./routes/posts.routes.js"
app.use(postRoutes)

//MIDDLEWARE TO USE ROUTES FROM ROUTER OBJECT OF USER.ROUTES.JS
import userRoutes from "./routes/user.routes.js"
app.use(userRoutes)

//MIDDLEWARE TO USE ROUTES FROM ROUTER OBJECT OF NOTIFICATION.ROUTES.JS
import notificationRoutes from "./routes/notification.routes.js"
app.use(notificationRoutes)


// EXPRESS MIDDLEWARE THAT TELLS YOUR SERVER TO MAKE THE FILES INSIDE UPLOADS FOLDER PUBLICLY ACCESSIBLE
app.use(express.static("uploads"))


//CONNECT TO DB AND START SERVER 
const start = async () => {
    const connectDB = await mongoose.connect("mongodb+srv://arnavansh31_db_user:IyIhndKUcOKqznQm@linkedin-clone.6nnmrwn.mongodb.net/?appName=linkedIn-clone")

    app.listen(8080, () => {
        console.log('Server is running on Port 8080');
    })
}
start();
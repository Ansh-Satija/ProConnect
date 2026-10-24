import { Router } from "express"

// IMPORT ALL CONTROLLER FUNCTIONS FROM USER.CONTROLLER.JS BEFORE USING THEM AS ROUTE HANDLERS IN THIS FILE
import { register, login, uploadProfilePicture, updateUserProfile, getUserAndProfile, updateProfileData, getAllUserProfiles,
     downloadProfile, sendConnectionRequest, getMyConnectionRequests, whatAreMyConnections, acceptConnectionRequest,
     getUserProfileAndUserBasedOnUsername, 
     getSuggestedUsers, searchUsers} from "../controllers/user.controller.js";

// USING CLOUDINARY STORAGE FOR STORING FILES/ UPLOADS
import { uploadPostMedia } from "../middlewares/upload.middleware.js";

// IMPORT AUTH MIDDLEWARE FUNCTION - 
import {authenticateUser} from "../middlewares/auth.middleware.js";

const router = Router();



// DEFINES API ENDPOINT(OR ROUTE) TO UPDATE USER'S PROFILE PICTURE
router.route("/update_profile_picture")
    .post(uploadPostMedia.single('profile_picture'),
    authenticateUser, 
    uploadProfilePicture
);


router.route('/register').post(register);
router.route('/login').post(login);

// API ENDPOINT(OR ROUTE) TO UPDATE USERNAME AND EMAIL
router.route('/user_update').post(authenticateUser, updateUserProfile);

// TO FETCH DETAILS FROM USER AND PROFILE DOCS IN DB FOR A USER
router.route("/get_user_and_profile").get(authenticateUser, getUserAndProfile)

// TO UPDATE PROFILE DOC'S DETAILS (LIKE BIO, EDUCATION, WORK ETC.) FOR A USER
router.route("/update_profile_data").post(authenticateUser, updateProfileData)

// GET ALL USER PROFILES (DOCS) CREATED IN DB
router.route("/user/get_all_users").get(authenticateUser, getAllUserProfiles)

// DOWNLOAD USER'S PROFILE DATA AS A PDF (RESUME)
router.route("/user/download_resume").get(authenticateUser, downloadProfile)


// CONNECTION REQUEST FUNCTIONALITY :- 
// 1. TO SEND A CONNECTION REQUEST FROM LOGGED IN USER TO ANOTHER USER 
router.route("/user/send_connection_request").post(authenticateUser, sendConnectionRequest)
// 2. TO DISPLAY ALL CONNECTION REQUESTS SENT BY LOGGED IN USER TO OTHER USERS
router.route("/user/get_connection_requests").get(authenticateUser, getMyConnectionRequests)
// 3. TO DISPLAY ALL CONNECTION REQUESTS RECEIVED BY LOGGED IN USER
router.route("/user/user_connection_request").get(authenticateUser, whatAreMyConnections)
// 4. TO ACCEPT OR REJECT A CONNECTION REQUEST
router.route("/user/accept_connection_request").post(authenticateUser, acceptConnectionRequest)


// FOR "/DISCOVER" PAGE - TO FETCH USER PROFILE DETAILS FROM DB USING USERNAME
router.route("/user/get_profile_based_on_username").get(getUserProfileAndUserBasedOnUsername)

// GET SUGGESTED USERS ON THE RIGHT SIDEBAR OF DASHBOARDLAYOUT 
router.route("/user/get_suggested_users").get(authenticateUser, getSuggestedUsers)

// FOR SEARCH BAR: TO SEARCH A USER BY NAME/ USERNAME
router.route("/user/search_users").get(searchUsers)


export default router;

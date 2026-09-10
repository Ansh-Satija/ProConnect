import { Router } from "express"

// IMPORT ALL CONTROLLER FUNCTIONS FROM USER.CONTROLLER.JS BEFORE USING THEM AS ROUTE HANDLERS IN THIS FILE
import { register, login, uploadProfilePicture, updateUserProfile, getUserAndProfile, updateProfileData, getAllUserProfiles,
     downloadProfile, sendConnectionRequest, getMyConnectionRequests, whatAreMyConnections, acceptConnectionRequest,
     getUserProfileAndUserBasedOnUsername } from "../controllers/user.controller.js";

import multer from "multer"
import { diskStorage } from "multer";

const router = Router();

// SETUP MULTER FOR PROFILE PICTURE FEATURE
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
});

const upload = multer({ storage: storage });

// DEFINES API ENDPOINT(OR ROUTE) TO UPDATE USER'S PROFILE PICTURE
router.route("/update_profile_picture")
    .post(upload.single('profile_picture'), uploadProfilePicture);


router.route('/register').post(register);
router.route('/login').post(login);

// API ENDPOINT(OR ROUTE) TO UPDATE USERNAME AND EMAIL
router.route('/user_update').post(updateUserProfile);

// TO FETCH DETAILS FROM USER AND PROFILE DOCS IN DB FOR A USER
router.route("/get_user_and_profile").get(getUserAndProfile)

// TO UPDATE PROFILE DOC'S DETAILS (LIKE BIO, EDUCATION, WORK ETC.) FOR A USER
router.route("/update_profile_data").post(updateProfileData)

// GET ALL USER PROFILES (DOCS) CREATED IN DB
router.route("/user/get_all_users").get(getAllUserProfiles)

// DOWNLOAD USER'S PROFILE DATA AS A PDF (RESUME)
router.route("/user/download_resume").get(downloadProfile)


// CONNECTION REQUEST FUNCTIONALITY :- 
// 1. TO SEND A CONNECTION REQUEST FROM LOGGED IN USER TO ANOTHER USER 
router.route("/user/send_connection_request").post(sendConnectionRequest)
// 2. TO DISPLAY ALL CONNECTION REQUESTS SENT BY LOGGED IN USER TO OTHER USERS
router.route("/user/get_connection_requests").get(getMyConnectionRequests)
// 3. TO DISPLAY ALL CONNECTION REQUESTS RECEIVED BY LOGGED IN USER
router.route("/user/user_connection_request").get(whatAreMyConnections)
// 4. TO ACCEPT OR REJECT A CONNECTION REQUEST
router.route("/user/accept_connection_request").post(acceptConnectionRequest)


// FOR "/DISCOVER" PAGE - TO FETCH USER PROFILE DETAILS FROM DB USING USERNAME
router.route("/user/get_profile_based_on_username").get(getUserProfileAndUserBasedOnUsername)



export default router;
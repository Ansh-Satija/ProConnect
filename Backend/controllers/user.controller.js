import User from "../models/user.model.js"
import Profile from "../models/profile.models.js"
import ConnectionRequest from "../models/connections.model.js"
import Notification from "../models/notification.model.js"
import bcrypt from "bcrypt"
import crypto from "crypto"

import PDFDocument from "pdfkit"
import fs from "fs"

import { uploadToCloudinary, deleteFromCloudinary } from "../utils/cloudinary.js"

// 1. REGISTER NEW USER
export const register = async (req, res) => {
    try {
        const { name, email, password, username } = req.body;

        if (!name || !email || !password || !username) {
            return res.status(400).json({ message: "All fields are required" });
        }

        //CHECK IF USER ALREADY REGISTERED OR NOT
        const emailExists = await User.findOne({ email });

        if (emailExists) {
            return res.status(400).json({
                message: "Email already exists"
            });
        }

        const usernameExists = await User.findOne({
            username: username.trim()
        });

        if (usernameExists) {
            return res.status(400).json({
                message: "Username already exists"
            });
        }
        //IF USER NOT ALREADY REGISTERED => (IT IS A NEW USER)
        const hashedPassword = await bcrypt.hash(password, 10);

        //CREATE NEW MONGODB DOCUMENT USING THE "User" MODEL
        const newUser = new User({
            name: name.trim(),
            email,
            password: hashedPassword,
            username: username.trim()
        });

        await newUser.save();

        // CREATE NEW PROFILE DOCUMENT ALSO FOR THE SAME USER (BOTH HAVE DIFFERENT MODELS SO NEED TO CREATE SEPARATE DOCS)
        const newProfile = new Profile({
            userId: newUser._id
        });

        await newProfile.save();

        return res.status(201).json({ message: "New User and Profile Created" });

    }

    catch (err) {
        return res.status(500).json({ message: err.message });
    }
}

// 2. LOGIN USER - FIRST CHECK IF USER REGISTERED OR NOT THEN CHECK IF CORRECT PASSWORD OR NOT
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        //CHECK IF USER HAS FIRST REGISTERED (SIGNED UP) OR NOT, ONLY THEN ALLOWED TO LOGIN
        const user = await User.findOne({ email });

        if (!user) return res.status(404).json({ message: "User does not exist" });

        //CHECK IF PASSWORD ENTERED BY USER DURING LOGIN IS SAME AS THE PASSWORD (STORED IN DB) GIVEN DURING REGISTRATION(SIGN UP)
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({ message: "Invalid Credentials" });
        }

        //IF VALID USER I.E. ALREADY REGISTERED AND ALSO GIVEN CORRECT PASSWORD FOR LOGIN THEN GENERATE A TOKEN FOR THAT USER SO THAT 
        //HE REMAINS LOGGED IN FOR CURRENT SESSION (EVEN IF HE REFRESHES THE PAGE OR VISITS ANOTHER WEBPAGE OF SAME WEBSITE)
        const newToken = crypto.randomBytes(32).toString("hex");

        //SAVE THE TOKEN FOR CURRENT USER IN DB
        await User.updateOne({ _id: user._id }, { token: newToken })

        return res.json({ token: newToken });
    }

    catch (err) {
        return res.status(500).json({ message: err.message })
    }
}

// 3. UPLOAD PROFILE PICTURE FEATURE
export const uploadProfilePicture = async (req, res) => {
    try {
        const user = req.user;

        if (!req.file) return res.status(400).json({ message: "No file uploaded" });

        const result = await uploadToCloudinary(req.file.buffer, "proconnect-app/avatars");
        const oldPublicId = user.profilePicturePublicId;

        user.profilePicture = result.secure_url;
        user.profilePicturePublicId = result.public_id;
        await user.save();

        // REMOVE THE PREVIOUS AVATAR (BEST EFFORT)
        deleteFromCloudinary(oldPublicId).catch((err) => console.log("CLOUDINARY DELETE FAILED:", err.message));

        return res.json({ message: "Profile picture updated" })
    }
    catch (err) {
        console.error("PROFILE PICTURE UPLOAD FAILED:", err);
        res.status(500).json({ message: err.message })
    }
}

// 4. UPDATE BASIC USER DETAILS (ONLY FOR UPDATING USERNAME AND EMAIL IN THE USER DOC IN DB)
export const updateUserProfile = async (req, res) => {
    try {
        const user = req.user;

        const { name, username, email } = req.body;

        // Check if username/email are already taken
        if (username !== undefined || email !== undefined) {

            const existingUser = await User.findOne({
                $or: [
                    ...(username !== undefined ? [{ username }] : []),
                    ...(email !== undefined ? [{ email }] : [])
                ]
            });

            // Make sure the found user is not the current user
            if (
                existingUser &&
                String(existingUser._id) !== String(user._id)
            ) {
                return res.status(400).json({
                    message: "Username or email already exists"
                });
            }
        }

        // Update only fields that were provided
        if (name !== undefined) {
            user.name = name.trim();
        }

        if (username !== undefined) {
            user.username = username.trim();
        }

        if (email !== undefined) {
            user.email = email.trim();
        }

        await user.save();

        return res.json({
            message: "User Updated"
        });

    } catch (err) {
        console.log("UPDATE USER ERROR:", err);

        return res.status(500).json({
            message: err.message
        });
    }
};

// 5. TO GET THE PROFILE DETAILS FOR GIVEN USER
export const getUserAndProfile = async (req, res) => {
    try {
        const user = req.user;

        console.log(user)

        const userProfile = await Profile.findOne({ userId: user._id })
            .populate('userId', 'name email username profilePicture');

        return res.json({ userProfile });
    }
    catch (err) {
        return res.status(500).json({ message: err.message });
    }
}

// 6. UPDATE PROFILE DOC'S DETAILS IN DB WITH DATA GIVEN BY USER FROM FRONTEND
export const updateProfileData = async (req, res) => {
    try {
        console.log("UPDATE PROFILE CONTROLLER HIT");

        const { token, ...newProfileData } = req.body;

        const user = req.user;

        const profile_to_update = await Profile.findOne({
            userId: user._id
        });

        console.log("PROFILE:", profile_to_update);

        if (!profile_to_update) {
            return res.status(404).json({
                message: "Profile Not Found"
            });
        }

        Object.assign(profile_to_update, newProfileData);

        await profile_to_update.save();

        return res.json({
            message: "Profile Updated"
        });

    } catch (err) {
        console.log("UPDATE PROFILE ERROR:", err);

        return res.status(500).json({
            message: err.message
        });
    }
};

// 7. GET ALL USER PROFILES PRESENT IN DB (FETCHES ALL DOCS CREATED IN PROFILES COLLECTION TILL NOW)
export const getAllUserProfiles = async (req, res) => {
    try {
        const profiles = await Profile.find().populate('userId', 'name username email profilePicture');

        return res.json({ profiles })
    }
    catch (err) {
        return res.status(500).json({ message: err.message })
    }
}

// 8. DOWNLOAD PROFILE DATA OF USER AS PDF (FEATURE) -
export const downloadProfile = async (req, res) => {
    try {
        const userProfile = await Profile.findOne({ userId: req.query.id })
            .populate('userId', 'name username email profilePicture')

        if (!userProfile) return res.status(404).json({ message: "Profile Not Found" });

        const pdfBuffer = await convertUserDataToPDF(userProfile);

        res.set({ "Content-Type": "application/pdf", "Content-Disposition": 'inline; filename="profile.pdf"' });
        return res.send(pdfBuffer);
    }
    catch (err) {
        return res.status(500).json({ message: err.message });
    }
}

const getAvatarBuffer = async (profilePicture) => {
    try {
        if (profilePicture && profilePicture.startsWith("http")) {
            const response = await fetch(profilePicture);
            if (response.ok) return Buffer.from(await response.arrayBuffer());
        }
    } catch (err) { /* FALL THROUGH TO DEFAULT AVATAR */ }
    return fs.readFileSync("assets/default.jpg");
};


// 9. FUNCTION BEING USED IN downloadProfile CONTROLLER FUNCTION ABOVE TO CONVERT USER'S PROFILE DATA INTO PDF:
const convertUserDataToPDF = async (userData) => {
    const avatar = await getAvatarBuffer(userData.userId.profilePicture);

    return new Promise((resolve, reject) => {
        const doc = new PDFDocument();
        const chunks = [];
        doc.on("data", (chunk) => chunks.push(chunk));
        doc.on("end", () => resolve(Buffer.concat(chunks)));
        doc.on("error", reject);

        doc.image(avatar, { width: 100 });

        doc.moveDown(2);

        doc.fontSize(14).text(`Name: ${userData.userId.name}`);
        doc.text(`Username: ${userData.userId.username}`);
        doc.text(`Email: ${userData.userId.email}`);
        doc.text(`Bio: ${userData.bio}`);
        doc.moveDown();
        doc.text(`Current Position: ${userData.currentPost}`);

        doc.moveDown();
        doc.text("Past Work -");
        userData.pastWork.forEach((w) => {
            doc.text(`Company: ${w.company}`);
            doc.text(`Position: ${w.position}`);
            doc.text(`Years: ${w.years}`);
        });

        doc.moveDown();
        doc.text("Education -");
        userData.education.forEach((e) => {
            doc.text(`School: ${e.school}`);
            doc.text(`Degree: ${e.degree}`);
            doc.text(`Field of Study: ${e.fieldOfStudy}`);
        });

        doc.end();
    });

}

// <--- CONNECTION REQUEST CONTROLLERS --->

// 10. CONNECTION REQUEST FUNCTIONALITY: TO SEND A CONNECTION REQUEST
export const sendConnectionRequest = async (req, res) => {

    const { connectionId } = req.body;  // FRONTEND SENDS THE ID OF USER TO WHOM LOGGED-IN USER IS SENDING THE CONNECTION REQUEST (IN REQ.BODY)
    // CONNECTIONID = ID OF USER WHO RECEIVES THE CONNECTION REQUEST

    try {

        const user = req.user; // LOGGED-IN USER WHO SENT THE REQUEST

        const connectionUser = await User.findOne({ _id: connectionId }) // USER WHO RECEIVED THE CONNECTION REQUEST

        if (!connectionUser) {
            return res.status(404).json({ message: "Connection User Not Found" });
        }

        if (user._id.equals(connectionUser._id)) {
            return res.status(400).json({ message: "You cannot connect with yourself" })
        }

        const existingRequest = await ConnectionRequest.findOne({
            $or: [
                { userId: user._id, connectionId: connectionUser._id },
                { userId: connectionUser._id, connectionId: user._id }
            ]
        })

        if (existingRequest) {
            if (existingRequest.userId.equals(user._id)) {
                return res.status(400).json({ message: "Request Already Sent" })
            }
            return res.status(400).json({ message: "This user has already sent you a request" })
        }

        // IF NOT EXISTING REQUEST I.E. IT IS A NEW REQUEST
        const request = new ConnectionRequest({
            userId: user._id,
            connectionId: connectionUser._id
        })

        try {
            await request.save();
        }
        catch (err) {
            if (err.code === 11000) {
                return res.status(400).json({ message: "Request Already Sent" })
            }
            throw err;
        }

        // CREATE NEW NOTIFICATION OBJECT TO NOTIFY RECEIVER ABOUT NEW REQUEST - 
        const notification = new Notification({
            recipient: connectionUser._id,
            sender: user._id,
            type: "CONNECTION_REQUEST"
        });

        await notification.save();

        return res.json({ message: "Request Sent" })
    }

    catch (err) {
        res.status(500).json({ message: err.message })
    }
}

// 11. TO DISPLAY ALL CONNECTION REQUESTS SENT BY CURR LOGGED IN USER
export const getMyConnectionRequests = async (req, res) => {

    try {

        const user = req.user;

        const connections = await ConnectionRequest.find({ userId: user._id })
            .populate('connectionId', 'name username email profilePicture')

        return res.json({ connections });

    }
    catch (err) {
        res.status(500).json({ message: err.message })
    }
}

// 12. TO DISPLAY ALL CONNECTION REQUESTS RECEIVED BY CURR USER
export const whatAreMyConnections = async (req, res) => {

    try {
        const user = req.user;       // LOGGED-IN USER WHO RECEIVED ALL REQUESTS

        const connections = await ConnectionRequest.find({ connectionId: user._id }) // SEARCH ALL CONNECTION DOCS AND FILTER ONLY THOSE WHERE CURR LOGGEDIN
            .populate('userId', 'name username email profilePicture')                // USER IS THE RECEIVER OF REQUEST (CONNECTIONID = ID OF RECEIVER OF REQ)

        return res.json(connections);
    }

    catch (err) {
        res.status(500).json({ message: err.message });
    }
}

// 13. TO ACCEPT OR REJECT A CONNECTION REQUEST
export const acceptConnectionRequest = async (req, res) => {
    const { requestId, action_type } = req.body;

    try {
        const user = req.user;

        const connection = await ConnectionRequest.findOne({ _id: requestId, connectionId: user._id });

        if (!connection) {
            return res.status(404).json({ message: "Connection Request Not Found" })
        }

        if (action_type === "accept") {
            connection.status_accepted = true;
            await connection.save();

            // CREATE NEW NOTIFICATION = REQUEST ACCEPTED FOR THE ORIGINAL SENDER OF REQUEST
            const notification = new Notification({
                recipient: connection.userId,
                sender: user._id,
                type: "CONNECTION_ACCEPTED"
            })

            await notification.save();
        }
        else {
            connection.status_accepted = false;
            await connection.save();
        }

        return res.json({ message: "Request Updated" });

    }

    catch (err) {
        res.status(500).json({ message: err.message })
    }
}

// 14. FOR "/DISCOVER" PAGE - TO FETCH USER PROFILE DETAILS FROM DB USING USERNAME
export const getUserProfileAndUserBasedOnUsername = async (req, res) => {
    const { username } = req.query;

    try {

        const user = await User.findOne({ username: username });

        if (!user) {
            return res.status(404).json({ message: "User Not Found" });
        }

        const userProfile = await Profile.findOne({ userId: user._id })
            .populate("userId", "name username profilePicture")

        return res.json({ "profile": userProfile })
    }
    catch (err) {
        return res.status(500).json({ message: err.message })
    }
}

// 15. GET SUGGESTED USERS ON THE RIGHT SIDEBAR OF DASHBOARDLAYOUT (BUILD YOUR NETWORK/ PEOPLE YOU MAY KNOW SECTION)
export const getSuggestedUsers = async (req, res) => {

    try {
        const currentUser = req.user;

        const users = await User.find({
            _id: { $ne: currentUser._id }
        }).select("name username profilePicture");



        return res.json({ users });

    } catch (err) {

        return res.status(500).json({
            message: err.message
        });
    }
};
// 16. FOR SEARCHBAR: TO FIND A USER BY NAME/ USERNAME
export const searchUsers = async (req, res) => {

    try {

        const { query } = req.query;

        if (!query) {
            return res.json({
                users: []
            })
        }

        const users = await User.find({
            $or: [
                { name: { $regex: query, $options: "i" } },
                { username: { $regex: query, $options: "i" } }
            ]
        }).select("name username profilePicture");


        return res.json({ users })
    }
    catch (err) {
        return res.status(500).json({ message: err.message })
    }
}

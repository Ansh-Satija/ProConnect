import User from "../models/user.model.js"
import Profile from "../models/profile.models.js"
import ConnectionRequest from "../models/connections.model.js"
import bcrypt from "bcrypt"
import crypto from "crypto"

import PDFDocument from "pdfkit"
import fs from "fs"

// REGISTER NEW USER
export const register = async (req, res) => {
    try {
        const { name, email, password, username } = req.body;

        if (!name || !email || !password || !username) {
            return res.status(400).json({ message: "All fields are required" });
        }

        //CHECK IF USER ALREADY REGISTERED OR NOT
        const user = await User.findOne({ email });

        if (user) {
            return res.status(400).json({ message: "User already exists" });
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

// LOGIN USER - FIRST CHECK IF USER REGISTERED OR NOT THEN CHECK IF CORRECT PASSWORD OR NOT
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

// UPLOAD PROFILE PICTURE FEATURE
export const uploadProfilePicture = async (req, res) => {
    const { token } = req.body;

    try {
        const user = await User.findOne({ token: token })

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        user.profilePicture = req.file.filename;

        await user.save();

        return res.json({ message: "Profile picture updated" })

    }
    catch (err) {
        res.status(500).json({ message: err.message })
    }
}

// UPDATE BASIC USER DETAILS (ONLY FOR UPDATING USERNAME AND EMAIL IN THE USER DOC IN DB)
export const updateUserProfile = async (req, res) => {
    try {
        const { token, ...newUserData } = req.body;

        // IDENTIFY THE USER WHO IS MAKING THE REQUEST
        const user = await User.findOne({ token: token });
        if (!user) {
            return res.status(404).json({ message: "User Not Found" });
        }

        // CHECK IF THE NEW USERNAME, EMAIL GIVEN BY THE USER (FOR UPDATION) IS ALREADY TAKEN OR NOT BY ANOTHER USER
        const { username, email } = newUserData;
        const existingUser = await User.findOne({ $or: [{ username }, { email }] });

        if (existingUser) {
            if (String(existingUser._id) !== String(user._id)) {
                return res.status(400).json({ message: "User Already Exists" });
            }
        }

        Object.assign(user, newUserData)

        await user.save();

        return res.json({ message: "User Updated" });
    }

    catch (err) {
        return res.status(500).json({ message: err.message });
    }
}

// TO GET THE PROFILE DETAILS FOR GIVEN USER
export const getUserAndProfile = async (req, res) => {
    try {
        const { token } = req.query;

        console.log(`Token: ${token}`)

        const user = await User.findOne({ token: token });

        console.log(user)

        if (!user) {
            return res.status(404).json({ message: "User Not Found" });
        }

        const userProfile = await Profile.findOne({ userId: user._id })
            .populate('userId', 'name email username profilePicture');

        return res.json({ userProfile });
    }
    catch (err) {
        return res.status(500).json({ message: err.message });
    }
}

// UPDATE PROFILE DOC'S DETAILS IN DB WITH DATA GIVEN BY USER FROM FRONTEND
export const updateProfileData = async (req, res) => {
    try {
        const { token, ...newProfileData } = req.body;

        const userProfile = await User.findOne({ token: token });

        if (!userProfile) {
            return res.status(404).json({ message: "User Not Found" });
        }

        const profile_to_update = await Profile.findOne({ userId: userProfile._id });

        Object.assign(profile_to_update, newProfileData);

        await profile_to_update.save();

        return res.json({ message: "Profile Updated" })
    }

    catch (err) {
        res.status(500).json({ message: err.message });
    }
}

// GET ALL USER PROFILES PRESENT IN DB (FETCHES ALL DOCS CREATED IN PROFILES COLLECTION TILL NOW)
export const getAllUserProfiles = async (req, res) => {
    try {
        const profiles = await Profile.find().populate('userId', 'name username email profilePicture');

        return res.json({ profiles })
    }
    catch (err) {
        return res.status(500).json({ message: err.message })
    }
}

// DOWNLOAD PROFILE DATA OF USER AS PDF (FEATURE) - 
export const downloadProfile = async (req, res) => {

    const user_id = req.query.id;

    const userProfile = await Profile.findOne({ userId: user_id })
        .populate('userId', 'name username email profilePicture')

    let outputPath = await convertUserDataToPDF(userProfile);

    return res.json({ message: outputPath });
}

// FUNCTION BEING USED IN downloadProfile CONTROLLER FUNCTION ABOVE TO CONVERT USER'S PROFILE DATA INTO PDF:
const convertUserDataToPDF = async (userData) => {
    const doc = new PDFDocument();

    const outputPath = crypto.randomBytes(32).toString("hex") + ".pdf";

    const stream = fs.createWriteStream("uploads/" + outputPath)

    doc.pipe(stream);

    doc.image(`uploads/${userData.userId.profilePicture}`, { align: "center", width: 100 })

    doc.moveDown(2); // empty line

    doc.fontSize(14).text(`Name: ${userData.userId.name}`);
    doc.fontSize(14).text(`Username: ${userData.userId.username}`)
    doc.fontSize(14).text(`Email: ${userData.userId.email}`)
    doc.fontSize(14).text(`Bio: ${userData.bio}`)

    doc.moveDown()

    doc.fontSize(14).text(`Current Position: ${userData.currentPost}`)

    doc.fontSize(14).text("Past Work -  ")
    userData.pastWork.forEach((work, index) => {
        doc.fontSize(14).text(`Company Name: ${work.company}`)
        doc.fontSize(14).text(`Position: ${work.position}`)
        doc.fontSize(14).text(`Years: ${work.years}`)
    })

    doc.end();

    return outputPath;

}

// CONNECTION REQUEST FUNCTIONALITY: TO SEND A CONNECTION REQUEST
export const sendConnectionRequest = async (req, res) => {

    const { token, connectionId } = req.body;


    try {
        const user = await User.findOne({ token });  // USER WHO SENT THE CONNECTION REQUEST

        if (!user) {
            res.status(404).json({ message: "User Not Found" });
        }

        const connectionUser = await User.findOne({ _id: connectionId })  // USER WHO RECEIVED THE CONNECTION REQUEST

        if (!connectionUser) {
            return res.status(404).json({ message: "Connection User Not Found" });
        }

        const existingRequest = await ConnectionRequest.findOne({
            userId: user._id,
            connectionId: connectionUser._id
        })

        if (existingRequest) {
            return res.status(400).json({ message: "Request Already Sent" })
        }

        // IF NOT EXISTING REQUEST I.E. IT IS A NEW REQUEST
        const request = new ConnectionRequest({
            userId: user._id,
            connectionId: connectionUser._id
        })

        await request.save();

        return res.json({ message: "Request Sent" })
    }

    catch (err) {
        res.status(500).json({ message: err.message })
    }
}

// TO DISPLAY ALL CONNECTION REQUESTS SENT BY CURR LOGGED IN USER 
export const getMyConnectionRequests = async (req, res) => {
    const { token } = req.query;

    try {
        const user = await User.findOne({ token });

        if (!user) {
            return res.status(404).json({ message: "User Not Found" });
        }

        const connections = await ConnectionRequest.find({ userId: user._id })
            .populate('connectionId', 'name username email profilePicture')

        return res.json({ connections });

    }
    catch (err) {
        res.status(500).json({ message: err.message })
    }
}

// TO DISPLAY ALL CONNECTION REQUESTS RECEIVED BY CURR USER
export const whatAreMyConnections = async (req, res) => {
    const { token } = req.query;

    try {
        const user = await User.findOne({ token });

        if (!user) {
            return res.status(404).json({ message: "User Not Found" });
        }

        const connections = await ConnectionRequest.find({ connectionId: user._id })
            .populate('userId', 'name username email profilePicture')

        return res.json(connections);
    }

    catch (err) {
        res.status(500).json({ message: err.message });
    }
}

// TO ACCEPT OR REJECT A CONNECTION REQUEST
export const acceptConnectionRequest = async (req, res) => {
    const { token, requestId, action_type } = req.body;

    try {
        const user = await User.findOne({ token });

        if (!user) {
            return res.status(404).json({ message: "User Not Found" });
        }

        const connection = await ConnectionRequest.findOne({ _id: requestId });

        if (!connection) {
            return res.status(404).json({ message: "Connection Not Found" })
        }

        if (action_type === "accept") {
            connection.status_accepted = true;
        }
        else {
            connection.status_accepted = false;
        }

        await connection.save();
        return res.json({ message: "Request Updated" });

    }

    catch (err) {
        res.status(500).json({ message: err.message })
    }
}

// FOR "/DISCOVER" PAGE - TO FETCH USER PROFILE DETAILS FROM DB USING USERNAME
export const getUserProfileAndUserBasedOnUsername = async (req, res) => {
    const { username } = req.query;

    try {

        const user = await User.findOne({ username: username });

        if (!user) {
            return res.status(404).json({ message: "User Not Found" });
        }

        const userProfile = await Profile.findOne({ userId: user._id })
            .populate("userId", "name username email profilePicture")

        return res.json({ "profile": userProfile })
    }
    catch (err) {
        return res.status(500).json({ message: err.message })
    }
}

// GET SUGGESTED USERS ON THE RIGHT SIDEBAR OF DASHBOARDLAYOUT (BUILD YOUR NETWORK/ PEOPLE YOU MAY KNOW SECTION)
export const getSuggestedUsers = async (req, res) => {

    try {
        const { token } = req.query;

        const currentUser = await User.findOne({ token });

        if (!currentUser) {
            return res.status(404).json({ message: "User Not Found" });
        }

        const users = await User.find({ _id: { $ne: currentUser._id } })
            .select("name username profilePicture");

        return res.json({ users });
    }
    catch(err){
        return res.status(500).json({message: err.message})
    }
}

// FOR SEARCHBAR: TO FIND A USER BY NAME/ USERNAME
export const searchUsers = async (req,res) => {

    try{

        const {query} = req.query;

        if(!query){
            return res.json({
                users: []
            })
        }

        const users = await User.find({
            $or: [
                {name: {$regex: query, $options: "i"}},
                {username: {$regex: query, $options: "i"}}
            ]
        }).select("name username profilePicture");


        return res.json({users})
    }
    catch(err){
        return res.status(500).json({message: err.message})
    }
}
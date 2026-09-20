import User from "../models/user.model.js"

export const authenticateUser = async (req, res, next) => {

    try {

        const token = req.body?.token || req.query?.token;

        if (!token) {
            return res.status(401).json({
                message: "Authentication Token Required"
            });
        }

        // SEARCH IF USER HAS ALREADY REGISTERED OR NOT
        const user = await User.findOne({ token });

        if (!user) {   // SEARCHES IF USER HAS ALREADY REGISTERED OR NOT
            return res.status(401).json({
                message: "Invalid Token"
            });
        }

        req.user = user;

        next();

    } catch (err) {
        console.log("MIDDLEWARE ERROR:", err);

        return res.status(500).json({
            message: err.message
        });
    }
};
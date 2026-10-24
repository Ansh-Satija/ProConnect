import multer from "multer";

const IMAGE_TYPES = ["image/jpeg", "image/png"];
const POST_TYPES = [...IMAGE_TYPES, "image/gif", "image/webp",
    "video/mp4", "video/webm", "video/quicktime", "application/pdf"];

const makeUpload = (allowed, maxMB) => multer({
    storage: multer.memoryStorage(),   // FILE STAYS IN RAM AS req.file.buffer, NOTHING IS WRITTEN TO DISK
    fileFilter: (req, file, cb) => {
        if (allowed.includes(file.mimetype)) return cb(null, true);
        const err = new Error("Unsupported file type");
        err.status = 400;
        cb(err);
    },
    limits: { fileSize: maxMB * 1024 * 1024, files: 1 }
});

export const uploadProfilePic = makeUpload(IMAGE_TYPES, 2);
export const uploadPostMedia = makeUpload(POST_TYPES, 25);
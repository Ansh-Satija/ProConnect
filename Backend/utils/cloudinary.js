import { v2 as cloudinary } from "cloudinary";

// CONFIG IS DONE AT CALL TIME SO process.env IS READ AFTER dotenv.config() HAS RUN
const configure = () => {
    const config = {
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET
    };
    const missing = Object.entries(config)
        .filter(([, value]) => !value)
        .map(([key]) => key);

    if (missing.length) {
        throw new Error(`Missing Cloudinary environment variables: ${missing.join(", ")}`);
    }

    cloudinary.config(config);
};

export const uploadToCloudinary = (buffer, folder) => {
    configure();
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            { folder, resource_type: "auto" },
            (err, result) => (err ? reject(err) : resolve(result))
        );
        stream.end(buffer);
    });
};

export const deleteFromCloudinary = async (publicId, resourceType = "image") => {
    if (!publicId) return;
    configure();
    await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
};

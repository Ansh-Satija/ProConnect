const {default: axios} = require("axios") 

const configuredApiUrl = process.env.NEXT_PUBLIC_API_URL;
export const BASE_URL = (configuredApiUrl || "http://localhost:8080").replace(/\/$/, "");

export const clientServer = axios.create({
    baseURL: BASE_URL
})

clientServer.interceptors.response.use(
    (response) => response,
    (error) => {
        if (
            error.response?.status === 401 &&
            typeof window !== "undefined" &&
            localStorage.getItem("token")
        ) {
            localStorage.removeItem("token");

            if (window.location.pathname !== "/login") {
                window.location.replace("/login");
            }
        }

        return Promise.reject(error);
    }
)

export const mediaUrl = (value) => {
    if (typeof value !== "string" || !value || value === "default.jpg") return "/default.jpg";
    if (/^https?:\/\//i.test(value)) return value;
    return `${BASE_URL}/${value.replace(/^\//, "")}`;
};

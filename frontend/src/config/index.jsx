const {default: axios} = require("axios") 

export const BASE_URL = process.env.NEXT_PUBLIC_API_URL;
// export const BASE_URL = "http://localhost:8080";

export const clientServer = axios.create({
    baseURL: BASE_URL
})

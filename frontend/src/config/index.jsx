const {default: axios} = require("axios") 

export const BASE_URL = "https://proconnect-lge0.onrender.com"
// export const BASE_URL = "http://localhost:8080"

export const clientServer = axios.create({
    baseURL: BASE_URL
})
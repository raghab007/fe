import axios from "axios";

const axiosInstance = axios.create({
  baseURL: 'http://127.0.0.1:5000',
  timeout: 30000,

})


// const axiosInstance = axios.create({
//   baseURL: 'http://localhos',
//   timeout: 5000,

// })

export { axiosInstance }
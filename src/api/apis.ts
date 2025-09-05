import axios from "axios";

const axiosInstance = axios.create({
  baseURL: 'https://dlqtl97sug.execute-api.eu-north-1.amazonaws.com/v1',
  timeout: 30000,

})


// const axiosInstance = axios.create({
//   baseURL: 'http://localhos',
//   timeout: 5000,

// })

export { axiosInstance }
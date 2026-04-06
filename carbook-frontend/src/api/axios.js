import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "https://carbook-1prw.onrender.com/api",
  withCredentials: true,
});

export default axiosInstance;

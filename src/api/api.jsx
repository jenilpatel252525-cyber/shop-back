import axios from 'axios';

const api = axios.create({
  baseURL: 'https://shop-front-bl1h.onrender.com',
});

api.interceptors.request.use(
  (config) => {
    const tokens = localStorage.getItem('authTokens');
    if (tokens) {
      const token = JSON.parse(tokens).access;
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
import axios from 'axios';

const API = axios.create({ baseURL: 'http://localhost:5000' });

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('sessionToken');
  if (token) config.headers['Authorization'] = token;
  return config;
});

export default API;
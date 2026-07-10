import axios from 'axios';

// 1. API Layer & Axios Instance
const api = axios.create({
  baseURL: 'https://www.omdbapi.com/', 
});

// 2. Interceptors
api.interceptors.request.use((config) => {
  // Automatically attaches ?apikey=YOUR_KEY to every request
  config.params = {
    ...config.params,
    apikey: '4d4800f', 
  };
  return config;
});

export default api;
import axios from 'axios';

// Create an Axios instance connected to your json-server
const API = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000',
  headers: {
    'Content-Type': 'application/json',
  },
});

export default API;
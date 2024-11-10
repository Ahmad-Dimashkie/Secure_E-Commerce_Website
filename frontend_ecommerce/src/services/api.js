import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL, // Ensure you have REACT_APP_API_URL set in your .env file
});

export default api;

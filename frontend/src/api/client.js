import axios from 'axios';

// This points to your User Service running in Docker on port 8080
const client = axios.create({
  baseURL: 'http://localhost:8080', 
  headers: { 'Content-Type': 'application/json' }
});

// This automatically adds the JWT token to requests if you are logged in
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default client;
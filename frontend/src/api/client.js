import axios from 'axios';

// Base client configuration
const createClient = (baseURL) => {
  const client = axios.create({
    baseURL,
    headers: { 'Content-Type': 'application/json' }
  });

  // Add JWT token to all requests
  client.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  // Handle errors globally
  client.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        // Token expired or invalid
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/';
      }
      return Promise.reject(error);
    }
  );

  return client;
};

// Service-specific clients
export const userClient = createClient('http://localhost:8080');
export const teamClient = createClient('http://localhost:8082');
export const taskClient = createClient('http://localhost:8083');

export default userClient;

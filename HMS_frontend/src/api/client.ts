import axios from "axios";

const apiClient = axios.create({baseURL: import.meta.env.VITE_API_BASE_URL,});

// Attaches the JWT access token to every request automatically
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default apiClient;
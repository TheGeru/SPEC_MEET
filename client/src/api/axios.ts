import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000/api', // Backend URL
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para incluir el token JWT en futuras peticiones
api.interceptors.request.use((config) => {
  const savedUser = localStorage.getItem('specMeetUser');
  if (savedUser) {
    const { token } = JSON.parse(savedUser);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export default api;
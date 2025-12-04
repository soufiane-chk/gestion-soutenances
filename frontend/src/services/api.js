import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
const BASE_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true,
});

// Fonction pour récupérer le token CSRF depuis les cookies
const getCsrfToken = () => {
  const name = 'XSRF-TOKEN';
  const cookies = document.cookie.split(';');
  for (let cookie of cookies) {
    const [key, value] = cookie.trim().split('=');
    if (key === name) {
      return decodeURIComponent(value);
    }
  }
  return null;
};

// Récupérer le token CSRF au démarrage
let csrfToken = null;

// Fonction pour initialiser le token CSRF
export const initializeCsrfToken = async () => {
  try {
    await axios.get(`${BASE_URL}/sanctum/csrf-cookie`, {
      withCredentials: true,
    });
    csrfToken = getCsrfToken();
  } catch (error) {
    console.error('Erreur lors de la récupération du token CSRF:', error);
  }
};

// Initialiser le token CSRF au chargement
initializeCsrfToken();

// Intercepteur pour ajouter le token d'authentification et CSRF
api.interceptors.request.use(
  async (config) => {
    // Récupérer le token CSRF depuis les cookies
    const token = getCsrfToken();
    if (token) {
      config.headers['X-XSRF-TOKEN'] = token;
    }

    // Ajouter le token Bearer si disponible
    const bearerToken = localStorage.getItem('token');
    if (bearerToken) {
      config.headers.Authorization = `Bearer ${bearerToken}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les erreurs
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Si erreur CSRF, récupérer un nouveau token
    if (error.response?.status === 419 || error.response?.status === 403) {
      try {
        await initializeCsrfToken();
        // Réessayer la requête avec le nouveau token
        const config = error.config;
        const token = getCsrfToken();
        if (token) {
          config.headers['X-XSRF-TOKEN'] = token;
        }
        return api.request(config);
      } catch (retryError) {
        console.error('Erreur lors de la récupération du token CSRF:', retryError);
      }
    }

    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth
export const authAPI = {
  login: (credentials) => api.post('/login', credentials),
  register: (data) => api.post('/register', data),
  logout: () => api.post('/logout'),
  me: () => api.get('/user'),
  getAllUsers: () => api.get('/admin/users'),
  createUser: (data) => api.post('/admin/users', data),
  updateUser: (id, data) => api.put(`/admin/users/${id}`, data),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  updateUserRole: (id, data) => api.put(`/admin/users/${id}/role`, data),
  initializeCsrfToken: initializeCsrfToken,
};

// Étudiants
export const etudiantsAPI = {
  getAll: () => api.get('/etudiants'),
  getById: (id) => api.get(`/etudiants/${id}`),
  create: (data) => api.post('/etudiants', data),
  update: (id, data) => api.put(`/etudiants/${id}`, data),
  delete: (id) => api.delete(`/etudiants/${id}`),
};

// Professeurs
export const professeursAPI = {
  getAll: () => api.get('/professeurs'),
  getById: (id) => api.get(`/professeurs/${id}`),
  create: (data) => api.post('/professeurs', data),
  update: (id, data) => api.put(`/professeurs/${id}`, data),
  delete: (id) => api.delete(`/professeurs/${id}`),
};

// Rapports
export const rapportsAPI = {
  getAll: () => api.get('/rapports'),
  getById: (id) => api.get(`/rapports/${id}`),
  // Utilise FormData avec multipart pour permettre l'upload de fichier
  create: (formData) =>
    api.post('/rapports', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  // On passe aussi par multipart pour l'update (avec _method=PUT pour Laravel)
  update: (id, formData) =>
    api.post(`/rapports/${id}?_method=PUT`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  delete: (id) => api.delete(`/rapports/${id}`),
};

// Soutenances
export const soutenancesAPI = {
  getAll: () => api.get('/soutenances'),
  getById: (id) => api.get(`/soutenances/${id}`),
  create: (data) => api.post('/soutenances', data),
  update: (id, data) => api.put(`/soutenances/${id}`, data),
  delete: (id) => api.delete(`/soutenances/${id}`),
};

// Jurys
export const jurysAPI = {
  getAll: () => api.get('/jurys'),
  getById: (id) => api.get(`/jurys/${id}`),
  create: (data) => api.post('/jurys', data),
  update: (id, data) => api.put(`/jurys/${id}`, data),
  delete: (id) => api.delete(`/jurys/${id}`),
};

export default api;


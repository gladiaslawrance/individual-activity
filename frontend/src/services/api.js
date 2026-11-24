import axios from 'axios';

const api = axios.create({
baseURL: 'https://individual-activity-0x2z.onrender.com/api',  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach JWT Token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('sec_auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle 401 Unauthorized
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token and redirect to login if unauthorized
      localStorage.removeItem('sec_auth_token');
      localStorage.removeItem('sec_admin_user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  getMe: () => api.get('/auth/me'),
};

// Client APIs
export const clientAPI = {
  getClients: (params) => api.get('/clients', { params }),
  getClientById: (id) => api.get(`/clients/${id}`),
  createClient: (data) => api.post('/clients', data),
  updateClient: (id, data) => api.put(`/clients/${id}`, data),
  deleteClient: (id) => api.delete(`/clients/${id}`),
  getClientHistory: (id, params) => api.get(`/clients/${id}/history`, { params }),
  unblockClient: (id) => api.post(`/clients/${id}/unblock`),
  resetCounters: (id) => api.post(`/clients/${id}/reset-counter`),
};

// Request Simulator APIs
export const requestAPI = {
  simulate: (data) => api.post('/requests/simulate', data),
  bulkSimulate: (data) => api.post('/requests/bulk', data),
  getRequests: (params) => api.get('/requests', { params }),
  getStats: () => api.get('/requests/stats'),
};

// Dashboard APIs
export const dashboardAPI = {
  getStats: () => api.get('/dashboard/stats'),
  getActivity: () => api.get('/dashboard/activity'),
};

// Abuse Alerts APIs
export const alertAPI = {
  getAlerts: (params) => api.get('/alerts', { params }),
  resolveAlert: (id, data) => api.put(`/alerts/${id}/resolve`, data),
};

// FSM APIs
export const fsmAPI = {
  getStates: () => api.get('/fsm/states'),
  getTransitions: () => api.get('/fsm/transitions'),
  getHistory: (params) => api.get('/fsm/history', { params }),
};

// Settings APIs
export const settingsAPI = {
  getSettings: () => api.get('/settings'),
  updateSettings: (data) => api.put('/settings', data),
};

export default api;

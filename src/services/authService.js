import api from './api';

export const authService = {
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data));
    }
    return response.data;
  },

  login: async (credentials) => {
    try {
      const response = await api.post('/auth/login', credentials);
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data));
      }
      return response.data;
    } catch (error) {
      // Check if response is MUST_CHANGE_PASSWORD
      if (error.response && error.response.status === 403 && error.response.data.code === 'MUST_CHANGE_PASSWORD') {
        // Store temp token and return special response
        localStorage.setItem('tempToken', error.response.data.tempToken);
        localStorage.setItem('tempEmail', error.response.data.email);
        return { mustChangePassword: true, ...error.response.data };
      }
      throw error;
    }
  },

  changePassword: async (newPassword) => {
    const tempToken = localStorage.getItem('tempToken');
    const response = await api.post('/auth/change-password', null, {
      params: { newPassword },
      headers: { Authorization: `Bearer ${tempToken}` }
    });
    if (response.data.token) {
      localStorage.removeItem('tempToken');
      localStorage.removeItem('tempEmail');
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data));
    }
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },
};

import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8082/api';

export const adminService = {
  login: async (adminKey) => {
    const response = await axios.post(`${API_URL}/admin/login?adminKey=${adminKey}`);
    return response.data;
  },

  getAllUsers: async (adminKey) => {
    const response = await axios.get(`${API_URL}/admin/users?adminKey=${adminKey}`);
    return response.data;
  },

  getUserExpenseCount: async (adminKey, userId) => {
    const response = await axios.get(`${API_URL}/admin/users/${userId}/expense-count?adminKey=${adminKey}`);
    return response.data;
  },

  deleteUserMonthExpenses: async (adminKey, userId, year, month) => {
    const response = await axios.delete(
      `${API_URL}/admin/users/${userId}/expenses?adminKey=${adminKey}&year=${year}&month=${month}`
    );
    return response.data;
  },

  deleteUser: async (adminKey, userId) => {
    const response = await axios.delete(`${API_URL}/admin/users/${userId}?adminKey=${adminKey}`);
    return response.data;
  },
};

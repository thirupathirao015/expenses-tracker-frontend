import api from './api';

export const expenseService = {
  addExpense: async (expenseData) => {
    const response = await api.post('/expenses', expenseData);
    return response.data;
  },

  getRemainingAmount: async () => {
    const response = await api.get('/expenses/remaining');
    return response.data;
  },

  getUserExpenses: async () => {
    const response = await api.get('/expenses');
    return response.data;
  },

  getTodayExpenses: async () => {
    const response = await api.get('/expenses/today');
    return response.data;
  },

  getMonthlyReport: async (year, month) => {
    const response = await api.get('/expenses/monthly', {
      params: { year, month },
    });
    return response.data;
  },

  downloadMonthlyPdf: async (year, month) => {
    const response = await api.get('/expenses/monthly/pdf', {
      params: { year, month },
      responseType: 'blob',
    });
    
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `expense-report-${year}-${month.toString().padStart(2, '0')}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },

  updateExpense: async (id, expenseData) => {
    const response = await api.put(`/expenses/${id}`, expenseData);
    return response.data;
  },

  deleteExpense: async (id) => {
    await api.delete(`/expenses/${id}`);
  },

  updateSalary: async (newSalary) => {
    const response = await api.put(`/auth/update-salary?newSalary=${newSalary}`);
    return response.data;
  },
};

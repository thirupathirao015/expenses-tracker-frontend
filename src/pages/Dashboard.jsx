import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { expenseService } from '../services/expenseService';
import { authService } from '../services/authService';

const Dashboard = () => {
  const location = useLocation();
  const [remainingData, setRemainingData] = useState(null);
  const [todayExpenses, setTodayExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [expenseForm, setExpenseForm] = useState({
    amount: '',
    category: 'FOOD',
    description: '',
    expenseDate: new Date().toISOString().split('T')[0],
  });
  
  const [submitting, setSubmitting] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);

  const user = authService.getCurrentUser();

  const categories = [
    'ROOM_RENT',
    'FOOD',
    'CLOTHES',
    'MOVIES',
    'TRANSPORTATION',
    'UTILITIES',
    'HEALTHCARE',
    'EDUCATION',
    'ENTERTAINMENT',
    'SHOPPING',
    'TRAVEL',
    'OTHER',
  ];

  useEffect(() => {
    fetchDashboardData();
    
    // Check if we have an expense to edit from navigation state
    if (location.state?.editExpense) {
      const expense = location.state.editExpense;
      setEditingExpense(expense);
      setExpenseForm({
        amount: expense.amount.toString(),
        category: expense.category,
        description: expense.description || '',
        expenseDate: expense.expenseDate,
      });
      // Clear the navigation state
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [remaining, today] = await Promise.all([
        expenseService.getRemainingAmount(),
        expenseService.getTodayExpenses(),
      ]);
      setRemainingData(remaining);
      setTodayExpenses(today);
    } catch (err) {
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setExpenseForm({
      ...expenseForm,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);

    try {
      const data = {
        ...expenseForm,
        amount: parseFloat(expenseForm.amount),
      };
      
      if (editingExpense) {
        await expenseService.updateExpense(editingExpense.id, data);
        setSuccess('Expense updated successfully!');
        setEditingExpense(null);
      } else {
        await expenseService.addExpense(data);
        setSuccess('Expense added successfully!');
      }
      
      setExpenseForm({
        amount: '',
        category: 'FOOD',
        description: '',
        expenseDate: new Date().toISOString().split('T')[0],
      });
      fetchDashboardData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save expense');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (expense) => {
    setEditingExpense(expense);
    setExpenseForm({
      amount: expense.amount.toString(),
      category: expense.category,
      description: expense.description || '',
      expenseDate: expense.expenseDate,
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this expense?')) {
      return;
    }
    
    try {
      await expenseService.deleteExpense(id);
      setSuccess('Expense deleted successfully!');
      fetchDashboardData();
    } catch (err) {
      setError('Failed to delete expense');
    }
  };

  const handleCancelEdit = () => {
    setEditingExpense(null);
    setExpenseForm({
      amount: '',
      category: 'FOOD',
      description: '',
      expenseDate: new Date().toISOString().split('T')[0],
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  if (loading) {
    return <div className="container">Loading...</div>;
  }

  return (
    <div className="container">
      <h1 style={{ marginBottom: '20px' }}>Welcome, {user?.name}!</h1>
      
      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {/* Summary Cards */}
      {remainingData && (
        <div className="summary-cards">
          <div className="summary-card salary">
            <h3>Original Salary</h3>
            <div className="amount">{formatCurrency(remainingData.originalSalary)}</div>
          </div>
          <div className="summary-card expenses">
            <h3>Total Expenses</h3>
            <div className="amount">{formatCurrency(remainingData.totalExpenses)}</div>
          </div>
          <div className="summary-card remaining">
            <h3>Remaining Amount</h3>
            <div className="amount">{formatCurrency(remainingData.remainingAmount)}</div>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {/* Add/Edit Expense Form */}
        <div className="card">
          <h2 style={{ marginBottom: '20px' }}>{editingExpense ? 'Edit Expense' : 'Add Expense'}</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="amount">Amount (Rs)</label>
              <input
                type="number"
                id="amount"
                name="amount"
                className="form-control"
                value={expenseForm.amount}
                onChange={handleChange}
                required
                min="0.01"
                step="0.01"
              />
            </div>

            <div className="form-group">
              <label htmlFor="category">Category</label>
              <select
                id="category"
                name="category"
                className="form-control"
                value={expenseForm.category}
                onChange={handleChange}
                required
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat.replace('_', ' ')}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="description">Description</label>
              <input
                type="text"
                id="description"
                name="description"
                className="form-control"
                value={expenseForm.description}
                onChange={handleChange}
                placeholder="Optional description"
              />
            </div>

            <div className="form-group">
              <label htmlFor="expenseDate">Date</label>
              <input
                type="date"
                id="expenseDate"
                name="expenseDate"
                className="form-control"
                value={expenseForm.expenseDate}
                onChange={handleChange}
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%' }}
              disabled={submitting}
            >
              {submitting ? (editingExpense ? 'Updating...' : 'Adding...') : (editingExpense ? 'Update Expense' : 'Add Expense')}
            </button>
            
            {editingExpense && (
              <button
                type="button"
                className="btn btn-secondary"
                style={{ width: '100%', marginTop: '10px' }}
                onClick={handleCancelEdit}
              >
                Cancel
              </button>
            )}
          </form>
        </div>

        {/* Today's Expenses */}
        <div className="card">
          <h2 style={{ marginBottom: '20px' }}>Today's Expenses</h2>
          {todayExpenses.length === 0 ? (
            <p style={{ color: '#666', textAlign: 'center' }}>No expenses today</p>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Description</th>
                  <th>Amount</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {todayExpenses.map((expense) => (
                  <tr key={expense.id}>
                    <td>{expense.category.replace('_', ' ')}</td>
                    <td>{expense.description || '-'}</td>
                    <td>{formatCurrency(expense.amount)}</td>
                    <td>
                      <button
                        className="btn btn-primary"
                        style={{ padding: '4px 8px', fontSize: '12px', marginRight: '5px' }}
                        onClick={() => handleEdit(expense)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-danger"
                        style={{ padding: '4px 8px', fontSize: '12px' }}
                        onClick={() => handleDelete(expense.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {todayExpenses.length > 0 && (
            <div style={{ marginTop: '15px', textAlign: 'right', fontWeight: 'bold' }}>
              Total: {formatCurrency(todayExpenses.reduce((sum, e) => sum + parseFloat(e.amount), 0))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

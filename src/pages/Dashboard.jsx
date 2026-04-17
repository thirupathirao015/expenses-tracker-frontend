import { useState, useEffect } from 'react';
import { expenseService } from '../services/expenseService';
import { authService } from '../services/authService';

const Dashboard = () => {
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
  
  // Salary edit state
  const [editingSalary, setEditingSalary] = useState(false);
  const [newSalary, setNewSalary] = useState('');
  const [salaryReason, setSalaryReason] = useState('');
  const [updatingSalary, setUpdatingSalary] = useState(false);

  const user = authService.getCurrentUser();
  
  // Get current month name
  const currentMonth = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

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
  }, []);

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

  const handleUpdateSalary = async (e) => {
    e.preventDefault();
    setUpdatingSalary(true);
    setError('');
    
    try {
      await expenseService.updateSalary(parseFloat(newSalary), salaryReason);
      setSuccess('Salary updated successfully!');
      setEditingSalary(false);
      setNewSalary('');
      setSalaryReason('');
      fetchDashboardData();
    } catch (err) {
      setError('Failed to update salary');
    } finally {
      setUpdatingSalary(false);
    }
  };

  const handleCancelSalaryEdit = () => {
    setEditingSalary(false);
    setNewSalary('');
    setSalaryReason('');
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
      {/* Current Month Display */}
      <div style={{ 
        background: '#e3f2fd', 
        padding: '10px 20px', 
        borderRadius: '8px', 
        marginBottom: '20px',
        textAlign: 'center',
        fontSize: '18px',
        fontWeight: 'bold',
        color: '#1976d2'
      }}>
        📅 Adding expenses for: {currentMonth}
      </div>

      {remainingData && (
        <div className="summary-cards">
          <div className="summary-card salary" style={{ position: 'relative' }}>
            <h3>Original Salary</h3>
            <div className="amount">{formatCurrency(remainingData.originalSalary)}</div>
            <button
              onClick={() => {
                setEditingSalary(true);
                setNewSalary(remainingData.originalSalary.toString());
              }}
              style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                padding: '4px 8px',
                fontSize: '12px',
                background: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              Edit
            </button>
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

      {/* Salary Edit Modal */}
      {editingSalary && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
        }}>
          <div style={{
            background: 'white',
            padding: '30px',
            borderRadius: '8px',
            width: '90%',
            maxWidth: '400px',
          }}>
            <h2 style={{ marginBottom: '20px' }}>Update Salary</h2>
            <form onSubmit={handleUpdateSalary}>
              <div className="form-group">
                <label htmlFor="new-salary">New Salary Amount (Rs)</label>
                <input
                  type="number"
                  id="new-salary"
                  className="form-control"
                  value={newSalary}
                  onChange={(e) => setNewSalary(e.target.value)}
                  required
                  min="0"
                  step="0.01"
                  placeholder="Enter new salary"
                />
              </div>

              <div className="form-group">
                <label htmlFor="salary-reason">Reason (Optional)</label>
                <input
                  type="text"
                  id="salary-reason"
                  className="form-control"
                  value={salaryReason}
                  onChange={(e) => setSalaryReason(e.target.value)}
                  placeholder="e.g., Bonus, Increment, Salary change"
                />
                <small style={{ color: '#666', fontSize: '12px' }}>
                  Add a note to remember why you updated the salary
                </small>
              </div>
              <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ flex: 1 }}
                  disabled={updatingSalary}
                >
                  {updatingSalary ? 'Updating...' : 'Update Salary'}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ flex: 1 }}
                  onClick={handleCancelSalaryEdit}
                  disabled={updatingSalary}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;

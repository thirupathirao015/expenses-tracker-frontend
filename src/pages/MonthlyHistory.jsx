import { useState, useEffect } from 'react';
import { expenseService } from '../services/expenseService';

const MonthlyHistory = () => {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [downloading, setDownloading] = useState(false);
  
  // Edit modal state
  const [editingExpense, setEditingExpense] = useState(null);
  const [editForm, setEditForm] = useState({
    amount: '',
    category: 'FOOD',
    description: '',
    expenseDate: '',
  });
  const [saving, setSaving] = useState(false);
  
  // Delete confirmation state
  const [deletingExpense, setDeletingExpense] = useState(null);
  const [deleting, setDeleting] = useState(false);
  
  const categories = [
    'ROOM_RENT', 'FOOD', 'CLOTHES', 'MOVIES', 'TRANSPORTATION',
    'UTILITIES', 'HEALTHCARE', 'EDUCATION', 'ENTERTAINMENT',
    'SHOPPING', 'TRAVEL', 'OTHER',
  ];

  const months = [
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' },
  ];

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

  useEffect(() => {
    fetchReport();
  }, [selectedYear, selectedMonth]);

  // Auto-clear success and error messages after 3 seconds
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        setSuccess('');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError('');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const fetchReport = async () => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      const data = await expenseService.getMonthlyReport(selectedYear, selectedMonth);
      setReport(data);
    } catch (err) {
      setError('Failed to load monthly report');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (expense) => {
    setDeletingExpense(expense);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingExpense) return;
    
    setDeleting(true);
    try {
      await expenseService.deleteExpense(deletingExpense.id);
      setSuccess('Expense deleted successfully!');
      setDeletingExpense(null);
      fetchReport();
    } catch (err) {
      setError('Failed to delete expense');
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeletingExpense(null);
  };

  const handleEdit = (expense) => {
    setEditingExpense(expense);
    setEditForm({
      amount: expense.amount.toString(),
      category: expense.category,
      description: expense.description || '',
      expenseDate: expense.expenseDate,
    });
  };

  const handleEditChange = (e) => {
    setEditForm({
      ...editForm,
      [e.target.name]: e.target.value,
    });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    
    try {
      const data = {
        ...editForm,
        amount: parseFloat(editForm.amount),
      };
      await expenseService.updateExpense(editingExpense.id, data);
      setSuccess('Expense updated successfully!');
      setEditingExpense(null);
      fetchReport();
    } catch (err) {
      setError('Failed to update expense');
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingExpense(null);
  };

  const handleDownloadPdf = async () => {
    try {
      setDownloading(true);
      await expenseService.downloadMonthlyPdf(selectedYear, selectedMonth);
    } catch (err) {
      setError('Failed to download PDF');
    } finally {
      setDownloading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  return (
    <div className="container">
      <h1 style={{ marginBottom: '20px' }}>Monthly History</h1>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {/* Month/Year Selector */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label htmlFor="month">Month</label>
            <select
              id="month"
              className="form-control"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
              style={{ minWidth: '150px' }}
            >
              {months.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label htmlFor="year">Year</label>
            <select
              id="year"
              className="form-control"
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              style={{ minWidth: '100px' }}
            >
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>

          <button
            className="btn btn-success"
            onClick={handleDownloadPdf}
            disabled={downloading || !report}
            style={{ marginTop: '24px' }}
          >
            {downloading ? 'Downloading...' : 'Export PDF'}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="card">Loading...</div>
      ) : report ? (
        <>
          {/* Summary Section */}
          <div className="summary-cards">
            <div className="summary-card salary">
              <h3>Original Salary</h3>
              <div className="amount">{formatCurrency(report.originalSalary)}</div>
            </div>
            <div className="summary-card expenses">
              <h3>Total Spent</h3>
              <div className="amount">{formatCurrency(report.totalSpent)}</div>
            </div>
            <div className="summary-card remaining">
              <h3>Amount Saved</h3>
              <div className="amount">{formatCurrency(report.amountSaved)}</div>
            </div>
            <div className="summary-card" style={{ background: '#e3f2fd' }}>
              <h3>Savings %</h3>
              <div className="amount" style={{ color: '#1976d2' }}>
                {report.savingsPercentage}%
              </div>
            </div>
          </div>

          {/* Expense Details */}
          <div className="card">
            <h2 style={{ marginBottom: '20px' }}>Expense Details</h2>
            {report.expenses.length === 0 ? (
              <p style={{ color: '#666', textAlign: 'center' }}>
                No expenses found for this month
              </p>
            ) : (
              <table className="table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Category</th>
                    <th>Description</th>
                    <th>Amount</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {report.expenses.map((expense) => (
                    <tr key={expense.id}>
                      <td>{new Date(expense.expenseDate).toLocaleDateString()}</td>
                      <td>{expense.category.replace(/_/g, ' ')}</td>
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
                          onClick={() => handleDeleteClick(expense)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                  <tr style={{ fontWeight: 'bold', backgroundColor: '#f5f5f5' }}>
                    <td colSpan="3" style={{ textAlign: 'right' }}>Total:</td>
                    <td>{formatCurrency(report.totalSpent)}</td>
                    <td></td>
                  </tr>
                </tbody>
              </table>
            )}
          </div>
        </>
      ) : null}

      {/* Edit Modal */}
      {editingExpense && (
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
            maxWidth: '500px',
            maxHeight: '90vh',
            overflow: 'auto',
          }}>
            <h2 style={{ marginBottom: '20px' }}>Edit Expense</h2>
            <form onSubmit={handleEditSubmit}>
              <div className="form-group">
                <label htmlFor="edit-amount">Amount (Rs)</label>
                <input
                  type="number"
                  id="edit-amount"
                  name="amount"
                  className="form-control"
                  value={editForm.amount}
                  onChange={handleEditChange}
                  required
                  min="0.01"
                  step="0.01"
                />
              </div>

              <div className="form-group">
                <label htmlFor="edit-category">Category</label>
                <select
                  id="edit-category"
                  name="category"
                  className="form-control"
                  value={editForm.category}
                  onChange={handleEditChange}
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
                <label htmlFor="edit-description">Description</label>
                <input
                  type="text"
                  id="edit-description"
                  name="description"
                  className="form-control"
                  value={editForm.description}
                  onChange={handleEditChange}
                  placeholder="Optional description"
                />
              </div>

              <div className="form-group">
                <label htmlFor="edit-expenseDate">Date</label>
                <input
                  type="date"
                  id="edit-expenseDate"
                  name="expenseDate"
                  className="form-control"
                  value={editForm.expenseDate}
                  onChange={handleEditChange}
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ flex: 1 }}
                  disabled={saving}
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ flex: 1 }}
                  onClick={handleCancelEdit}
                  disabled={saving}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingExpense && (
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
            textAlign: 'center',
          }}>
            <h3 style={{ marginBottom: '15px', color: '#dc3545' }}>Confirm Delete</h3>
            <p style={{ marginBottom: '20px', fontSize: '16px' }}>
              Are you sure you want to delete this expense?
            </p>
            <div style={{
              background: '#f8f9fa',
              padding: '15px',
              borderRadius: '4px',
              marginBottom: '20px',
              textAlign: 'left',
            }}>
              <p><strong>Category:</strong> {deletingExpense.category.replace(/_/g, ' ')}</p>
              <p><strong>Description:</strong> {deletingExpense.description || '-'}</p>
              <p><strong>Amount:</strong> {formatCurrency(deletingExpense.amount)}</p>
              <p><strong>Date:</strong> {new Date(deletingExpense.expenseDate).toLocaleDateString()}</p>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                className="btn btn-danger"
                style={{ flex: 1 }}
                onClick={handleDeleteConfirm}
                disabled={deleting}
              >
                {deleting ? 'Deleting...' : 'Yes, Delete'}
              </button>
              <button
                className="btn btn-secondary"
                style={{ flex: 1 }}
                onClick={handleDeleteCancel}
                disabled={deleting}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MonthlyHistory;

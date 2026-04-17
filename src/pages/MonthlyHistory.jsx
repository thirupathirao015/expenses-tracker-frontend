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

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this expense?')) {
      return;
    }
    
    try {
      await expenseService.deleteExpense(id);
      setSuccess('Expense deleted successfully!');
      fetchReport();
    } catch (err) {
      setError('Failed to delete expense');
    }
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

          {/* Category Breakdown */}
          {Object.keys(report.categoryBreakdown).length > 0 && (
            <div className="card" style={{ marginBottom: '20px' }}>
              <h2 style={{ marginBottom: '20px' }}>Category Breakdown</h2>
              <table className="table">
                <thead>
                  <tr>
                    <th>Category</th>
                    <th>Amount</th>
                    <th>Percentage</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(report.categoryBreakdown)
                    .sort((a, b) => b[1] - a[1])
                    .map(([category, amount]) => (
                      <tr key={category}>
                        <td>{category.replace(/_/g, ' ')}</td>
                        <td>{formatCurrency(amount)}</td>
                        <td>
                          {report.totalSpent > 0
                            ? ((amount / report.totalSpent) * 100).toFixed(1)
                            : 0}
                          %
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}

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
          </div>
        </>
      ) : null}
    </div>
  );
};

export default MonthlyHistory;

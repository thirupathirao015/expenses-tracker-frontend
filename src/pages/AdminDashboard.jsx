import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminService } from '../services/adminService';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [adminKey, setAdminKey] = useState('');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [expenseCounts, setExpenseCounts] = useState({});
  
  // Delete modal states
  const [deletingUser, setDeletingUser] = useState(null);
  const [deletingMonth, setDeletingMonth] = useState(null);
  const [deletingAllMonths, setDeletingAllMonths] = useState(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [deleting, setDeleting] = useState(false);

  const months = [
    { value: 1, label: 'January' }, { value: 2, label: 'February' },
    { value: 3, label: 'March' }, { value: 4, label: 'April' },
    { value: 5, label: 'May' }, { value: 6, label: 'June' },
    { value: 7, label: 'July' }, { value: 8, label: 'August' },
    { value: 9, label: 'September' }, { value: 10, label: 'October' },
    { value: 11, label: 'November' }, { value: 12, label: 'December' },
  ];

  useEffect(() => {
    const key = sessionStorage.getItem('adminKey');
    if (!key) {
      navigate('/admin');
      return;
    }
    setAdminKey(key);
    fetchUsers(key);
  }, [navigate]);

  const fetchUsers = async (key) => {
    try {
      setLoading(true);
      const data = await adminService.getAllUsers(key);
      setUsers(data);
      
      // Fetch expense counts for each user
      const counts = {};
      for (const user of data) {
        try {
          const count = await adminService.getUserExpenseCount(key, user.id);
          counts[user.id] = count;
        } catch (e) {
          counts[user.id] = 0;
        }
      }
      setExpenseCounts(counts);
    } catch (err) {
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('adminKey');
    navigate('/admin');
  };

  const handleDeleteUser = async () => {
    if (!deletingUser) return;
    
    setDeleting(true);
    try {
      await adminService.deleteUser(adminKey, deletingUser.id);
      setSuccess(`User ${deletingUser.email} deleted successfully`);
      setDeletingUser(null);
      fetchUsers(adminKey);
    } catch (err) {
      setError('Failed to delete user');
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteMonthExpenses = async () => {
    if (!deletingMonth) return;
    
    setDeleting(true);
    try {
      await adminService.deleteUserMonthExpenses(adminKey, deletingMonth.id, selectedYear, selectedMonth);
      setSuccess(`Expenses for ${deletingMonth.email} for ${selectedYear}-${selectedMonth} deleted successfully`);
      setDeletingMonth(null);
      fetchUsers(adminKey);
    } catch (err) {
      setError('Failed to delete expenses');
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteAllMonths = async () => {
    if (!deletingAllMonths) return;
    
    setDeleting(true);
    try {
      await adminService.deleteUserAllExpenses(adminKey, deletingAllMonths.id);
      setSuccess(`All expenses for ${deletingAllMonths.email} deleted successfully`);
      setDeletingAllMonths(null);
      fetchUsers(adminKey);
    } catch (err) {
      setError('Failed to delete all expenses');
    } finally {
      setDeleting(false);
    }
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>👨‍💼 Admin Dashboard</h1>
        <button className="btn btn-secondary" onClick={handleLogout}>
          Logout
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="card">
        <h2 style={{ marginBottom: '20px' }}>Registered Users ({users.length})</h2>
        
        {users.length === 0 ? (
          <p>No users registered yet</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Salary</th>
                <th>Expenses</th>
                <th>Registered</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{formatCurrency(user.salary)}</td>
                  <td>{expenseCounts[user.id] || 0}</td>
                  <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                  <td>
                    <button
                      style={{ 
                        padding: '6px 12px', 
                        fontSize: '12px', 
                        marginRight: '8px',
                        fontWeight: '600',
                        backgroundColor: '#e3f2fd',
                        color: '#1976d2',
                        border: '1px solid #1976d2',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                      onClick={() => setDeletingMonth(user)}
                      onMouseOver={(e) => { e.target.style.backgroundColor = '#1976d2'; e.target.style.color = '#fff'; }}
                      onMouseOut={(e) => { e.target.style.backgroundColor = '#e3f2fd'; e.target.style.color = '#1976d2'; }}
                    >
                      📅 Delete Month
                    </button>
                    <button
                      style={{ 
                        padding: '6px 12px', 
                        fontSize: '12px', 
                        marginRight: '8px',
                        fontWeight: '600',
                        backgroundColor: '#fff3e0',
                        color: '#f57c00',
                        border: '1px solid #f57c00',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                      onClick={() => setDeletingAllMonths(user)}
                      onMouseOver={(e) => { e.target.style.backgroundColor = '#f57c00'; e.target.style.color = '#fff'; }}
                      onMouseOut={(e) => { e.target.style.backgroundColor = '#fff3e0'; e.target.style.color = '#f57c00'; }}
                    >
                      📊 Delete All Months
                    </button>
                    <button
                      style={{ 
                        padding: '6px 12px', 
                        fontSize: '12px',
                        fontWeight: '600',
                        backgroundColor: '#ffebee',
                        color: '#d32f2f',
                        border: '1px solid #d32f2f',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                      onClick={() => setDeletingUser(user)}
                      onMouseOver={(e) => { e.target.style.backgroundColor = '#d32f2f'; e.target.style.color = '#fff'; }}
                      onMouseOut={(e) => { e.target.style.backgroundColor = '#ffebee'; e.target.style.color = '#d32f2f'; }}
                    >
                      🗑️ Delete User
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Delete User Confirmation Modal */}
      {deletingUser && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex',
          justifyContent: 'center', alignItems: 'center', zIndex: 1000,
        }}>
          <div style={{
            background: 'white', padding: '30px', borderRadius: '8px',
            width: '90%', maxWidth: '400px', textAlign: 'center',
          }}>
            <h3 style={{ color: '#dc3545', marginBottom: '15px' }}>⚠️ Delete User</h3>
            <p style={{ marginBottom: '20px' }}>
              Are you sure you want to delete <strong>{deletingUser.name}</strong> ({deletingUser.email})?
            </p>
            <p style={{ color: '#dc3545', fontSize: '14px', marginBottom: '20px' }}>
              This will delete the user and ALL their expense data. This cannot be undone!
            </p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                className="btn btn-danger"
                style={{ flex: 1 }}
                onClick={handleDeleteUser}
                disabled={deleting}
              >
                {deleting ? 'Deleting...' : 'Yes, Delete User'}
              </button>
              <button
                className="btn btn-secondary"
                style={{ flex: 1 }}
                onClick={() => setDeletingUser(null)}
                disabled={deleting}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Month Expenses Modal */}
      {deletingMonth && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex',
          justifyContent: 'center', alignItems: 'center', zIndex: 1000,
        }}>
          <div style={{
            background: 'white', padding: '30px', borderRadius: '8px',
            width: '90%', maxWidth: '400px',
          }}>
            <h3 style={{ marginBottom: '15px' }}>Delete Month Expenses</h3>
            <p style={{ marginBottom: '20px' }}>
              Delete expenses for <strong>{deletingMonth.name}</strong> ({deletingMonth.email})
            </p>
            
            <div className="form-group">
              <label>Year</label>
              <input
                type="number"
                className="form-control"
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              />
            </div>
            
            <div className="form-group">
              <label>Month</label>
              <select
                className="form-control"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
              >
                {months.map((m) => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button
                className="btn btn-danger"
                style={{ flex: 1 }}
                onClick={handleDeleteMonthExpenses}
                disabled={deleting}
              >
                {deleting ? 'Deleting...' : 'Delete Expenses'}
              </button>
              <button
                className="btn btn-secondary"
                style={{ flex: 1 }}
                onClick={() => setDeletingMonth(null)}
                disabled={deleting}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete All Months Confirmation Modal */}
      {deletingAllMonths && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex',
          justifyContent: 'center', alignItems: 'center', zIndex: 1000,
        }}>
          <div style={{
            background: 'white', padding: '30px', borderRadius: '8px',
            width: '90%', maxWidth: '400px', textAlign: 'center',
          }}>
            <h3 style={{ color: '#ff9800', marginBottom: '15px' }}>⚠️ Delete All Expenses</h3>
            <p style={{ marginBottom: '20px' }}>
              Are you sure you want to delete <strong>ALL</strong> expenses for <strong>{deletingAllMonths.name}</strong>?
            </p>
            <p style={{ color: '#ff9800', fontSize: '14px', marginBottom: '20px' }}>
              This will delete all expense data across all months for this user. This cannot be undone!
            </p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                className="btn btn-warning"
                style={{ flex: 1, backgroundColor: '#ff9800', borderColor: '#ff9800' }}
                onClick={handleDeleteAllMonths}
                disabled={deleting}
              >
                {deleting ? 'Deleting...' : 'Yes, Delete All'}
              </button>
              <button
                className="btn btn-secondary"
                style={{ flex: 1 }}
                onClick={() => setDeletingAllMonths(null)}
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

export default AdminDashboard;

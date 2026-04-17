import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import PrivateRoute from './components/PrivateRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import MonthlyHistory from './pages/MonthlyHistory';
import { authService } from './services/authService';

const Home = () => {
  const isAuthenticated = authService.isAuthenticated();
  return isAuthenticated ? <Navigate to="/dashboard" /> : <Navigate to="/login" />;
};

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/history"
          element={
            <PrivateRoute>
              <MonthlyHistory />
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;

import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow px-6 py-4 flex justify-between items-center">
      <Link to="/" className="text-xl font-bold text-blue-600">InterviewIQ</Link>

      <div className="flex items-center gap-4">
        {isAuthenticated ? (
          <>
            <span className="text-gray-600">Hi, {user?.name}</span>
            <Link to="/dashboard" className="text-gray-700 hover:text-blue-600">Dashboard</Link>
            <button
              onClick={handleLogout}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="text-gray-700 hover:text-blue-600">Login</Link>
            <Link to="/signup" className="text-gray-700 hover:text-blue-600">Signup</Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
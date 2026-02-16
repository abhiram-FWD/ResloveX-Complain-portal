import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const Navbar = () => {
  const { user, logout } = useAuth();
  
  return (
    <nav className="bg-white shadow">
      {/* Placeholder Navbar */}
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/" className="text-xl font-bold">Complain Portal</Link>
        <div className="space-x-4">
          <Link to="/" className="text-gray-600 hover:text-gray-900">Home</Link>
          <Link to="/track" className="text-gray-600 hover:text-gray-900">Track</Link>
          <Link to="/dashboard/public" className="text-gray-600 hover:text-gray-900">Stats</Link>
          
          {user ? (
            <>
              {user.role === 'citizen' && (
                <Link to="/dashboard/citizen" className="text-blue-600">Dashboard</Link>
              )}
              {user.role === 'authority' && (
                <Link to="/dashboard/authority" className="text-blue-600">Authority Panel</Link>
              )}
              <button onClick={logout} className="text-red-600">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-blue-600">Login</Link>
              <Link to="/register" className="bg-blue-600 text-white px-4 py-2 rounded">Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};
export default Navbar;

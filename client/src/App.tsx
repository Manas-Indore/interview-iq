import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';

function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 gap-4">
      <h1 className="text-4xl font-bold text-blue-600">InterviewIQ 🚀</h1>
      <div className="flex gap-4">
        <Link to="/login" className="text-blue-500 underline">Login</Link>
        <Link to="/signup" className="text-blue-500 underline">Signup</Link>
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
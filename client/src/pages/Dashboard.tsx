import { Link } from 'react-router-dom';

function Dashboard() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 gap-4">
      <h1 className="text-3xl font-bold">Dashboard (Protected)</h1>
      <Link to="/upload-resume" className="text-blue-500 underline">
        Upload Resume
      </Link>
    </div>
  );
}

export default Dashboard;
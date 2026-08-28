import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';

function InterviewSummary() {
  const { sessionId } = useParams();
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    api.get(`/interview/${sessionId}`).then(res => setSession(res.data.session));
  }, [sessionId]);

  if (!session) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-2">Interview Complete 🎉</h2>
        <p className="text-gray-500 mb-6">Here's a summary of your responses</p>

        <div className="space-y-4">
          {session.answers.map((a: any, idx: number) => (
            <div key={idx} className="border-b pb-4">
              <p className="font-medium">{idx + 1}. {a.question}</p>
              <p className="text-sm text-gray-600 mt-1">
                <strong>Your answer:</strong> {a.userAnswer || 'Not answered'}
              </p>
            </div>
          ))}
        </div>

        <Link to="/dashboard" className="inline-block mt-6 text-blue-500 underline">
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}

export default InterviewSummary;
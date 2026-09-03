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

  const evaluation = session.evaluation;

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-2">Interview Complete 🎉</h2>

        {evaluation && (
          <div className="bg-blue-50 p-4 rounded mb-6">
            <p className="text-lg font-semibold">
              Overall Score: {evaluation.overall_score}/10
            </p>
            <p className="text-sm text-gray-700 mt-1">{evaluation.overall_feedback}</p>
          </div>
        )}

        <div className="space-y-4">
          {session.answers.map((a: any, idx: number) => {
            const evalItem = evaluation?.evaluations?.[idx];
            return (
              <div key={idx} className="border-b pb-4">
                <p className="font-medium">{idx + 1}. {a.question}</p>
                <p className="text-sm text-gray-600 mt-1">
                  <strong>Your answer:</strong> {a.userAnswer || 'Not answered'}
                </p>

                {evalItem && (
                  <div className="mt-2 bg-gray-50 p-3 rounded text-sm space-y-1">
                    <p><strong>Score:</strong> {evalItem.score}/10</p>
                    <p><strong>Strengths:</strong> {evalItem.strengths}</p>
                    <p><strong>Improvements:</strong> {evalItem.improvements}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <Link to="/dashboard" className="inline-block mt-6 text-blue-500 underline">
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}

export default InterviewSummary;
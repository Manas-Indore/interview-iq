import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';

interface Answer {
  question: string;
  category: string;
  difficulty: string;
  userAnswer: string;
}

interface Session {
  _id: string;
  answers: Answer[];
  status: string;
}

function Interview() {
  const { sessionId } = useParams();
  const navigate = useNavigate();

  const [session, setSession] = useState<Session | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSession();
  }, [sessionId]);

  const fetchSession = async () => {
    try {
      const res = await api.get(`/interview/${sessionId}`);
      setSession(res.data.session);
      // Find first unanswered question, or start at 0
      const firstUnanswered = res.data.session.answers.findIndex((a: Answer) => !a.userAnswer);
      setCurrentIndex(firstUnanswered === -1 ? 0 : firstUnanswered);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleNext = async () => {
    if (!session) return;
    setSaving(true);

    try {
      // Save current answer
      await api.post('/interview/answer', {
        sessionId: session._id,
        questionIndex: currentIndex,
        answer: currentAnswer
      });

      if (currentIndex < session.answers.length - 1) {
        // Move to next question
        const nextIndex = currentIndex + 1;
        setCurrentIndex(nextIndex);
        setCurrentAnswer(session.answers[nextIndex].userAnswer || '');
      } else {
        // Last question — complete the interview
        await api.post('/interview/complete', { sessionId: session._id });
        navigate(`/interview/${session._id}/summary`);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!session) return <div className="min-h-screen flex items-center justify-center">Session not found</div>;

  const currentQuestion = session.answers[currentIndex];
  const isLastQuestion = currentIndex === session.answers.length - 1;

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-2xl">
        <div className="flex justify-between items-center mb-4">
          <span className="text-sm text-gray-500">
            Question {currentIndex + 1} of {session.answers.length}
          </span>
          <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded">
            {currentQuestion.category} • {currentQuestion.difficulty}
          </span>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all"
            style={{ width: `${((currentIndex + 1) / session.answers.length) * 100}%` }}
          />
        </div>

        <h2 className="text-xl font-semibold mb-4">{currentQuestion.question}</h2>

        <textarea
          value={currentAnswer}
          onChange={(e) => setCurrentAnswer(e.target.value)}
          placeholder="Type your answer here..."
          rows={6}
          className="w-full border rounded p-3 mb-4"
        />

        <button
          onClick={handleNext}
          disabled={saving}
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? 'Saving...' : isLastQuestion ? 'Finish Interview' : 'Next Question'}
        </button>
      </div>
    </div>
  );
}

export default Interview;
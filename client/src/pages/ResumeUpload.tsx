import { useState } from 'react';
import api from '../api/axios';

function ResumeUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setResult(null);
      setError('');
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file first');
      return;
    }

    setLoading(true);
    setError('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await api.post('/resume/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setResult(res.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-xl">
        <h2 className="text-2xl font-bold mb-6">Upload Your Resume</h2>

        <input
          type="file"
          accept=".pdf,.docx"
          onChange={handleFileChange}
          className="mb-4"
        />

        <button
          onClick={handleUpload}
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Uploading...' : 'Upload Resume'}
        </button>

        {error && (
          <p className="bg-red-100 text-red-600 text-sm p-2 rounded mt-4">{error}</p>
        )}

        {result && (
          <div className="mt-6 space-y-6">
          <p className="text-green-600 font-semibold">{result.message}</p>

          <div>
            <h3 className="font-semibold mb-2">Extracted Skills</h3>
            <div className="bg-gray-50 p-4 rounded text-sm">
              <p><strong>Technical:</strong> {result.resume.skills.technical_skills.join(', ')}</p>
              <p><strong>Soft Skills:</strong> {result.resume.skills.soft_skills.join(', ') || 'None detected'}</p>
              <p><strong>Experience:</strong> {result.resume.skills.experience_summary}</p>
              <p><strong>Projects:</strong> {result.resume.skills.projects.join(', ')}</p>
            </div>
          </div>

          <div>
          <h3 className="font-semibold mb-2">Generated Interview Questions</h3>
          <div className="space-y-3">
            {result.resume.questions.map((q: any, idx: number) => (
            <div key={idx} className="bg-gray-50 p-3 rounded text-sm">
              <p className="font-medium">{idx + 1}. {q.question}</p>
              <p className="text-gray-500 text-xs mt-1">
                {q.category} • {q.difficulty}
              </p>
          </div>
        ))}
      </div>
    </div>
  </div>
        )} 
      </div>
    </div>
  );
}

export default ResumeUpload;
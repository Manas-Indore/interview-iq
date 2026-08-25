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
          <div className="mt-6">
            <p className="text-green-600 font-semibold mb-2">{result.message}</p>
            <p className="text-sm text-gray-500 mb-2">Filename: {result.resume.filename}</p>
            <div className="bg-gray-50 p-4 rounded max-h-64 overflow-y-auto text-sm whitespace-pre-wrap">
              {result.resume.extractedText}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ResumeUpload;
'use client';

import { useEffect, useState } from 'react';
import { FileText, Plus, Trash2, CheckCircle, Loader2 } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { resumeApi } from '@/lib/api/profile';

export default function ResumePage() {
  const [resumes, setResumes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [name, setName] = useState('My Resume');
  const [text, setText] = useState('');
  const [error, setError] = useState('');

  const loadResumes = () => {
    resumeApi.list().then(setResumes).finally(() => setLoading(false));
  };

  useEffect(() => { loadResumes(); }, []);

  const handleSubmit = async () => {
    if (!text.trim()) return;
    setSubmitting(true);
    setError('');
    try {
      await resumeApi.create({ name, rawText: text });
      setText('');
      setName('My Resume');
      setShowForm(false);
      loadResumes();
    } catch (e: any) {
      setError(e.response?.data?.message || 'Failed to save resume');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSetActive = async (id: string) => {
    await resumeApi.setActive(id);
    loadResumes();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this resume?')) return;
    await resumeApi.remove(id);
    loadResumes();
  };

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-3xl p-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Resume</h1>
            <p className="text-gray-600">AI analyzes your resume to generate tailored interview questions.</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
          >
            <Plus className="h-4 w-4" />
            Add resume
          </button>
        </div>

        {showForm && (
          <div className="mb-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 font-semibold text-gray-900">Paste your resume</h2>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Resume name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Resume text</label>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={12}
                placeholder="Paste your resume content here..."
                className="block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none font-mono"
              />
            </div>
            {error && <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>}
            <div className="flex gap-3">
              <button
                onClick={handleSubmit}
                disabled={!text.trim() || submitting}
                className="flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
              >
                {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                Save & analyze
              </button>
              <button onClick={() => setShowForm(false)} className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                Cancel
              </button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-brand-600" />
          </div>
        ) : resumes.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-gray-200 p-12 text-center">
            <FileText className="mx-auto h-10 w-10 text-gray-300" />
            <p className="mt-2 font-medium text-gray-600">No resumes yet</p>
            <p className="text-sm text-gray-400">Add your first resume to get tailored interview questions.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {resumes.map((r) => (
              <div key={r.id} className={`rounded-2xl border p-5 ${r.isActive ? 'border-brand-300 bg-brand-50' : 'border-gray-200 bg-white'} shadow-sm`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText className={`h-5 w-5 ${r.isActive ? 'text-brand-600' : 'text-gray-400'}`} />
                    <div>
                      <p className="font-semibold text-gray-900">{r.name}</p>
                      <p className="text-xs text-gray-500">
                        {r.parsedSkills?.slice(0, 5).join(', ') || 'No skills parsed'} · {new Date(r.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {r.isActive ? (
                      <span className="flex items-center gap-1 rounded-full bg-brand-100 px-3 py-1 text-xs font-semibold text-brand-700">
                        <CheckCircle className="h-3 w-3" /> Active
                      </span>
                    ) : (
                      <button onClick={() => handleSetActive(r.id)} className="text-xs font-medium text-brand-600 hover:underline">
                        Set active
                      </button>
                    )}
                    <button onClick={() => handleDelete(r.id)} className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { FileText, Plus, Trash2, CheckCircle } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import { resumeApi } from '@/lib/api/profile';
import { relativeTime } from '@/lib/utils';

export default function ResumePage() {
  const [resumes, setResumes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState('My Resume');
  const [text, setText] = useState('');
  const [error, setError] = useState('');

  const load = () => resumeApi.list().then(setResumes).catch(() => {}).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const handleSave = async () => {
    if (!text.trim()) return;
    setSaving(true);
    setError('');
    try {
      await resumeApi.create({ name, rawText: text });
      setName('My Resume');
      setText('');
      setShowForm(false);
      load();
    } catch (e: any) {
      setError(e.response?.data?.message || 'Failed to save resume.');
    } finally {
      setSaving(false);
    }
  };

  const handleSetActive = async (id: string) => { await resumeApi.setActive(id); load(); };
  const handleDelete    = async (id: string) => {
    if (!confirm('Delete this resume?')) return;
    await resumeApi.remove(id); load();
  };

  return (
    <DashboardLayout
      pageTitle="Resume"
      pageDescription="AI analyses your resume to generate targeted interview questions."
      actions={
        <Button size="sm" onClick={() => setShowForm((s) => !s)}>
          <Plus className="h-3.5 w-3.5" />
          Add resume
        </Button>
      }
    >
      <div className="mx-auto max-w-2xl space-y-5">
        {/* Add form */}
        {showForm && (
          <div className="card p-5 animate-fade-in">
            <h2 className="mb-4 text-sm font-semibold text-neutral-900">Paste your resume</h2>
            <div className="space-y-4">
              <Input
                label="Resume name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <Textarea
                label="Resume content"
                hint="Paste the full text of your resume. The more detail, the better your questions."
                rows={14}
                placeholder="John Doe\nSenior Software Engineer\n\nExperience:\n..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="font-mono text-xs"
              />
              {error && (
                <div className="rounded-md border border-danger-100 bg-danger-50 px-4 py-3 text-sm text-danger-600">
                  {error}
                </div>
              )}
              <div className="flex gap-2">
                <Button onClick={handleSave} disabled={!text.trim()} loading={saving}>
                  {saving ? 'Analysing…' : 'Save & analyse'}
                </Button>
                <Button variant="secondary" onClick={() => setShowForm(false)}>Cancel</Button>
              </div>
            </div>
          </div>
        )}

        {/* List */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => <div key={i} className="h-20 animate-pulse rounded-xl bg-neutral-100" />)}
          </div>
        ) : resumes.length === 0 && !showForm ? (
          <EmptyState
            icon={FileText}
            title="No resumes yet"
            description="Add your resume and NextRound will tailor every interview question to your actual experience."
            action={{ label: 'Add resume', onClick: () => setShowForm(true) }}
          />
        ) : (
          <div className="space-y-3">
            {resumes.map((r) => (
              <div
                key={r.id}
                className={`card flex items-center gap-4 p-4 transition-all ${r.isActive ? 'border-plum-300 bg-plum-50/40' : ''}`}
              >
                <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl ${r.isActive ? 'bg-plum-900' : 'bg-neutral-100'}`}>
                  <FileText className={`h-5 w-5 ${r.isActive ? 'text-white' : 'text-neutral-400'}`} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-semibold text-neutral-900">{r.name}</p>
                    {r.isActive && <Badge variant="plum" size="sm" dot>Active</Badge>}
                  </div>
                  <p className="mt-0.5 truncate text-xs text-neutral-500">
                    {r.parsedSkills?.slice(0, 5).join(', ') || 'Skills not extracted yet'} · {relativeTime(r.createdAt)}
                  </p>
                </div>
                <div className="flex flex-shrink-0 items-center gap-2">
                  {!r.isActive && (
                    <button
                      onClick={() => handleSetActive(r.id)}
                      className="text-xs font-medium text-plum-900 hover:text-plum-dark transition-colors"
                    >
                      Set active
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(r.id)}
                    className="rounded-lg p-1.5 text-neutral-400 hover:bg-danger-50 hover:text-danger-600 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

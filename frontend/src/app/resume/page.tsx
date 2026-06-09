'use client';

import { useEffect, useRef, useState } from 'react';
import { FileText, Plus, Trash2, Upload } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import { resumeApi } from '@/lib/api/profile';
import { relativeTime } from '@/lib/utils';

type Mode = 'upload' | 'paste';

export default function ResumePage() {
  const [resumes, setResumes]   = useState<any[]>([]);
  const [loading, setLoading]   = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [mode, setMode]         = useState<Mode>('upload');
  const [saving, setSaving]     = useState(false);
  const [name, setName]         = useState('');
  const [text, setText]         = useState('');
  const [file, setFile]         = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError]       = useState('');
  const fileInputRef            = useRef<HTMLInputElement>(null);

  const load = () =>
    resumeApi.list().then(setResumes).catch(() => {}).finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  const resetForm = () => {
    setName('');
    setText('');
    setFile(null);
    setError('');
    setMode('upload');
    setShowForm(false);
  };

  const handleFile = (f: File) => {
    setFile(f);
    if (!name) setName(f.name.replace(/\.[^.]+$/, ''));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      if (mode === 'upload') {
        if (!file) return;
        await resumeApi.upload(file, name || undefined);
      } else {
        if (!text.trim()) return;
        await resumeApi.create({ name: name || 'My Resume', rawText: text });
      }
      resetForm();
      load();
    } catch (e: any) {
      setError(e.response?.data?.message || 'Failed to save resume.');
    } finally {
      setSaving(false);
    }
  };

  const canSave = mode === 'upload' ? !!file : !!text.trim();

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
        {showForm && (
          <div className="card p-5 animate-fade-in">
            {/* Mode tabs */}
            <div className="mb-5 flex gap-1 rounded-lg bg-neutral-100 p-1">
              {(['upload', 'paste'] as Mode[]).map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={`flex-1 rounded-md py-1.5 text-xs font-medium transition-colors ${
                    mode === m
                      ? 'bg-white text-neutral-900 shadow-sm'
                      : 'text-neutral-500 hover:text-neutral-700'
                  }`}
                >
                  {m === 'upload' ? 'Upload file' : 'Paste text'}
                </button>
              ))}
            </div>

            <div className="space-y-4">
              <Input
                label="Resume name"
                placeholder={mode === 'upload' ? 'Auto-filled from filename' : 'My Resume'}
                value={name}
                onChange={(e) => setName(e.target.value)}
              />

              {mode === 'upload' ? (
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.doc,.docx,.txt"
                    className="hidden"
                    onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                  />
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={handleDrop}
                    className={`flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-6 py-10 transition-colors ${
                      dragOver
                        ? 'border-plum-400 bg-plum-50'
                        : file
                        ? 'border-plum-300 bg-plum-50/40'
                        : 'border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50'
                    }`}
                  >
                    {file ? (
                      <>
                        <FileText className="h-8 w-8 text-plum-600" />
                        <div className="text-center">
                          <p className="text-sm font-medium text-neutral-900">{file.name}</p>
                          <p className="text-xs text-neutral-500">{(file.size / 1024).toFixed(0)} KB</p>
                        </div>
                        <button
                          onClick={(e) => { e.stopPropagation(); setFile(null); setName(''); }}
                          className="text-xs text-neutral-400 hover:text-danger-600 transition-colors"
                        >
                          Remove
                        </button>
                      </>
                    ) : (
                      <>
                        <Upload className="h-8 w-8 text-neutral-300" />
                        <div className="text-center">
                          <p className="text-sm font-medium text-neutral-700">Drop your resume here</p>
                          <p className="text-xs text-neutral-400">PDF, Word, or .txt · max 5 MB</p>
                        </div>
                        <Button size="sm" variant="secondary" onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}>
                          Browse files
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ) : (
                <Textarea
                  label="Resume content"
                  hint="Paste the full text of your resume. The more detail, the better your questions."
                  rows={14}
                  placeholder="John Doe&#10;Senior Software Engineer&#10;&#10;Experience:&#10;..."
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  className="font-mono text-xs"
                />
              )}

              {error && (
                <div className="rounded-md border border-danger-100 bg-danger-50 px-4 py-3 text-sm text-danger-600">
                  {error}
                </div>
              )}

              <div className="flex gap-2">
                <Button onClick={handleSave} disabled={!canSave} loading={saving}>
                  {saving ? 'Analysing…' : 'Save & analyse'}
                </Button>
                <Button variant="secondary" onClick={resetForm}>Cancel</Button>
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => <div key={i} className="h-20 animate-pulse rounded-xl bg-neutral-100" />)}
          </div>
        ) : resumes.length === 0 && !showForm ? (
          <EmptyState
            icon={FileText}
            title="No resumes yet"
            description="Upload your resume and NextRound will tailor every interview question to your actual experience."
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
                    {r.fileName ? `${r.fileName} · ` : ''}
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

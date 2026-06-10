'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, Plus, Trash2, ExternalLink, Pencil, Check, X, Sparkles, AlertTriangle, BarChart2, CheckCircle, AlertCircle, Lightbulb } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { jobsApi } from '@/lib/api/profile';

// ── Constants ──────────────────────────────────────────────────────────────

const JOB_STATUSES = [
  { value: 'INTERESTED',    label: 'Interested',     color: 'bg-neutral-100 text-neutral-600' },
  { value: 'APPLIED',       label: 'Applied',        color: 'bg-blue-100 text-blue-700' },
  { value: 'PHONE_SCREEN',  label: 'Phone Screen',   color: 'bg-amber-100 text-amber-700' },
  { value: 'INTERVIEWING',  label: 'Interviewing',   color: 'bg-plum-100 text-plum-700' },
  { value: 'OFFER_RECEIVED',label: 'Offer Received', color: 'bg-green-100 text-green-700' },
  { value: 'ACCEPTED',      label: 'Accepted',       color: 'bg-green-200 text-green-800' },
  { value: 'REJECTED',      label: 'Rejected',       color: 'bg-red-100 text-red-600' },
  { value: 'WITHDRAWN',     label: 'Withdrawn',      color: 'bg-neutral-200 text-neutral-500' },
] as const;

const INTERVIEW_TYPES = [
  { value: 'RECRUITER_SCREEN', label: 'Recruiter Screen' },
  { value: 'HIRING_MANAGER',   label: 'Hiring Manager' },
  { value: 'TECHNICAL',        label: 'Technical' },
  { value: 'BEHAVIORAL',       label: 'Behavioral' },
  { value: 'GENERAL',          label: 'General / Unknown' },
] as const;

const INTERVIEW_STATUSES = [
  { value: 'SCHEDULED',  label: 'Scheduled' },
  { value: 'COMPLETED',  label: 'Completed' },
  { value: 'CANCELLED',  label: 'Cancelled' },
] as const;

function statusMeta(value: string) {
  return JOB_STATUSES.find((s) => s.value === value) ?? JOB_STATUSES[0];
}

function interviewTypeLabel(value: string) {
  return INTERVIEW_TYPES.find((t) => t.value === value)?.label ?? value;
}

function formatSalary(n: number | null | undefined) {
  if (!n) return '';
  return n >= 1000 ? `$${(n / 1000).toFixed(0)}k` : `$${n}`;
}

function daysUntil(date: string) {
  const d = Math.ceil((new Date(date).getTime() - Date.now()) / 86400000);
  if (d === 0) return 'today';
  if (d === 1) return 'tomorrow';
  if (d < 0) return `${Math.abs(d)}d ago`;
  return `in ${d}d`;
}

// ── Helpers ─────────────────────────────────────────────────────────────────

function toDatetimeLocal(iso: string) {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

// ── Add interview form ───────────────────────────────────────────────────────

function AddInterviewForm({ onSave, onCancel }: { onSave: (d: any) => void; onCancel: () => void }) {
  const [type, setType]   = useState('RECRUITER_SCREEN');
  const [date, setDate]   = useState('');
  const [notes, setNotes] = useState('');

  return (
    <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4 space-y-3">
      <p className="text-xs font-semibold text-neutral-700">Add interview</p>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="block text-xs font-medium text-neutral-600 mb-1">Type</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-plum-400"
          >
            {INTERVIEW_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>
        <Input
          label="Scheduled date"
          type="datetime-local"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
      </div>
      <Input
        label="Notes"
        optional
        placeholder="Location, interviewer name, topics…"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
      />
      <div className="flex gap-2">
        <Button size="sm" onClick={() => onSave({ type, scheduledAt: date ? new Date(date).toISOString() : undefined, notes: notes || undefined })}>
          Add
        </Button>
        <Button size="sm" variant="secondary" onClick={onCancel}>Cancel</Button>
      </div>
    </div>
  );
}

// ── Edit interview form ──────────────────────────────────────────────────────

function EditInterviewForm({ interview, onSave, onCancel }: { interview: any; onSave: (d: any) => void; onCancel: () => void }) {
  const [type,   setType]   = useState(interview.type ?? 'GENERAL');
  const [status, setStatus] = useState(interview.status ?? 'SCHEDULED');
  const [date,   setDate]   = useState(interview.scheduledAt ? toDatetimeLocal(interview.scheduledAt) : '');
  const [notes,  setNotes]  = useState(interview.notes ?? '');

  const selectClass = 'w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-plum-400';

  return (
    <div className="rounded-xl border border-plum-200 bg-plum-50/20 p-4 space-y-3">
      <p className="text-xs font-semibold text-neutral-700">Edit interview</p>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="block text-xs font-medium text-neutral-600 mb-1">Type</label>
          <select value={type} onChange={(e) => setType(e.target.value)} className={selectClass}>
            {INTERVIEW_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-neutral-600 mb-1">Status</label>
          <select value={status} onChange={(e) => setStatus(e.target.value)} className={selectClass}>
            {INTERVIEW_STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </div>
        <Input
          label="Scheduled date"
          type="datetime-local"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
        <Input
          label="Notes"
          optional
          placeholder="Location, interviewer name, topics…"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>
      <div className="flex gap-2">
        <Button size="sm" onClick={() => onSave({ type, status, scheduledAt: date ? new Date(date).toISOString() : undefined, notes: notes || undefined })}>
          <Check className="h-3.5 w-3.5" />
          Save
        </Button>
        <Button size="sm" variant="secondary" onClick={onCancel}>Cancel</Button>
      </div>
    </div>
  );
}

// ── Job match analysis card ────────────────────────────────────────────────

function JobMatchAnalysis({ jobId }: { jobId: string }) {
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading]   = useState(true);
  const [running, setRunning]   = useState(false);
  const [error, setError]       = useState('');
  const [justUpdated, setJustUpdated] = useState(false);

  useEffect(() => {
    jobsApi.getAnalysis(jobId)
      .then(setAnalysis)
      .catch(() => setAnalysis(null))
      .finally(() => setLoading(false));
  }, [jobId]);

  const handleAnalyze = async () => {
    setRunning(true);
    setError('');
    setJustUpdated(false);
    try {
      const result = await jobsApi.runAnalysis(jobId);
      setAnalysis(result);
      setJustUpdated(true);
      setTimeout(() => setJustUpdated(false), 3000);
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Analysis failed. Check your AI credit balance.';
      setError(msg);
    } finally {
      setRunning(false);
    }
  };

  const scoreHex = (s: number) =>
    s >= 85 ? '#16a34a' : s >= 70 ? '#1559C0' : s >= 50 ? '#d97706' : '#dc2626';

  // Handles both new string format and old object format stored in DB
  const asString = (item: any): string => {
    if (typeof item === 'string') return item;
    if (typeof item === 'object' && item !== null) {
      const area   = item.area || item.skill || item.section || item.title || item.name || '';
      const detail = item.evidence || item.gap || item.description || item.suggested || item.tip || item.reason || '';
      return area && detail ? `${area}: ${detail}` : area || detail || '';
    }
    return '';
  };

  if (loading) {
    return (
      <div className="card p-5">
        <div className="h-4 w-40 animate-pulse rounded-full bg-neutral-100" />
        <div className="mt-3 h-2 w-full animate-pulse rounded-full bg-neutral-100" />
      </div>
    );
  }

  return (
    <div className="card p-5">
      {!analysis ? (
        <>
          <div className="mb-4 flex items-center gap-2">
            <BarChart2 className="h-4 w-4 text-neutral-400" />
            <h2 className="text-sm font-semibold text-neutral-900">Resume match</h2>
          </div>
          <div className="py-2 text-center">
            <p className="text-sm text-neutral-500 mb-1">Compare this role against your active resume.</p>
            <p className="text-xs text-neutral-400 mb-4">Identifies strengths, gaps, and tailored recommendations. Costs 300 credits.</p>
            {error && <p className="mb-3 text-xs text-red-600">{error}</p>}
            <Button size="sm" onClick={handleAnalyze} loading={running}>
              <Sparkles className="h-3.5 w-3.5" />
              {running ? 'Analyzing…' : 'Analyze match'}
            </Button>
          </div>
        </>
      ) : (
        <>
          {/* Stale banner */}
          {analysis.isStale && (
            <div className="mb-4 flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
              <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0" />
              Your resume has been updated since this analysis. Re-analyze for current results.
            </div>
          )}

          {/* Header: icon + title + score % */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart2 className="h-4 w-4 text-neutral-400" />
              <span className="text-sm font-semibold text-neutral-900">Resume match</span>
            </div>
            <span className="text-xl font-bold tabular-nums" style={{ color: scoreHex(analysis.matchScore) }}>
              {analysis.matchScore}%
            </span>
          </div>

          {/* Progress bar */}
          <div className="mt-2 mb-5 h-1.5 w-full overflow-hidden rounded-full bg-neutral-100">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{ width: `${analysis.matchScore}%`, backgroundColor: scoreHex(analysis.matchScore) }}
            />
          </div>

          {/* Two columns: Strong matches | Gaps */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 mb-5">
            <div>
              <h3 className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-green-700">
                <CheckCircle className="h-4 w-4" />
                Strong matches
              </h3>
              <ul className="space-y-2.5">
                {(analysis.strengths ?? []).map((s: any, i: number) => {
                  const text = asString(s);
                  return text ? (
                    <li key={i} className="flex items-start gap-2 text-sm text-neutral-700 leading-snug">
                      <span className="mt-[7px] h-1.5 w-1.5 flex-shrink-0 rounded-full bg-green-500" />
                      {text}
                    </li>
                  ) : null;
                })}
              </ul>
            </div>

            <div>
              <h3 className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-orange-600">
                <AlertCircle className="h-4 w-4" />
                Gaps
              </h3>
              <ul className="space-y-2.5">
                {(analysis.weaknesses ?? []).map((w: any, i: number) => {
                  const text = asString(w);
                  return text ? (
                    <li key={i} className="flex items-start gap-2 text-sm text-neutral-700 leading-snug">
                      <span className="mt-[7px] h-1.5 w-1.5 flex-shrink-0 rounded-full bg-orange-500" />
                      {text}
                    </li>
                  ) : null;
                })}
              </ul>
            </div>
          </div>

          {/* Recommendations */}
          {(analysis.tailoringTips ?? []).length > 0 && (
            <div className="border-t border-neutral-100 pt-5">
              <h3 className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-neutral-800">
                <Lightbulb className="h-4 w-4 text-amber-500" />
                Recommendations
              </h3>
              <ul className="space-y-2.5">
                {analysis.tailoringTips.map((t: any, i: number) => {
                  const text = asString(t);
                  return text ? (
                    <li key={i} className="flex items-start gap-2 text-sm text-neutral-700 leading-snug">
                      <span className="mt-[7px] h-1.5 w-1.5 flex-shrink-0 rounded-full bg-amber-400" />
                      {text}
                    </li>
                  ) : null;
                })}
              </ul>
            </div>
          )}

          {/* Error (re-analyze failures show here) */}
          {error && (
            <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
              {error}
            </div>
          )}

          {/* Footer */}
          <div className="mt-5 flex items-center justify-between border-t border-neutral-100 pt-4">
            <p className="text-xs text-neutral-400">
              {justUpdated
                ? <span className="text-green-600 font-medium">Updated just now</span>
                : <>Analyzed {new Date(analysis.updatedAt).toLocaleDateString()} · {analysis.creditsConsumed} credits</>
              }
            </p>
            <button
              onClick={handleAnalyze}
              disabled={running}
              className="text-xs text-neutral-500 underline-offset-2 hover:underline hover:text-neutral-700 disabled:opacity-50 transition-colors"
            >
              {running ? 'Analyzing…' : 'Re-analyze'}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────

export default function JobDetailPage() {
  const { id }   = useParams<{ id: string }>();
  const router   = useRouter();
  const [job, setJob]         = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [editing, setEditing] = useState(false);
  const [showAddInterview, setShowAddInterview] = useState(false);
  const [editingInterviewId, setEditingInterviewId] = useState<string | null>(null);

  // Edit form state
  const [title,     setTitle]     = useState('');
  const [company,   setCompany]   = useState('');
  const [status,    setStatus]    = useState('INTERESTED');
  const [appliedAt, setAppliedAt] = useState('');
  const [salaryMin, setSalaryMin] = useState('');
  const [salaryMax, setSalaryMax] = useState('');
  const [targetAsk, setTargetAsk] = useState('');

  const load = async () => {
    try {
      const data = await jobsApi.get(id);
      setJob(data);
      setTitle(data.title ?? '');
      setCompany(data.company ?? '');
      setStatus(data.status ?? 'INTERESTED');
      setAppliedAt(data.appliedAt ? data.appliedAt.slice(0, 10) : '');
      setSalaryMin(data.salaryMin ? String(data.salaryMin) : '');
      setSalaryMax(data.salaryMax ? String(data.salaryMax) : '');
      setTargetAsk(data.targetAsk ? String(data.targetAsk) : '');
    } catch {
      router.push('/jobs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [id]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await jobsApi.update(id, {
        title:     title || undefined,
        company:   company || undefined,
        status,
        appliedAt: appliedAt || undefined,
        salaryMin: salaryMin ? parseInt(salaryMin, 10) : undefined,
        salaryMax: salaryMax ? parseInt(salaryMax, 10) : undefined,
        targetAsk: targetAsk ? parseInt(targetAsk, 10) : undefined,
      });
      await load();
      setEditing(false);
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    setStatus(newStatus);
    await jobsApi.update(id, {
      status: newStatus,
      ...(newStatus === 'APPLIED' && !appliedAt ? { appliedAt: new Date().toISOString() } : {}),
    });
    await load();
  };

  const handleAddInterview = async (data: any) => {
    await jobsApi.addInterview(id, data);
    setShowAddInterview(false);
    await load();
  };

  const handleUpdateInterview = async (interviewId: string, data: any) => {
    await jobsApi.updateInterview(interviewId, data);
    await load();
  };

  const handleDeleteInterview = async (interviewId: string) => {
    if (!confirm('Remove this interview?')) return;
    await jobsApi.deleteInterview(interviewId);
    await load();
  };

  if (loading) {
    return (
      <DashboardLayout pageTitle="Job Prospect">
        <div className="mx-auto max-w-2xl space-y-4">
          {[1, 2, 3].map((i) => <div key={i} className="h-24 animate-pulse rounded-xl bg-neutral-100" />)}
        </div>
      </DashboardLayout>
    );
  }

  const sm = statusMeta(status);
  const upcomingInterviews = job?.jobInterviews?.filter((i: any) => i.status === 'SCHEDULED' && i.scheduledAt && new Date(i.scheduledAt) > new Date()) ?? [];

  return (
    <DashboardLayout pageTitle={job?.title ?? 'Job Prospect'}>
      <div className="mx-auto max-w-2xl space-y-5">
        <Link href="/jobs" className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-700">
          <ChevronLeft className="h-4 w-4" />
          Back to job prospects
        </Link>

        {/* ── Header card ── */}
        <div className="card p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              {editing ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  <Input label="Job title" value={title} onChange={(e) => setTitle(e.target.value)} />
                  <Input label="Company" value={company} onChange={(e) => setCompany(e.target.value)} />
                </div>
              ) : (
                <>
                  <h1 className="text-xl font-bold text-neutral-900">{job?.title || 'Untitled Job'}</h1>
                  <p className="mt-0.5 text-sm text-neutral-500">{job?.company || 'No company'}</p>
                </>
              )}
            </div>
            <button
              onClick={() => setEditing((e) => !e)}
              className="flex-shrink-0 rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600 transition-colors"
            >
              <Pencil className="h-4 w-4" />
            </button>
          </div>

          {/* Status pills */}
          <div className="mt-4 flex flex-wrap gap-1.5">
            {JOB_STATUSES.map((s) => (
              <button
                key={s.value}
                onClick={() => handleStatusChange(s.value)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-all ${
                  status === s.value
                    ? `${s.color} ring-2 ring-offset-1 ring-plum-400`
                    : 'bg-neutral-100 text-neutral-500 hover:bg-neutral-200'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>

          {/* Applied date */}
          {(status === 'APPLIED' || status === 'PHONE_SCREEN' || status === 'INTERVIEWING' || status === 'OFFER_RECEIVED' || status === 'ACCEPTED' || status === 'REJECTED') && (
            <div className="mt-4 flex items-center gap-2">
              <label className="text-xs text-neutral-500 w-20 flex-shrink-0">Applied date</label>
              <input
                type="date"
                value={appliedAt}
                onChange={(e) => setAppliedAt(e.target.value)}
                className="rounded-lg border border-neutral-200 px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-plum-400"
              />
            </div>
          )}

          {/* Pay / ask */}
          {editing ? (
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <Input label="Pay range min" optional placeholder="120000" value={salaryMin} onChange={(e) => setSalaryMin(e.target.value.replace(/\D/g, ''))} />
              <Input label="Pay range max" optional placeholder="150000" value={salaryMax} onChange={(e) => setSalaryMax(e.target.value.replace(/\D/g, ''))} />
              <Input label="I'll ask for" optional placeholder="140000" value={targetAsk} onChange={(e) => setTargetAsk(e.target.value.replace(/\D/g, ''))} />
            </div>
          ) : (
            (job?.salaryMin || job?.salaryMax || job?.targetAsk) && (
              <div className="mt-4 flex flex-wrap gap-4 text-xs text-neutral-500">
                {(job?.salaryMin || job?.salaryMax) && (
                  <span>
                    Posted range: <strong className="text-neutral-700">{formatSalary(job.salaryMin)} – {formatSalary(job.salaryMax)}</strong>
                  </span>
                )}
                {job?.targetAsk && (
                  <span>
                    My ask: <strong className="text-plum-700">{formatSalary(job.targetAsk)}</strong>
                  </span>
                )}
              </div>
            )
          )}

          {editing && (
            <div className="mt-4 flex gap-2 border-t border-neutral-100 pt-4">
              <Button size="sm" onClick={handleSave} loading={saving}>
                <Check className="h-3.5 w-3.5" />
                Save changes
              </Button>
              <Button size="sm" variant="secondary" onClick={() => setEditing(false)}>
                <X className="h-3.5 w-3.5" />
                Cancel
              </Button>
            </div>
          )}

          {job?.sourceUrl && (
            <a
              href={job.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-1 text-xs text-plum-700 hover:underline"
            >
              <ExternalLink className="h-3 w-3" />
              View original posting
            </a>
          )}
        </div>

        {/* ── Match analysis ── */}
        {job && <JobMatchAnalysis jobId={id} />}

        {/* ── Interviews card ── */}
        <div className="card p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-neutral-900">Scheduled Interviews</h2>
            <Button size="sm" variant="secondary" onClick={() => setShowAddInterview(true)}>
              <Plus className="h-3.5 w-3.5" />
              Add interview
            </Button>
          </div>

          {showAddInterview && (
            <div className="mb-4">
              <AddInterviewForm onSave={handleAddInterview} onCancel={() => setShowAddInterview(false)} />
            </div>
          )}

          {job?.jobInterviews?.length === 0 && !showAddInterview ? (
            <p className="text-sm text-neutral-400">No interviews scheduled yet.</p>
          ) : (
            <div className="space-y-2">
              {job?.jobInterviews?.map((interview: any) => {
                if (editingInterviewId === interview.id) {
                  return (
                    <EditInterviewForm
                      key={interview.id}
                      interview={interview}
                      onSave={async (data) => {
                        await handleUpdateInterview(interview.id, data);
                        setEditingInterviewId(null);
                      }}
                      onCancel={() => setEditingInterviewId(null)}
                    />
                  );
                }

                const isPast = interview.scheduledAt && new Date(interview.scheduledAt) < new Date();
                return (
                  <div key={interview.id} className={`flex items-center gap-3 rounded-xl border p-3 ${
                    interview.status === 'COMPLETED' ? 'border-neutral-100 bg-neutral-50 opacity-70' :
                    interview.status === 'CANCELLED' ? 'border-neutral-100 bg-neutral-50 opacity-50' :
                    'border-plum-100 bg-plum-50/30'
                  }`}>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-neutral-900">{interviewTypeLabel(interview.type)}</span>
                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          interview.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                          interview.status === 'CANCELLED' ? 'bg-neutral-200 text-neutral-500' :
                          'bg-plum-100 text-plum-700'
                        }`}>
                          {interview.status.charAt(0) + interview.status.slice(1).toLowerCase()}
                        </span>
                      </div>
                      {interview.scheduledAt && (
                        <p className="mt-0.5 text-xs text-neutral-500">
                          {new Date(interview.scheduledAt).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                          {' · '}
                          <span className={isPast ? 'text-neutral-400' : 'font-medium text-plum-700'}>{daysUntil(interview.scheduledAt)}</span>
                        </p>
                      )}
                      {interview.notes && <p className="mt-0.5 text-xs text-neutral-400">{interview.notes}</p>}
                    </div>
                    <div className="flex flex-shrink-0 items-center gap-1">
                      {interview.status === 'SCHEDULED' && (
                        <>
                          <Link
                            href={`/interviews/new?jobId=${id}&type=${interview.type === 'GENERAL' ? 'BEHAVIORAL' : interview.type}`}
                            className="rounded-lg bg-plum-900 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-plum-dark transition-colors"
                          >
                            Practice
                          </Link>
                          <button
                            onClick={() => handleUpdateInterview(interview.id, { status: 'COMPLETED' })}
                            className="rounded-lg p-1.5 text-neutral-400 hover:bg-green-50 hover:text-green-600 transition-colors"
                            title="Mark complete"
                          >
                            <Check className="h-3.5 w-3.5" />
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => setEditingInterviewId(interview.id)}
                        className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600 transition-colors"
                        title="Edit interview"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteInterview(interview.id)}
                        className="rounded-lg p-1.5 text-neutral-400 hover:bg-danger-50 hover:text-danger-600 transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Skills ── */}
        {job?.requiredSkills?.length > 0 && (
          <div className="card p-5">
            <h2 className="mb-3 text-sm font-semibold text-neutral-900">Required Skills</h2>
            <div className="flex flex-wrap gap-1.5">
              {job.requiredSkills.map((s: string) => (
                <span key={s} className="rounded-full bg-neutral-100 px-3 py-1 text-xs text-neutral-600">{s}</span>
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

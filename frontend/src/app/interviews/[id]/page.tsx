'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Send, CheckCircle, Mic, Square, BarChart3, ChevronRight } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Badge, statusBadgeVariant } from '@/components/ui/badge';
import { interviewsApi, feedbackApi } from '@/lib/api/interviews';
import { useAuthStore } from '@/lib/store/auth.store';
import { formatCredits, cn } from '@/lib/utils';

// ─── Interviewer persona ──────────────────────────────────────────────────

const PERSONAS: Record<string, { name: string; title: string; avatar: string }> = {
  RECRUITER_SCREEN: { name: 'Morgan Clarke',    title: 'Technical Recruiter',      avatar: 'MC' },
  HIRING_MANAGER:   { name: 'Jordan Rivera',    title: 'Engineering Manager',      avatar: 'JR' },
  TECHNICAL:        { name: 'Alex Chen',        title: 'Senior Engineer',          avatar: 'AC' },
  BEHAVIORAL:       { name: 'Taylor Okonkwo',   title: 'People & Culture Partner', avatar: 'TO' },
};

// ─── Turn message ─────────────────────────────────────────────────────────

function TurnMessage({ turn, persona }: { turn: any; persona: typeof PERSONAS[string] }) {
  const isAI = turn.role === 'assistant';
  return (
    <div className={cn('flex gap-4 animate-fade-up', !isAI && 'flex-row-reverse')}>
      {isAI ? (
        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-plum-900 text-xs font-bold text-white select-none">
          {persona.avatar}
        </div>
      ) : (
        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-neutral-200 text-xs font-bold text-neutral-600 select-none">
          You
        </div>
      )}
      <div className={cn('max-w-2xl', isAI ? 'items-start' : 'items-end flex flex-col')}>
        <p className={cn('mb-1.5 text-xs font-medium', isAI ? 'text-neutral-500' : 'text-neutral-500 text-right')}>
          {isAI ? persona.name : 'Your answer'}
        </p>
        <div
          className={cn(
            'rounded-2xl px-5 py-4 text-sm leading-relaxed',
            isAI
              ? 'rounded-tl-sm bg-neutral-0 border border-neutral-200 shadow-xs text-neutral-800'
              : 'rounded-tr-sm bg-plum-900 text-white',
          )}
        >
          <p className="whitespace-pre-wrap">{turn.content}</p>
        </div>
      </div>
    </div>
  );
}

// ─── Thinking indicator ───────────────────────────────────────────────────

function Thinking({ persona }: { persona: typeof PERSONAS[string] }) {
  return (
    <div className="flex gap-4 animate-fade-in">
      <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-plum-900 text-xs font-bold text-white">
        {persona.avatar}
      </div>
      <div>
        <p className="mb-1.5 text-xs font-medium text-neutral-500">{persona.name}</p>
        <div className="inline-flex items-center gap-1.5 rounded-2xl rounded-tl-sm border border-neutral-200 bg-neutral-0 px-5 py-4 shadow-xs">
          {[0, 150, 300].map((d) => (
            <span
              key={d}
              className="h-2 w-2 rounded-full bg-neutral-300 animate-pulse-soft"
              style={{ animationDelay: `${d}ms` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Voice button ─────────────────────────────────────────────────────────

function VoiceButton({ isRecording, onClick }: { isRecording: boolean; onClick: () => void }) {
  return (
    <div className="flex flex-col items-center gap-3">
      <button
        onClick={onClick}
        className={cn(
          'relative flex h-20 w-20 items-center justify-center rounded-full shadow-lg transition-all duration-200',
          isRecording
            ? 'bg-danger-600 hover:bg-danger-700 scale-110'
            : 'bg-plum-900 hover:bg-plum-dark hover:scale-105',
        )}
      >
        {isRecording && (
          <span className="absolute inset-0 rounded-full animate-recording border-4 border-danger-400" />
        )}
        {isRecording ? (
          <Square className="h-6 w-6 text-white" />
        ) : (
          <Mic className="h-6 w-6 text-white" />
        )}
      </button>
      <p className="text-sm text-neutral-500">
        {isRecording ? 'Recording — click to stop' : 'Click to speak'}
      </p>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────

export default function InterviewSessionPage() {
  const { id }     = useParams<{ id: string }>();
  const router     = useRouter();
  const user       = useAuthStore((s) => s.user);
  const bottomRef  = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [session, setSession]       = useState<any>(null);
  const [turns, setTurns]           = useState<any[]>([]);
  const [answer, setAnswer]         = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [loading, setLoading]       = useState(true);

  useEffect(() => {
    interviewsApi.get(id).then((s) => {
      setSession(s);
      setTurns(s.turns ?? []);
    }).catch(() => router.push('/interviews')).finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [turns, submitting]);

  const handleSubmit = useCallback(async () => {
    if (!answer.trim() || submitting) return;
    const myAnswer = answer.trim();
    setAnswer('');
    setSubmitting(true);

    const tempUser = { id: 'tmp', role: 'user', content: myAnswer, turnNumber: turns.length + 1 };
    setTurns((prev) => [...prev, tempUser]);

    try {
      const result = await interviewsApi.answer(id, { answer: myAnswer });
      setTurns((prev) => {
        const without = prev.filter((t) => t.id !== 'tmp');
        return [...without, result.userTurn, { ...result.nextQuestion.turn, content: result.nextQuestion.content }];
      });
    } catch {
      setTurns((prev) => prev.filter((t) => t.id !== 'tmp'));
      setAnswer(myAnswer);
    } finally {
      setSubmitting(false);
      setTimeout(() => textareaRef.current?.focus(), 100);
    }
  }, [answer, submitting, id, turns.length]);

  const handleComplete = async () => {
    setCompleting(true);
    try {
      await interviewsApi.complete(id);
      // Kick off feedback generation, then redirect
      feedbackApi.generate(id).catch(() => {}).finally(() => {});
      router.push(`/feedback/${id}`);
    } catch {
      setCompleting(false);
    }
  };

  const isCompleted = session?.status === 'COMPLETED';
  const isVoice     = session?.mode === 'VOICE';
  const persona     = PERSONAS[session?.type] ?? PERSONAS.TECHNICAL;

  const creditTotal =
    (user?.creditBalance?.subscriptionCredits ?? 0) +
    (user?.creditBalance?.purchasedCredits ?? 0);

  if (loading) {
    return (
      <DashboardLayout noPadding>
        <div className="flex h-full items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-plum-900 border-t-transparent" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout noPadding>
      <div className="flex h-full flex-col bg-neutral-50">
        {/* Interview header */}
        <header className="flex flex-shrink-0 items-center justify-between border-b border-neutral-200 bg-neutral-0 px-6 py-3">
          <div className="flex items-center gap-4">
            {/* Persona */}
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-plum-900 text-xs font-bold text-white">
                {persona.avatar}
              </div>
              <div>
                <p className="text-sm font-semibold text-neutral-900">{persona.name}</p>
                <p className="text-xs text-neutral-500">{persona.title}</p>
              </div>
            </div>
            <div className="h-5 w-px bg-neutral-200" />
            <div className="flex items-center gap-2">
              <span className="text-sm text-neutral-500">{session?.type?.replace('_', ' ')}</span>
              <Badge variant={statusBadgeVariant(session?.mode)} size="sm">
                {session?.mode}
              </Badge>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Turn count */}
            <div className="hidden text-right sm:block">
              <p className="text-xs text-neutral-400">Turn</p>
              <p className="text-sm font-bold text-neutral-700 tabular-nums">{Math.floor(turns.length / 2)}</p>
            </div>

            {/* Credits */}
            <div className="hidden text-right sm:block">
              <p className="text-xs text-neutral-400">AI Credits</p>
              <p className="text-sm font-bold text-neutral-700 tabular-nums">{formatCredits(creditTotal)}</p>
            </div>

            {isCompleted ? (
              <button
                onClick={() => router.push(`/feedback/${id}`)}
                className="inline-flex items-center gap-2 rounded-lg bg-plum-900 px-4 py-2 text-sm font-semibold text-white hover:bg-plum-dark transition-colors"
              >
                <BarChart3 className="h-4 w-4" />
                View feedback
              </button>
            ) : (
              <button
                onClick={handleComplete}
                disabled={completing || turns.length < 2}
                className="inline-flex items-center gap-2 rounded-lg border border-neutral-300 bg-neutral-0 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 disabled:opacity-40 transition-colors"
              >
                {completing ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-neutral-400 border-t-neutral-800" />
                ) : (
                  <CheckCircle className="h-4 w-4 text-success-600" />
                )}
                End & get feedback
                <ChevronRight className="h-3.5 w-3.5 text-neutral-400" />
              </button>
            )}
          </div>
        </header>

        {/* Transcript */}
        <div className="flex-1 overflow-y-auto px-6 py-8">
          <div className="mx-auto max-w-2xl space-y-6">
            {turns.map((turn) => (
              <TurnMessage key={turn.id} turn={turn} persona={persona} />
            ))}
            {submitting && <Thinking persona={persona} />}
            <div ref={bottomRef} />
          </div>
        </div>

        {/* Input area */}
        {!isCompleted && (
          <div className="flex-shrink-0 border-t border-neutral-200 bg-neutral-0 px-6 py-4">
            <div className="mx-auto max-w-2xl">
              {isVoice ? (
                <VoiceButton
                  isRecording={isRecording}
                  onClick={() => setIsRecording((r) => !r)}
                />
              ) : (
                <div className="flex items-end gap-3">
                  <div className="relative flex-1">
                    <textarea
                      ref={textareaRef}
                      value={answer}
                      onChange={(e) => {
                        setAnswer(e.target.value);
                        e.target.style.height = 'auto';
                        e.target.style.height = `${Math.min(e.target.scrollHeight, 160)}px`;
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSubmit();
                        }
                      }}
                      placeholder="Type your answer… (Enter to submit, Shift + Enter for a new line)"
                      rows={2}
                      disabled={submitting}
                      className="input-base min-h-[60px] resize-none py-3 pr-12 leading-relaxed"
                      style={{ height: '60px' }}
                    />
                  </div>
                  <button
                    onClick={handleSubmit}
                    disabled={!answer.trim() || submitting}
                    className="mb-0.5 flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-plum-900 text-white shadow-xs hover:bg-plum-dark disabled:opacity-40 transition-all hover:shadow-sm"
                  >
                    {submitting ? (
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </button>
                </div>
              )}
              <p className="mt-2 text-center text-xs text-neutral-400">
                Your answers are private and only used to generate your coaching report.
              </p>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

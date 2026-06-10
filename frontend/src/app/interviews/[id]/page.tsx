'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Send, CheckCircle, Mic, BarChart3, ChevronRight, Volume2, AlertCircle } from 'lucide-react';
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

// ─── Voice mode hook ──────────────────────────────────────────────────────

function useVoiceMode(active: boolean) {
  const [isSpeaking,  setIsSpeaking]  = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript,  setTranscript]  = useState('');
  const [supported,   setSupported]   = useState(true);

  const recognitionRef  = useRef<any>(null);
  const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onSubmitRef     = useRef<((t: string) => void) | null>(null);
  const hasSpokenRef    = useRef(false);

  useEffect(() => {
    if (!active) return;
    const SR = (window as any).SpeechRecognition ?? (window as any).webkitSpeechRecognition;
    if (!SR) { setSupported(false); return; }

    const rec = new SR();
    rec.continuous     = true;
    rec.interimResults = true;
    rec.lang           = 'en-US';

    rec.onresult = (e: any) => {
      const text = Array.from(e.results as any[])
        .map((r: any) => r[0].transcript)
        .join('');
      setTranscript(text);
      hasSpokenRef.current = true;

      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = setTimeout(() => {
        if (hasSpokenRef.current && text.trim()) {
          onSubmitRef.current?.(text);
        }
      }, 2500);
    };

    rec.onend = () => setIsListening(false);
    rec.onerror = () => setIsListening(false);
    recognitionRef.current = rec;

    return () => { rec.abort(); };
  }, [active]);

  const speak = useCallback((text: string): Promise<void> => {
    return new Promise((resolve) => {
      window.speechSynthesis.cancel();
      setIsSpeaking(true);

      const trySpeak = () => {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate  = 1.0;
        utterance.pitch = 1.0;
        const voices = window.speechSynthesis.getVoices();
        const preferred = voices.find(
          (v) => v.lang.startsWith('en') && (v.name.includes('Samantha') || v.name.includes('Google US') || v.name.includes('Alex'))
        ) ?? voices.find((v) => v.lang.startsWith('en'));
        if (preferred) utterance.voice = preferred;
        utterance.onend   = () => { setIsSpeaking(false); resolve(); };
        utterance.onerror = () => { setIsSpeaking(false); resolve(); };
        window.speechSynthesis.speak(utterance);
      };

      if (window.speechSynthesis.getVoices().length > 0) {
        trySpeak();
      } else {
        window.speechSynthesis.onvoiceschanged = () => { trySpeak(); };
      }
    });
  }, []);

  const startListening = useCallback((onSubmit: (t: string) => void) => {
    if (!recognitionRef.current) return;
    onSubmitRef.current   = onSubmit;
    hasSpokenRef.current  = false;
    setTranscript('');
    try { recognitionRef.current.start(); setIsListening(true); } catch {}
  }, []);

  const stopListening = useCallback(() => {
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    try { recognitionRef.current?.stop(); } catch {}
    setIsListening(false);
  }, []);

  const cancelSpeech = useCallback(() => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  }, []);

  return { isSpeaking, isListening, transcript, supported, speak, startListening, stopListening, cancelSpeech };
}

// ─── Voice interface UI ───────────────────────────────────────────────────

function VoiceInterface({
  isSpeaking, isListening, transcript, supported, persona, submitting,
  onManualSubmit, onStopListening,
}: {
  isSpeaking: boolean; isListening: boolean; transcript: string;
  supported: boolean; persona: typeof PERSONAS[string]; submitting: boolean;
  onManualSubmit: () => void; onStopListening: () => void;
}) {
  if (!supported) {
    return (
      <div className="flex items-center justify-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
        <AlertCircle className="h-4 w-4 flex-shrink-0" />
        Voice mode requires Chrome or Edge. Switch to text mode or use a supported browser.
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4 py-2">
      {isSpeaking && (
        <div className="flex flex-col items-center gap-2">
          <div className="relative flex h-14 w-14 items-center justify-center rounded-full bg-plum-900 text-sm font-bold text-white">
            {persona.avatar}
            <span className="absolute inset-[-4px] rounded-full border-2 border-plum-400 animate-ping opacity-40" />
          </div>
          <div className="flex items-center gap-1.5 text-sm text-neutral-500">
            <Volume2 className="h-3.5 w-3.5" />
            {persona.name} is speaking…
          </div>
        </div>
      )}

      {isListening && (
        <div className="flex w-full max-w-lg flex-col items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex h-3 w-3 rounded-full bg-red-500" />
            </span>
            <span className="text-sm font-medium text-neutral-600">Listening…</span>
          </div>
          {transcript ? (
            <p className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-center text-sm italic text-neutral-600">
              "{transcript}"
            </p>
          ) : (
            <p className="text-xs text-neutral-400">Speak your answer — it will submit automatically after a pause</p>
          )}
          <div className="flex gap-2">
            <button
              onClick={onManualSubmit}
              disabled={!transcript.trim() || submitting}
              className="inline-flex items-center gap-1.5 rounded-lg bg-plum-900 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-40 hover:bg-plum-dark transition-colors"
            >
              <Send className="h-3 w-3" />
              Submit now
            </button>
            <button
              onClick={onStopListening}
              className="rounded-lg border border-neutral-200 px-3 py-1.5 text-xs text-neutral-500 hover:bg-neutral-50 transition-colors"
            >
              Stop
            </button>
          </div>
        </div>
      )}

      {!isSpeaking && !isListening && !submitting && (
        <div className="flex items-center gap-2">
          <Mic className="h-4 w-4 text-neutral-300" />
          <p className="text-sm text-neutral-400">Waiting for next question…</p>
        </div>
      )}
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
  const [loading, setLoading]       = useState(true);

  const isVoiceSession = session?.mode === 'VOICE';
  const voice = useVoiceMode(isVoiceSession);
  const spokenTurnIdRef = useRef<string | null>(null);

  useEffect(() => {
    interviewsApi.get(id).then((s) => {
      setSession(s);
      setTurns(s.turns ?? []);
    }).catch(() => router.push('/interviews')).finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [turns, submitting]);

  const handleSubmit = useCallback(async (voiceAnswer?: string) => {
    const finalAnswer = (voiceAnswer ?? answer).trim();
    if (!finalAnswer || submitting) return;
    if (!voiceAnswer) setAnswer('');
    setSubmitting(true);

    const tempUser = { id: 'tmp', role: 'user', content: finalAnswer, turnNumber: turns.length + 1 };
    setTurns((prev) => [...prev, tempUser]);

    try {
      const result = await interviewsApi.answer(id, { answer: finalAnswer });
      setTurns((prev) => {
        const without = prev.filter((t) => t.id !== 'tmp');
        return [...without, result.userTurn, { ...result.nextQuestion.turn, content: result.nextQuestion.content }];
      });
    } catch {
      setTurns((prev) => prev.filter((t) => t.id !== 'tmp'));
      if (!voiceAnswer) setAnswer(finalAnswer);
    } finally {
      setSubmitting(false);
      if (!voiceAnswer) setTimeout(() => textareaRef.current?.focus(), 100);
    }
  }, [answer, submitting, id, turns.length]);

  // Auto-speak new AI turns in voice mode, then start listening
  useEffect(() => {
    if (!isVoiceSession || !voice.supported || submitting) return;
    const lastTurn = turns[turns.length - 1];
    if (!lastTurn || lastTurn.role !== 'assistant' || lastTurn.id === 'tmp') return;
    if (lastTurn.id === spokenTurnIdRef.current) return;
    spokenTurnIdRef.current = lastTurn.id;

    voice.speak(lastTurn.content).then(() => {
      voice.startListening((transcript) => handleSubmit(transcript));
    });
  }, [turns, isVoiceSession, voice.supported, submitting]);

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
              {isVoiceSession ? (
                <VoiceInterface
                  isSpeaking={voice.isSpeaking}
                  isListening={voice.isListening}
                  transcript={voice.transcript}
                  supported={voice.supported}
                  persona={persona}
                  submitting={submitting}
                  onManualSubmit={() => { voice.stopListening(); handleSubmit(voice.transcript); }}
                  onStopListening={voice.stopListening}
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
                    onClick={() => handleSubmit()}
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

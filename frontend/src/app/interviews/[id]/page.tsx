'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Send, CheckCircle, Loader2, Mic, Square, BarChart3 } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { interviewsApi, feedbackApi } from '@/lib/api/interviews';

interface Turn {
  id: string;
  role: 'assistant' | 'user';
  content: string;
  turnNumber: number;
}

export default function InterviewSessionPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [session, setSession] = useState<any>(null);
  const [turns, setTurns] = useState<Turn[]>([]);
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [generatingFeedback, setGeneratingFeedback] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    interviewsApi.get(id).then((s) => {
      setSession(s);
      setTurns(s.turns);
      setLoading(false);
    }).catch(() => router.push('/interviews'));
  }, [id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [turns]);

  const handleSubmit = async () => {
    if (!answer.trim() || submitting) return;
    setSubmitting(true);
    const myAnswer = answer;
    setAnswer('');

    // Optimistically add user turn
    const tempUserTurn: Turn = { id: 'temp-user', role: 'user', content: myAnswer, turnNumber: turns.length + 1 };
    setTurns((prev) => [...prev, tempUserTurn]);

    try {
      const result = await interviewsApi.answer(id, { answer: myAnswer });
      const aiTurn: Turn = { id: result.nextQuestion.turn.id, role: 'assistant', content: result.nextQuestion.content, turnNumber: turns.length + 2 };
      setTurns((prev) => [...prev.filter((t) => t.id !== 'temp-user'), result.userTurn, aiTurn]);
    } catch (err: any) {
      setTurns((prev) => prev.filter((t) => t.id !== 'temp-user'));
      setAnswer(myAnswer);
    } finally {
      setSubmitting(false);
    }
  };

  const handleComplete = async () => {
    setCompleting(true);
    await interviewsApi.complete(id);
    setGeneratingFeedback(true);
    try {
      const report = await feedbackApi.generate(id);
      router.push(`/feedback/${id}`);
    } catch {
      router.push(`/feedback/${id}`);
    }
  };

  const isCompleted = session?.status === 'COMPLETED';
  const isVoice = session?.mode === 'VOICE';

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex h-full items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex h-full flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
          <div>
            <h1 className="text-lg font-semibold text-gray-900">
              {session?.type?.replace('_', ' ')} Interview
            </h1>
            <p className="text-sm text-gray-500">
              {session?.job?.title || 'General'} · {session?.mode} · Turn {turns.length}
            </p>
          </div>
          {!isCompleted && (
            <button
              onClick={handleComplete}
              disabled={completing || turns.length < 2}
              className="flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              {completing ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4 text-emerald-500" />}
              {generatingFeedback ? 'Generating feedback...' : 'End & get feedback'}
            </button>
          )}
          {isCompleted && (
            <button
              onClick={() => router.push(`/feedback/${id}`)}
              className="flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white"
            >
              <BarChart3 className="h-4 w-4" />
              View feedback
            </button>
          )}
        </div>

        {/* Chat */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
          {turns.map((turn) => (
            <div key={turn.id} className={`flex ${turn.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-2xl rounded-2xl px-5 py-4 text-sm leading-relaxed ${
                  turn.role === 'user'
                    ? 'bg-brand-600 text-white'
                    : 'border border-gray-200 bg-white text-gray-900 shadow-sm'
                }`}
              >
                {turn.role === 'assistant' && (
                  <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-400">Interviewer</p>
                )}
                <p className="whitespace-pre-wrap">{turn.content}</p>
              </div>
            </div>
          ))}

          {submitting && (
            <div className="flex justify-start">
              <div className="flex items-center gap-2 rounded-2xl border border-gray-200 bg-white px-5 py-4 text-sm text-gray-500 shadow-sm">
                <Loader2 className="h-4 w-4 animate-spin text-brand-500" />
                Thinking...
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input */}
        {!isCompleted && (
          <div className="border-t border-gray-200 bg-white p-4">
            {isVoice ? (
              <div className="flex items-center justify-center gap-4">
                <button
                  onClick={() => setIsRecording(!isRecording)}
                  className={`flex h-14 w-14 items-center justify-center rounded-full transition-colors ${
                    isRecording ? 'bg-red-500 hover:bg-red-600' : 'bg-brand-600 hover:bg-brand-700'
                  }`}
                >
                  {isRecording ? <Square className="h-6 w-6 text-white" /> : <Mic className="h-6 w-6 text-white" />}
                </button>
                <span className="text-sm text-gray-500">
                  {isRecording ? 'Recording... click to stop' : 'Click microphone to speak'}
                </span>
              </div>
            ) : (
              <div className="flex gap-3">
                <textarea
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(); }
                  }}
                  placeholder="Type your answer here... (Enter to submit, Shift+Enter for new line)"
                  rows={3}
                  className="flex-1 resize-none rounded-xl border border-gray-300 px-4 py-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                  disabled={submitting}
                />
                <button
                  onClick={handleSubmit}
                  disabled={!answer.trim() || submitting}
                  className="flex h-12 w-12 flex-shrink-0 items-center justify-center self-end rounded-xl bg-brand-600 text-white hover:bg-brand-700 disabled:opacity-50"
                >
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

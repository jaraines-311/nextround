export interface AiMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface AiCompletionOptions {
  messages: AiMessage[];
  temperature?: number;
  maxTokens?: number;
  jsonMode?: boolean;
}

export interface AiCompletionResult {
  content: string;
  tokensUsed: number;
  providerCostUsd: number;
  provider: string;
  model: string;
}

export interface AiProvider {
  complete(options: AiCompletionOptions): Promise<AiCompletionResult>;
  isAvailable(): boolean;
  getName(): string;
}

export type AiFeature =
  | 'question_generation'
  | 'resume_analysis'
  | 'job_analysis'
  | 'job_match_analysis'
  | 'feedback_generation'
  | 'interview_turn';

import { Injectable, Logger } from '@nestjs/common';
import { AiProvider, AiCompletionOptions, AiCompletionResult } from '../ai.types';

@Injectable()
export class MockAiProvider implements AiProvider {
  private readonly logger = new Logger(MockAiProvider.name);

  constructor() {
    this.logger.warn('Using MOCK AI provider — no real AI calls will be made');
  }

  isAvailable(): boolean {
    return true;
  }

  getName(): string {
    return 'mock';
  }

  async complete(options: AiCompletionOptions): Promise<AiCompletionResult> {
    const lastUserMessage = [...options.messages].reverse().find((m) => m.role === 'user')?.content || '';

    const content = this.generateMockResponse(lastUserMessage);

    return {
      content,
      tokensUsed: 150,
      providerCostUsd: 0,
      provider: 'mock',
      model: 'mock-v1',
    };
  }

  private generateMockResponse(prompt: string): string {
    if (prompt.toLowerCase().includes('question')) {
      return JSON.stringify({
        question: "Can you walk me through your experience with distributed systems and how you've handled scaling challenges in past roles?",
        type: 'technical',
        followUp: 'How did you measure the success of those scaling efforts?',
      });
    }

    if (prompt.toLowerCase().includes('feedback') || prompt.toLowerCase().includes('score')) {
      return JSON.stringify({
        overallScore: 7.5,
        communicationScore: 8,
        technicalDepthScore: 7,
        roleFitScore: 8,
        confidenceScore: 7.5,
        strengths: ['Clear communication', 'Good problem-solving approach', 'Relevant experience'],
        weaknesses: ['Could provide more specific metrics', 'Expand on technical depth'],
        suggestedAnswers: {},
        studyTopics: ['System design', 'Distributed systems patterns'],
        followUpQuestions: ['How would you handle a 10x traffic spike?'],
      });
    }

    if (prompt.toLowerCase().includes('resume') || prompt.toLowerCase().includes('parse')) {
      return JSON.stringify({
        skills: ['Python', 'TypeScript', 'PostgreSQL', 'Docker', 'AWS'],
        summary: 'Experienced software engineer with 5+ years building scalable backend systems.',
        yearsOfExperience: 5,
      });
    }

    return `This is a mock AI response for development purposes. In production, this will be powered by ${process.env.AI_PROVIDER || 'openai'}. Your input was: "${prompt.substring(0, 100)}"`;
  }
}

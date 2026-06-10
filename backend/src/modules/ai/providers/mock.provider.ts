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

    if (prompt.toLowerCase().includes('match analysis') || prompt.toLowerCase().includes('matchscore') || (prompt.toLowerCase().includes('resume') && prompt.toLowerCase().includes('job title'))) {
      return JSON.stringify({
        matchScore: 72,
        matchLabel: 'Good Match',
        summary: 'Your backend engineering background aligns well with this role. You have strong experience in the core required technologies, though there are a few specific tools mentioned in the job description that would benefit from clearer emphasis in your resume.',
        strengths: [
          { area: 'Backend Development', evidence: 'Extensive Node.js/TypeScript experience directly matches the core engineering requirements', matchStrength: 'high' },
          { area: 'Database Design', evidence: 'PostgreSQL experience and data modeling skills align with the persistence layer requirements', matchStrength: 'high' },
          { area: 'API Development', evidence: 'REST API design and NestJS experience covers the service architecture requirements', matchStrength: 'medium' },
        ],
        weaknesses: [
          { area: 'Cloud Infrastructure', gap: 'The role requires hands-on AWS experience, but your resume focuses more on application code', hasPotential: true, suggestion: 'Highlight any AWS services you have used in past roles', resumeTip: 'Deployed and maintained services on AWS (EC2, RDS, S3) supporting 50k+ daily active users' },
          { area: 'CI/CD Pipelines', gap: 'No mention of CI/CD tooling like GitHub Actions or Jenkins, which the job description emphasizes', hasPotential: true, suggestion: 'Add any pipeline or deployment automation experience', resumeTip: 'Built and maintained GitHub Actions CI/CD pipelines reducing deployment time by 40%' },
        ],
        tailoringTips: [
          { section: 'Summary', suggested: 'Senior Backend Engineer with expertise in Node.js, TypeScript, and cloud-native architectures', reason: 'Mirrors the exact job title and core stack keywords for ATS matching' },
          { section: 'Skills', suggested: 'Add AWS, Docker, Kubernetes, GitHub Actions', reason: 'These keywords appear 4+ times in the job description and are likely in ATS filters' },
        ],
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

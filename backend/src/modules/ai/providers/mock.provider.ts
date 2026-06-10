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
        strengths: [
          'Enterprise systems architecture and integration experience demonstrates ability to work across complex, distributed systems',
          'Cloud platform experience with AWS and cloud-native patterns aligns well with cloud provisioning and operational responsibilities',
          'Backend API design and data pipeline experience supports understanding of system behavior and performance analysis',
          'Event-driven and API integration background matches the service orchestration requirements in the job description',
        ],
        gaps: [
          'No demonstrated SRE-specific experience: resume lacks mention of incident response, on-call rotations, or post-incident reviews',
          'Missing observability and monitoring expertise: no mention of APM tools, OpenTelemetry, Grafana, Splunk, dashboarding, or SLI/SLO definition as measurable criteria',
          'No CI/CD, platform, or infrastructure-as-code experience mentioned: lacks evidence of supporting cloud deployments, staged rollouts, or automated rollbacks',
          'Limited evidence of production support focus: resume emphasizes business systems architecture and enterprise integration rather than operational reliability and incident management',
        ],
        recommendations: [
          'Explicitly highlight any experience with incident response or production troubleshooting — frame system integrations as production-critical work requiring high availability',
          'Add a section detailing hands-on experience with monitoring, logging, or observability tools; if you obtain certifications or contribute to open-source projects demonstrating Grafana, Prometheus, or ELK stack skills',
          'Quantify and showcase any deployment automation or CI/CD work using specific tools (Jenkins, GitLab CI, GitHub Actions) and describe the scope of systems and infrastructure managed',
          'Reframe the Head of Technology role to emphasize operational involvement — detail platforms-handled incidents, monitored system health, and managed production workflows across integrated systems',
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

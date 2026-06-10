export default () => ({
  port: parseInt(process.env.PORT, 10) || 4000,
  nodeEnv: process.env.NODE_ENV || 'development',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',

  database: {
    url: process.env.DATABASE_URL,
  },

  jwt: {
    secret: process.env.JWT_SECRET || 'dev_jwt_secret_change_in_production',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },

  ai: {
    provider: (process.env.AI_PROVIDER || 'openai') as 'openai' | 'anthropic' | 'mock',
    openaiApiKey: process.env.OPENAI_API_KEY,
    anthropicApiKey: process.env.ANTHROPIC_API_KEY,
    openaiModel: process.env.OPENAI_MODEL || 'gpt-4o',
    anthropicModel: process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-6',
  },

  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY,
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
    proPriceId: process.env.STRIPE_PRO_PRICE_ID,
    premiumPriceId: process.env.STRIPE_PREMIUM_PRICE_ID,
    credits1000PriceId: process.env.STRIPE_CREDITS_1000_PRICE_ID,
    credits5000PriceId: process.env.STRIPE_CREDITS_5000_PRICE_ID,
    credits10000PriceId: process.env.STRIPE_CREDITS_10000_PRICE_ID,
  },

  credits: {
    freeInitial: parseInt(process.env.FREE_INITIAL_CREDITS, 10) || 1500,
    proMonthly: parseInt(process.env.PRO_MONTHLY_CREDITS, 10) || 5000,
    premiumMonthly: parseInt(process.env.PREMIUM_MONTHLY_CREDITS, 10) || 15000,
    maxMultiplier: parseFloat(process.env.MAX_CREDIT_MULTIPLIER) || 2,
    costs: {
      voiceInterview: parseInt(process.env.VOICE_INTERVIEW_CREDIT_COST, 10) || 50,
      feedbackReport: parseInt(process.env.FEEDBACK_REPORT_CREDIT_COST, 10) || 100,
      questionGeneration: parseInt(process.env.QUESTION_GENERATION_CREDIT_COST, 10) || 20,
      resumeAnalysis: parseInt(process.env.RESUME_ANALYSIS_CREDIT_COST, 10) || 75,
      jobAnalysis: parseInt(process.env.JOB_ANALYSIS_CREDIT_COST, 10) || 50,
      jobMatchAnalysis: parseInt(process.env.JOB_MATCH_ANALYSIS_CREDIT_COST, 10) || 300,
    },
  },

  admin: {
    email: process.env.ADMIN_EMAIL,
    freeForeverAccessCode: process.env.FREE_FOREVER_ACCESS_CODE || 'nextround_free_forever',
  },

  supabase: {
    url: process.env.SUPABASE_URL,
    anonKey: process.env.SUPABASE_ANON_KEY,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
    storageBucket: process.env.SUPABASE_STORAGE_BUCKET || 'nextround-resumes',
  },

  sentry: {
    dsn: process.env.SENTRY_DSN_BACKEND,
  },
});

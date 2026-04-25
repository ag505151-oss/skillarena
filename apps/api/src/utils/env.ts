import { z } from 'zod';

const envSchema = z.object({
  JWT_SECRET: z.string().min(16),
  DATABASE_URL: z.string().url(),
  FRONTEND_URL: z.string().url().optional(),
});

export function validateApiEnv(): void {
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    throw new Error(`Invalid API environment: ${parsed.error.issues.map((issue) => issue.path.join('.') + ' ' + issue.message).join('; ')}`);
  }
}

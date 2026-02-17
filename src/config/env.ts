import { createEnv } from '@/utils/createEnv';
import 'dotenv/config';

import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().int().min(0).max(65535).default(4000),
  MONGO_URL: z.url(),
  JWT_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string().default('1d'),
  JWT_REFRESH_SECRET: z.string().min(32),
  JWT_REFRESH_EXPIRES_IN: z.string().default('30d'),
  OPENAI_API_KEY: z.string().optional(), // Optional for MVP - can be added later
});

type EnvType = z.infer<typeof envSchema>;

export const env: EnvType = createEnv(envSchema);

export type Env = typeof env;

import type { ZodObject, ZodRawShape } from 'zod';

interface EnvOptions {
  source?: NodeJS.ProcessEnv;
}

type SchemaOutput<TSchema extends ZodRawShape> = ZodObject<TSchema>['_output'];

export const createEnv = <TSchema extends ZodRawShape>(
  schema: ZodObject<TSchema>,
  options: EnvOptions = {},
): SchemaOutput<TSchema> => {
  const { source = process.env } = options;

  const parsed = schema.safeParse(source);

  if (!parsed.success) {
    const formatedErrors = parsed.error.format();
    throw new Error(`Environment variable validation failed: ${JSON.stringify(formatedErrors)}`);
  }

  return parsed.data;
};

export type EnvSchema<TShape extends ZodRawShape> = ZodObject<TShape>;

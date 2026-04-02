import { z } from "zod";

const zodEnvSchema = z.object({
  NODE_ENV: z.string().default("development"),
  PORT: z.coerce.number().int().default(8080),
  APP_ORIGIN: z.url().default("http://localhost:3000"),
  DATABASE_URL: z.string().min(1),
  REFRESH_TOKEN_SECRET: z.string(),
  ACCESS_TOKEN_SECRET: z.string(),
  GOOGLE_CLIENT_ID: z.string().min(1),
  GOOGLE_CLIENT_SECRET: z.string().min(1),
  GOOGLE_REDIRECT_URI: z.string().min(1),
});

type EnvConfig = z.infer<typeof zodEnvSchema>;

interface EnvValidator {
  validate(env: unknown): EnvConfig;
}

class ZodEnvValidator implements EnvValidator {
  constructor(private readonly schema: z.ZodType<EnvConfig>) {}

  validate(env: unknown): EnvConfig {
    const result = this.schema.safeParse(env);

    if (!result.success) {
      throw new Error(
        "Invalid/Missing environment variables: " +
          z.flattenError(result.error).fieldErrors,
      );
    }
    return result.data;
  }
}

class EnvService {
  constructor(private readonly config: EnvConfig) {}

  get<K extends keyof EnvConfig>(key: K): EnvConfig[K] {
    return this.config[key];
  }

  getAll(): EnvConfig {
    return this.config;
  }
}

class EnvFactory {
  static create(env: unknown, validator: EnvValidator): EnvService {
    const validated = validator.validate(env);
    return new EnvService(validated);
  }
}

const validator = new ZodEnvValidator(zodEnvSchema);
const env = EnvFactory.create(process.env, validator);
export default env;

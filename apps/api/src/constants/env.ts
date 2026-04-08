import { z } from "zod";

const envSchema = z.object({
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

type EnvConfig = z.infer<typeof envSchema>;

export class ValidateEnv {
  constructor(private readonly data: unknown) {}

  public validate() {
    const { success, error, data } = envSchema.safeParse(this.data);
    if (!success) {
      throw new Error(
        "Invalid/Missing environment variables" +
          z.flattenError(error).fieldErrors,
      );
    }
    return data;
  }
}

export class EnvService {
  constructor(private readonly config: EnvConfig) {}

  get<K extends keyof EnvConfig>(key: K): EnvConfig[K] {
    return this.config[key];
  }

  getAll(): EnvConfig {
    return this.config;
  }
}

const validator = new ValidateEnv(process.env);
const data = validator.validate();
const env = new EnvService(data);
export default env;

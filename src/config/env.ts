import { config as dotenvConfig } from "dotenv";
import { z } from "zod";
dotenvConfig();

const envVariables = z.object({
  NODE_ENV: z.enum(["development", "production"]),
  DB_HOST: z.string(),
  DB_PORT: z.string(),
  DB_USERNAME: z.string(),
  DB_PASSWORD: z.string(),
  DB_NAME: z.string(),
  PORT: z.string(),
  HOST: z.string()
});

envVariables.parse(process.env);

declare global {
  namespace NodeJS {
    interface ProcessEnv extends z.infer<typeof envVariables> {}
  }
}

export const config = () => envVariables.parse(process.env);

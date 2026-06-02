import { cleanEnv, str, port, url } from "envalid";

export default function validateEnv() {
  const env = cleanEnv(process.env, {
    NODE_ENV: str({ choices: ['development', 'test', 'production'], default: 'development' }),
    PORT: port({ default: 5000 }),
    MONGO_URI: str(),
    JWT_SECRET: str(),
    JWT_REFRESH_SECRET: str(),
    CLIENT_URL: url(),
    BACKEND_URL: url({ default: 'http://localhost:5000' }),
    GOOGLE_CLIENT_ID: str()
  });

  // Enforce strong JWT secret
  if (env.JWT_SECRET.length < 32) {
    throw new Error('JWT_SECRET must be at least 32 characters long for security');
  }
  
  // Enforce strong JWT Refresh secret
  if (env.JWT_REFRESH_SECRET.length < 32) {
    throw new Error('JWT_REFRESH_SECRET must be at least 32 characters long for security');
  }

  return env;
}
import { registerAs } from '@nestjs/config';
import * as dotenv from 'dotenv';

dotenv.config({ path: `.env.${process.env.NODE_ENV || 'development'}` });

export interface DatabaseConfig {
  uri: string;
}

export interface JwtConfig {
  secret: string;
  expiresIn: string;
}

export interface AppConfig {
  port: number;
  nodeEnv: string;
}

export default registerAs('config', () => {
  const databaseConfig: DatabaseConfig = {
    uri: process.env.MONGODB_URI! || 'mongodb://localhost:27017/nest_web',
  };

  const jwtConfig: JwtConfig = {
    secret: process.env.JWT_SECRET! || 'your-secret-key',
    expiresIn: process.env.JWT_EXPIRES_IN! || '1d',
  };

  const appConfig: AppConfig = {
    port: parseInt(process.env.PORT!, 10) || 3000,
    nodeEnv: process.env.NODE_ENV! || 'development',
  };

  return {
    app: appConfig,
    database: databaseConfig,
    jwt: jwtConfig,
  };
});

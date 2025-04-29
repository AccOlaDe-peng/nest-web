import { registerAs } from '@nestjs/config';

export interface DatabaseConfig {
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
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
    host: process.env.DB_HOST! || 'localhost',
    port: parseInt(process.env.DB_PORT!, 10) || 5432,
    username: process.env.DB_USERNAME! || 'postgres',
    password: process.env.DB_PASSWORD! || 'postgres',
    database: process.env.DB_DATABASE! || 'nest_web',
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

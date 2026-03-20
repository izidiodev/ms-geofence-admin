import { DataSource, DataSourceOptions } from 'typeorm';

const isProduction = process.env.NODE_ENV === 'production';
const isDevelopment = process.env.NODE_ENV === 'development';

const options: DataSourceOptions = {
  type: 'postgres',
  url: process.env.DB_URL || 'localhost',
  ssl: isProduction ? { rejectUnauthorized: false } : false,
  synchronize: false,
  logging: isDevelopment,
  entities: ['src/modules/**/entities/*.entity.{ts,js}'],
  migrations: ['src/shared/infra/database/migrations/*.{ts,js}'],
};

export const AppDataSource = new DataSource(options);

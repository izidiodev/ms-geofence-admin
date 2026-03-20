import { DataSource, DataSourceOptions } from 'typeorm';
import { typeormEntities } from './register-entities.js';
import { typeormMigrations } from './register-migrations.js';

const isProduction = process.env.NODE_ENV === 'production';
const isDevelopment = process.env.NODE_ENV === 'development';

const options: DataSourceOptions = {
  type: 'postgres',
  url: process.env.DB_URL || 'localhost',
  ssl: isProduction ? { rejectUnauthorized: false } : false,
  synchronize: false,
  logging: isDevelopment,
  entities: typeormEntities,
  migrations: typeormMigrations,
};

export const AppDataSource = new DataSource(options);

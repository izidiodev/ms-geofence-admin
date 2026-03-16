import { DataSource, DataSourceOptions } from 'typeorm';

const options: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 5432,
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_DATABASE || 'ms_geofence_admin',
  synchronize: false,
  logging: process.env.NODE_ENV === 'development',
  entities: ['src/modules/**/entities/*.entity.{ts,js}'],
  migrations: ['src/shared/infra/database/migrations/*.{ts,js}'],
};

export const AppDataSource = new DataSource(options);

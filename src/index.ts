import 'dotenv/config';
import 'reflect-metadata';
import express from 'express';
import cors, { type CorsOptions } from 'cors';
import { registerAllModules } from './shared/container/modules.js';
import { AppDataSource } from './shared/infra/database/data-source.js';

const app = express();
const PORT = process.env.PORT || 3000;
const isDev = process.env.NODE_ENV !== 'production';

/** Produção: origens explícitas (evita refletir qualquer Origin). Dev: qualquer origem. */
const defaultProdOrigins = ['https://geofence-admin-dashboard.vercel.app'];
const fromEnv = process.env.CORS_ORIGINS?.split(',').map((o) => o.trim()).filter(Boolean);
const prodAllowedOrigins = fromEnv?.length ? fromEnv : defaultProdOrigins;

const corsOptions: CorsOptions = isDev
  ? { origin: true, credentials: true }
  : {
      credentials: true,
      origin(origin, callback) {
        if (!origin) {
          callback(null, true);
          return;
        }
        if (prodAllowedOrigins.includes(origin)) {
          callback(null, true);
          return;
        }
        callback(null, false);
      },
    };

app.use(cors(corsOptions));

app.use(express.json());

AppDataSource.initialize()
  .then(async () => {
    console.log('Database connected successfully');

    registerAllModules();

    const { default: routes } = await import('./routes/index.js');
    app.use('/api', routes);

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Error connecting to database:', error);
    process.exit(1);
  });

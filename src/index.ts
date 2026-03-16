import 'dotenv/config';
import 'reflect-metadata';
import express from 'express';
import cors from 'cors';
import { registerAllModules } from './shared/container/modules.js';
import { AppDataSource } from './shared/infra/database/data-source.js';

const app = express();
const PORT = process.env.PORT || 3000;
const isDev = process.env.NODE_ENV !== 'production';

if (isDev) {
  app.use(cors({ origin: true, credentials: true }));
}

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

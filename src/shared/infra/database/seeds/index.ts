import 'reflect-metadata';
import { AppDataSource } from '../data-source.js';
import { seedTypes } from './typeSeed.js';

async function runSeeds(): Promise<void> {
  try {
    console.log('Initializing database connection...');
    await AppDataSource.initialize();
    console.log('Database connected successfully\n');

    console.log('Running seeds...\n');

    console.log('--- Seeding Types ---');
    await seedTypes();

    console.log('\nAll seeds completed successfully!');
  } catch (error) {
    console.error('Error running seeds:', error);
    process.exit(1);
  } finally {
    await AppDataSource.destroy();
    process.exit(0);
  }
}

runSeeds();

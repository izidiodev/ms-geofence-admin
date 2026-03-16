import { AppDataSource } from '../data-source.js';
import { TypeEntity } from '@type/entities/type.entity.js';

const typesData = [
  {
    id: 'a1b2c3d4-e5f6-4a0b-8c1d-2e3f4a5b6c7d',
    name: 'enter',
    description: 'evento disparado quando entra em uma geofence',
  },
  {
    id: 'b2c3d4e5-f6a7-5b1c-9d2e-3f4a5b6c7d8e',
    name: 'dwell',
    description:
      'evento disparado quando fica em uma geofence por mais de x segundos',
  },
  {
    id: 'c3d4e5f6-a7b8-4c2d-8e3f-4a5b6c7d8e9f',
    name: 'exit',
    description: 'evento disparado quando sai de uma geofence',
  },
];

export async function seedTypes(): Promise<void> {
  const typeRepository = AppDataSource.getRepository(TypeEntity);
  const qr = AppDataSource.createQueryRunner();

  for (const typeData of typesData) {
    const existing = await typeRepository.findOneBy({ name: typeData.name });

    if (!existing) {
      const entity = typeRepository.create({
        id: typeData.id,
        name: typeData.name,
        description: typeData.description,
      });
      await typeRepository.save(entity);
      console.log(`Type '${typeData.name}' created successfully`);
    } else if (existing.id !== typeData.id) {
      // Tipo existe mas com ID diferente (ex.: exit com UUID inválido) — atualiza para o ID correto
      await qr.connect();
      await qr.startTransaction();
      try {
        await qr.query(
          'UPDATE campaigns SET type_id = $1 WHERE type_id = $2',
          [typeData.id, existing.id]
        );
        await qr.query('UPDATE types SET id = $1, description = $2 WHERE id = $3', [
          typeData.id,
          typeData.description ?? null,
          existing.id,
        ]);
        await qr.commitTransaction();
        console.log(
          `Type '${typeData.name}' updated to valid UUID (was ${existing.id}, now ${typeData.id})`
        );
      } catch (e) {
        await qr.rollbackTransaction();
        throw e;
      } finally {
        await qr.release();
      }
    } else {
      console.log(`Type '${typeData.name}' already exists, skipping...`);
    }
  }
}

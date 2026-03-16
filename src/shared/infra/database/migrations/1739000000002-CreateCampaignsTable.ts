import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateCampaignsTable1739000000002 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'campaigns',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'name',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'description',
            type: 'varchar',
            length: '500',
            isNullable: true,
          },
          {
            name: 'exp_date',
            type: 'date',
            isNullable: true,
          },
          {
            name: 'city_uf',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'type_id',
            type: 'uuid',
          },
          {
            name: 'enabled',
            type: 'boolean',
            default: true,
          },
          {
            name: 'lat',
            type: 'decimal',
            precision: 10,
            scale: 7,
          },
          {
            name: 'long',
            type: 'decimal',
            precision: 10,
            scale: 7,
          },
          {
            name: 'radius',
            type: 'integer',
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'now()',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'now()',
          },
          {
            name: 'is_deleted',
            type: 'boolean',
            default: false,
          },
        ],
        foreignKeys: [
          {
            columnNames: ['type_id'],
            referencedTableName: 'types',
            referencedColumnNames: ['id'],
            onDelete: 'RESTRICT',
          },
        ],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('campaigns');
  }
}

import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddDeliveryCountToCampaigns1739000000006 implements MigrationInterface {
  name = 'AddDeliveryCountToCampaigns1739000000006';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "campaigns"
      ADD COLUMN IF NOT EXISTS "delivery_count" integer NOT NULL DEFAULT 0
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "campaigns" DROP COLUMN IF EXISTS "delivery_count"
    `);
  }
}

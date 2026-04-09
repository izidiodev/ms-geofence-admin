import { MigrationInterface, QueryRunner } from 'typeorm';

export class CampaignRadiusDropItemRadius1739000000009 implements MigrationInterface {
  name = 'CampaignRadiusDropItemRadius1739000000009';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "campaigns"
      ADD COLUMN IF NOT EXISTS "radius" integer
    `);

    await queryRunner.query(`
      UPDATE "campaigns" c
      SET "radius" = i."radius"
      FROM (
        SELECT DISTINCT ON ("campaign_id") "campaign_id", "radius"
        FROM "item_campaign"
        ORDER BY "campaign_id", "created_at" ASC
      ) i
      WHERE c.id = i.campaign_id
    `);

    await queryRunner.query(`
      UPDATE "campaigns" SET "radius" = 500 WHERE "radius" IS NULL
    `);

    await queryRunner.query(`
      ALTER TABLE "campaigns" ALTER COLUMN "radius" SET NOT NULL
    `);

    await queryRunner.query(`
      ALTER TABLE "item_campaign" DROP COLUMN IF EXISTS "radius"
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "item_campaign"
      ADD COLUMN IF NOT EXISTS "radius" integer
    `);

    await queryRunner.query(`
      UPDATE "item_campaign" ic
      SET "radius" = c."radius"
      FROM "campaigns" c
      WHERE ic.campaign_id = c.id
    `);

    await queryRunner.query(`
      UPDATE "item_campaign" SET "radius" = 500 WHERE "radius" IS NULL
    `);

    await queryRunner.query(`
      ALTER TABLE "item_campaign" ALTER COLUMN "radius" SET NOT NULL
    `);

    await queryRunner.query(`
      ALTER TABLE "campaigns" DROP COLUMN IF EXISTS "radius"
    `);
  }
}

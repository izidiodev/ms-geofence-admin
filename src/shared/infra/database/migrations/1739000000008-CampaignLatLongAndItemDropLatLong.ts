import { MigrationInterface, QueryRunner } from 'typeorm';

export class CampaignLatLongAndItemDropLatLong1739000000008 implements MigrationInterface {
  name = 'CampaignLatLongAndItemDropLatLong1739000000008';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "campaigns"
      ADD COLUMN IF NOT EXISTS "lat" numeric(10,7),
      ADD COLUMN IF NOT EXISTS "long" numeric(10,7)
    `);

    await queryRunner.query(`
      UPDATE "campaigns" c
      SET
        "lat" = i."lat",
        "long" = i."long"
      FROM (
        SELECT DISTINCT ON ("campaign_id") "campaign_id", "lat", "long"
        FROM "item_campaign"
        ORDER BY "campaign_id", "created_at" ASC
      ) i
      WHERE c.id = i.campaign_id
    `);

    await queryRunner.query(`
      UPDATE "campaigns" SET "lat" = 0, "long" = 0 WHERE "lat" IS NULL
    `);

    await queryRunner.query(`
      ALTER TABLE "campaigns" ALTER COLUMN "lat" SET NOT NULL
    `);
    await queryRunner.query(`
      ALTER TABLE "campaigns" ALTER COLUMN "long" SET NOT NULL
    `);

    await queryRunner.query(`
      ALTER TABLE "item_campaign" DROP COLUMN IF EXISTS "lat"
    `);
    await queryRunner.query(`
      ALTER TABLE "item_campaign" DROP COLUMN IF EXISTS "long"
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "item_campaign"
      ADD COLUMN IF NOT EXISTS "lat" numeric(10,7),
      ADD COLUMN IF NOT EXISTS "long" numeric(10,7)
    `);

    await queryRunner.query(`
      UPDATE "item_campaign" ic
      SET "lat" = c."lat", "long" = c."long"
      FROM "campaigns" c
      WHERE ic.campaign_id = c.id
    `);

    await queryRunner.query(`
      UPDATE "item_campaign" SET "lat" = 0, "long" = 0 WHERE "lat" IS NULL
    `);

    await queryRunner.query(`
      ALTER TABLE "item_campaign" ALTER COLUMN "lat" SET NOT NULL
    `);
    await queryRunner.query(`
      ALTER TABLE "item_campaign" ALTER COLUMN "long" SET NOT NULL
    `);

    await queryRunner.query(`
      ALTER TABLE "campaigns" DROP COLUMN IF EXISTS "lat"
    `);
    await queryRunner.query(`
      ALTER TABLE "campaigns" DROP COLUMN IF EXISTS "long"
    `);
  }
}

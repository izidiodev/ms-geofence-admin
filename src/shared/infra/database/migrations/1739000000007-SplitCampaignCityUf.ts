import { MigrationInterface, QueryRunner } from 'typeorm';

export class SplitCampaignCityUf1739000000007 implements MigrationInterface {
  name = 'SplitCampaignCityUf1739000000007';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "campaigns"
      ADD COLUMN IF NOT EXISTS "city" character varying(255),
      ADD COLUMN IF NOT EXISTS "uf" character varying(10)
    `);

    await queryRunner.query(`
      UPDATE "campaigns" SET
        "city" = NULLIF(trim(split_part(COALESCE("city_uf", ''), '/', 1)), ''),
        "uf" = CASE
          WHEN position('/' in COALESCE("city_uf", '')) > 0
          THEN COALESCE(NULLIF(trim(split_part("city_uf", '/', 2)), ''), '')
          ELSE ''
        END
    `);

    await queryRunner.query(`
      UPDATE "campaigns" SET "city" = '-' WHERE "city" IS NULL OR "city" = ''
    `);

    await queryRunner.query(`
      ALTER TABLE "campaigns" ALTER COLUMN "city" SET NOT NULL
    `);
    await queryRunner.query(`
      ALTER TABLE "campaigns" ALTER COLUMN "uf" SET NOT NULL
    `);

    await queryRunner.query(`
      ALTER TABLE "campaigns" DROP COLUMN IF EXISTS "city_uf"
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "campaigns"
      ADD COLUMN IF NOT EXISTS "city_uf" character varying(255)
    `);

    await queryRunner.query(`
      UPDATE "campaigns" SET "city_uf" = CASE
        WHEN COALESCE(TRIM("uf"), '') = '' THEN TRIM("city")
        ELSE TRIM("city") || '/' || TRIM("uf")
      END
    `);

    await queryRunner.query(`
      ALTER TABLE "campaigns" DROP COLUMN IF EXISTS "city"
    `);
    await queryRunner.query(`
      ALTER TABLE "campaigns" DROP COLUMN IF EXISTS "uf"
    `);
  }
}

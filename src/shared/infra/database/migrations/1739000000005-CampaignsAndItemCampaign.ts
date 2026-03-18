import { MigrationInterface, QueryRunner } from 'typeorm';
import { randomUUID } from 'crypto';

export class CampaignsAndItemCampaign1739000000005 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "campaigns" RENAME TO "campaigns_legacy"`);

    await queryRunner.query(`
      CREATE TABLE "campaigns" (
        "id" uuid NOT NULL,
        "name" character varying(255) NOT NULL,
        "exp_date" date,
        "city_uf" character varying(255),
        "enabled" boolean NOT NULL DEFAULT true,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "is_deleted" boolean NOT NULL DEFAULT false,
        CONSTRAINT "PK_campaigns" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "item_campaign" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "title" character varying(255) NOT NULL,
        "description" character varying(500),
        "type_id" uuid NOT NULL,
        "lat" numeric(10,7) NOT NULL,
        "long" numeric(10,7) NOT NULL,
        "radius" integer NOT NULL,
        "campaign_id" uuid NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_item_campaign" PRIMARY KEY ("id"),
        CONSTRAINT "FK_item_campaign_type" FOREIGN KEY ("type_id") REFERENCES "types"("id") ON DELETE RESTRICT,
        CONSTRAINT "FK_item_campaign_campaign" FOREIGN KEY ("campaign_id") REFERENCES "campaigns"("id") ON DELETE CASCADE
      )
    `);

    const groups = (await queryRunner.query(
      `SELECT DISTINCT "campaign_group_id" AS g FROM "campaigns_legacy" WHERE "campaign_group_id" IS NOT NULL`
    )) as { g: string }[];

    for (const { g } of groups) {
      const items = (await queryRunner.query(
        `SELECT cl.*, t.name AS type_name FROM "campaigns_legacy" cl
         INNER JOIN "types" t ON t.id = cl.type_id
         WHERE cl.campaign_group_id = $1`,
        [g]
      )) as Record<string, unknown>[];

      if (items.length === 0) continue;

      const newCampaignId = randomUUID();
      const base = items[0];
      await queryRunner.query(
        `INSERT INTO "campaigns" ("id","name","exp_date","city_uf","enabled","created_at","updated_at","is_deleted")
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
        [
          newCampaignId,
          base.name,
          base.exp_date ?? null,
          base.city_uf ?? null,
          base.enabled,
          base.created_at,
          base.updated_at,
          base.is_deleted,
        ]
      );

      for (const row of items) {
        await queryRunner.query(
          `INSERT INTO "item_campaign" ("id","title","description","type_id","lat","long","radius","campaign_id","created_at","updated_at")
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
          [
            randomUUID(),
            row.name,
            row.description ?? null,
            row.type_id,
            row.lat,
            row.long,
            row.radius,
            newCampaignId,
            row.created_at,
            row.updated_at,
          ]
        );
      }
    }

    const orphans = (await queryRunner.query(
      `SELECT * FROM "campaigns_legacy" WHERE "campaign_group_id" IS NULL`
    )) as Record<string, unknown>[];

    for (const row of orphans) {
      await queryRunner.query(
        `INSERT INTO "campaigns" ("id","name","exp_date","city_uf","enabled","created_at","updated_at","is_deleted")
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
        [
          row.id,
          row.name,
          row.exp_date ?? null,
          row.city_uf ?? null,
          row.enabled,
          row.created_at,
          row.updated_at,
          row.is_deleted,
        ]
      );
      await queryRunner.query(
        `INSERT INTO "item_campaign" ("id","title","description","type_id","lat","long","radius","campaign_id","created_at","updated_at")
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
        [
          randomUUID(),
          row.name,
          row.description ?? null,
          row.type_id,
          row.lat,
          row.long,
          row.radius,
          row.id,
          row.created_at,
          row.updated_at,
        ]
      );
    }

    await queryRunner.query(`DROP TABLE "campaigns_legacy"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "item_campaign"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "campaigns"`);
    await queryRunner.query(`
      CREATE TABLE "campaigns" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying(255) NOT NULL,
        "description" character varying(500),
        "exp_date" date,
        "city_uf" character varying(255),
        "type_id" uuid NOT NULL,
        "campaign_group_id" uuid,
        "enabled" boolean NOT NULL DEFAULT true,
        "lat" numeric(10,7) NOT NULL,
        "long" numeric(10,7) NOT NULL,
        "radius" integer NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "is_deleted" boolean NOT NULL DEFAULT false,
        CONSTRAINT "PK_campaigns_old" PRIMARY KEY ("id"),
        CONSTRAINT "FK_campaigns_type" FOREIGN KEY ("type_id") REFERENCES "types"("id")
      )
    `);
  }
}

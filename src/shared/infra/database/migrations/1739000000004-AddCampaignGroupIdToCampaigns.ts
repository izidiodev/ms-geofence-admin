import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddCampaignGroupIdToCampaigns1739000000004 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'campaigns',
      new TableColumn({
        name: 'campaign_group_id',
        type: 'uuid',
        isNullable: true,
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('campaigns', 'campaign_group_id');
  }
}

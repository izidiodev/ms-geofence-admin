import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { TypeEntity } from '@type/entities/type.entity.js';

@Entity('campaigns')
export class CampaignEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'date', nullable: true })
  exp_date: Date | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  city_uf: string | null;

  @Column({ type: 'boolean', default: true })
  enabled: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @Column({ type: 'boolean', default: false })
  is_deleted: boolean;

  /** Incrementado a cada resposta do GET /campaigns/available (exposição ao app) */
  @Column({ type: 'int', default: 0 })
  delivery_count: number;

  @OneToMany(() => ItemCampaignEntity, (item) => item.campaign)
  items?: ItemCampaignEntity[];
}

@Entity('item_campaign')
export class ItemCampaignEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  description: string | null;

  @Column({ type: 'uuid' })
  type_id: string;

  @ManyToOne(() => TypeEntity)
  @JoinColumn({ name: 'type_id' })
  type?: TypeEntity;

  @Column({ type: 'decimal', precision: 10, scale: 7 })
  lat: string;

  @Column({ type: 'decimal', precision: 10, scale: 7 })
  long: string;

  @Column({ type: 'integer' })
  radius: number;

  @Column({ type: 'uuid' })
  campaign_id: string;

  @ManyToOne(() => CampaignEntity, (c) => c.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'campaign_id' })
  campaign?: CampaignEntity;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}

import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
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

  @Column({ type: 'varchar', length: 500, nullable: true })
  description: string | null;

  @Column({ type: 'date', nullable: true })
  exp_date: Date | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  city_uf: string | null;

  @Column({ type: 'uuid' })
  type_id: string;

  @Column({ type: 'uuid', nullable: true })
  campaign_group_id: string | null;

  @ManyToOne(() => TypeEntity)
  @JoinColumn({ name: 'type_id' })
  type?: TypeEntity;

  @Column({ type: 'boolean', default: true })
  enabled: boolean;

  @Column({ type: 'decimal', precision: 10, scale: 7 })
  lat: string;

  @Column({ type: 'decimal', precision: 10, scale: 7 })
  long: string;

  @Column({ type: 'integer' })
  radius: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @Column({ type: 'boolean', default: false })
  is_deleted: boolean;
}

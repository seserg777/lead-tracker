import { Entity, ManyToOne, PrimaryKey, Property } from '@mikro-orm/core';
import { Lead } from './lead.entity';

@Entity({ tableName: 'comment' })
export class Comment {
  @PrimaryKey({ autoincrement: true })
  id!: number;

  @ManyToOne(() => Lead, { deleteRule: 'cascade' })
  lead!: Lead;

  @Property({ length: 500 })
  text!: string;

  @Property()
  createdAt: Date = new Date();
}

import {
  BeforeUpdate,
  Collection,
  Entity,
  Enum,
  OneToMany,
  PrimaryKey,
  Property,
} from '@mikro-orm/core';
import { Comment } from './comment.entity';
import { LeadStatus } from './lead-status.enum';

@Entity({ tableName: 'lead' })
export class Lead {
  @PrimaryKey({ autoincrement: true })
  id!: number;

  @Property()
  name!: string;

  @Property({ nullable: true })
  email?: string;

  @Property({ nullable: true })
  company?: string;

  @Enum({ items: () => LeadStatus })
  status!: LeadStatus;

  @Property({ type: 'float', nullable: true })
  value?: number;

  @Property({ type: 'text', nullable: true })
  notes?: string;

  @Property()
  createdAt!: Date;

  @Property()
  updatedAt!: Date;

  @OneToMany(() => Comment, (comment) => comment.lead)
  comments = new Collection<Comment>(this);

  @BeforeUpdate()
  executeBeforeUpdate(): void {
    this.updatedAt = new Date();
  }
}

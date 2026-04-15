import { UnderscoreNamingStrategy } from '@mikro-orm/core';
import { defineConfig } from '@mikro-orm/mysql';
import { Migrator } from '@mikro-orm/migrations';
import { Comment } from './entities/comment.entity';
import { Lead } from './entities/lead.entity';

export default defineConfig({
  host: process.env.DATABASE_HOST ?? 'mysql-8.0.local',
  port: Number(process.env.DATABASE_PORT ?? 3306),
  user: process.env.DATABASE_USER ?? 'root',
  password: process.env.DATABASE_PASSWORD ?? '',
  dbName: process.env.DATABASE_NAME ?? 'lead-tracker',
  entities: [Lead, Comment],
  namingStrategy: UnderscoreNamingStrategy,
  migrations: {
    path: 'dist/migrations',
    pathTs: 'src/migrations',
  },
  extensions: [Migrator],
});

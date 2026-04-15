import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { UnderscoreNamingStrategy } from '@mikro-orm/core';
import { defineConfig } from '@mikro-orm/mysql';
import { Comment } from './entities/comment.entity';
import { Lead } from './entities/lead.entity';
import { LeadsModule } from './leads/leads.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MikroOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) =>
        defineConfig({
          entities: [Lead, Comment],
          host: config.get<string>('DATABASE_HOST', 'mysql-8.0.local'),
          port: config.get<number>('DATABASE_PORT', 3306),
          user: config.get<string>('DATABASE_USER', 'root'),
          password: config.get<string>('DATABASE_PASSWORD', ''),
          dbName: config.get<string>('DATABASE_NAME', 'lead-tracker'),
          debug: config.get<string>('NODE_ENV') !== 'production',
          namingStrategy: UnderscoreNamingStrategy,
        }),
    }),
    LeadsModule,
  ],
})
export class AppModule {}

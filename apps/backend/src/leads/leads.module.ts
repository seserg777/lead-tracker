import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Comment } from '../entities/comment.entity';
import { Lead } from '../entities/lead.entity';
import { CommentsController } from './comments.controller';
import { LeadsController } from './leads.controller';
import { LeadsService } from './leads.service';

@Module({
  imports: [MikroOrmModule.forFeature([Lead, Comment])],
  controllers: [LeadsController, CommentsController],
  providers: [LeadsService],
})
export class LeadsModule {}

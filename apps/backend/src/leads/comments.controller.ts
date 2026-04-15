import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CreateCommentDto } from './dto/create-comment.dto';
import { CommentResponse, LeadsService } from './leads.service';

@ApiTags('comments')
@Controller('leads/:leadId/comments')
export class CommentsController {
  constructor(private readonly leadsService: LeadsService) {}

  @Get()
  @ApiOperation({ summary: 'List comments for a lead' })
  @ApiOkResponse({ description: 'Comments list' })
  findAll(
    @Param('leadId', ParseIntPipe) leadId: number,
  ): Promise<CommentResponse[]> {
    return this.leadsService.findCommentsForLead(leadId);
  }

  @Post()
  @ApiOperation({ summary: 'Add comment to lead' })
  @ApiCreatedResponse({ description: 'Comment created' })
  create(
    @Param('leadId', ParseIntPipe) leadId: number,
    @Body() dto: CreateCommentDto,
  ): Promise<CommentResponse> {
    return this.leadsService.addComment(leadId, dto);
  }
}

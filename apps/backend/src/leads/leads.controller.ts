import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CreateLeadDto } from './dto/create-lead.dto';
import { QueryLeadsDto } from './dto/query-leads.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';
import {
  LeadResponse,
  LeadsService,
  PaginatedLeadsResponse,
} from './leads.service';

@ApiTags('leads')
@Controller('leads')
export class LeadsController {
  constructor(private readonly leadsService: LeadsService) {}

  @Get('admin/test')
  @ApiOperation({ summary: 'Smoke test' })
  @ApiOkResponse({ schema: { example: { ok: true } } })
  adminTest(): { ok: boolean } {
    return { ok: true };
  }

  @Get()
  @ApiOperation({ summary: 'List leads' })
  @ApiOkResponse({ description: 'Paginated leads' })
  findAll(@Query() query: QueryLeadsDto): Promise<PaginatedLeadsResponse> {
    return this.leadsService.findAll(query);
  }

  @Post()
  @ApiOperation({ summary: 'Create lead' })
  @ApiCreatedResponse({ description: 'Lead created' })
  create(@Body() createLeadDto: CreateLeadDto): Promise<LeadResponse> {
    return this.leadsService.create(createLeadDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get lead by id' })
  @ApiOkResponse({ description: 'Lead details' })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<LeadResponse> {
    return this.leadsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update lead' })
  @ApiOkResponse({ description: 'Updated lead' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateLeadDto: UpdateLeadDto,
  ): Promise<LeadResponse> {
    return this.leadsService.update(id, updateLeadDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete lead' })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.leadsService.remove(id);
  }
}

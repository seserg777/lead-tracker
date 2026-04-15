import { EntityManager, FilterQuery, QueryOrder } from '@mikro-orm/core';
import { Injectable, NotFoundException } from '@nestjs/common';
import { Comment } from '../entities/comment.entity';
import { Lead } from '../entities/lead.entity';
import { CreateCommentDto } from './dto/create-comment.dto';
import { CreateLeadDto } from './dto/create-lead.dto';
import { QueryLeadsDto } from './dto/query-leads.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';

export type LeadResponse = {
  id: number;
  name: string;
  email?: string;
  company?: string;
  status: string;
  value?: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
};

export type CommentResponse = {
  id: number;
  leadId: number;
  text: string;
  createdAt: Date;
};

export type PaginatedLeadsResponse = {
  data: LeadResponse[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

@Injectable()
export class LeadsService {
  constructor(private readonly em: EntityManager) {}

  async findAll(query: QueryLeadsDto): Promise<PaginatedLeadsResponse> {
    const page = query.page;
    const limit = query.limit;
    const offset = (page - 1) * limit;
    const andParts: FilterQuery<Lead>[] = [];
    if (query.status !== undefined) {
      andParts.push({ status: query.status });
    }
    if (query.q !== undefined && query.q.trim().length > 0) {
      const term = `%${query.q.trim()}%`;
      andParts.push({
        $or: [
          { name: { $like: term } },
          { email: { $like: term } },
          { company: { $like: term } },
        ],
      });
    }
    const where: FilterQuery<Lead> =
      andParts.length === 0
        ? {}
        : andParts.length === 1
          ? andParts[0]
          : { $and: andParts };
    const sortField = query.sort;
    const order = query.order === 'asc' ? QueryOrder.ASC : QueryOrder.DESC;
    const [items, total] = await this.em.findAndCount(Lead, where, {
      limit,
      offset,
      orderBy: { [sortField]: order },
    });
    const totalPages = total === 0 ? 0 : Math.ceil(total / limit);
    return {
      data: items.map((lead) => this.mapLead(lead)),
      meta: { page, limit, total, totalPages },
    };
  }

  async create(dto: CreateLeadDto): Promise<LeadResponse> {
    const now = new Date();
    const lead = this.em.create(Lead, {
      name: dto.name,
      email: dto.email,
      company: dto.company,
      status: dto.status,
      value: dto.value,
      notes: dto.notes,
      createdAt: now,
      updatedAt: now,
    });
    await this.em.persistAndFlush(lead);
    return this.mapLead(lead);
  }

  async findOne(id: number): Promise<LeadResponse> {
    const lead = await this.em.findOne(Lead, { id });
    if (lead === null) {
      throw new NotFoundException(`Lead with id ${id} not found`);
    }
    return this.mapLead(lead);
  }

  async update(id: number, dto: UpdateLeadDto): Promise<LeadResponse> {
    const lead = await this.em.findOne(Lead, { id });
    if (lead === null) {
      throw new NotFoundException(`Lead with id ${id} not found`);
    }
    this.em.assign(lead, dto);
    await this.em.flush();
    return this.mapLead(lead);
  }

  async remove(id: number): Promise<void> {
    const lead = await this.em.findOne(Lead, { id });
    if (lead === null) {
      throw new NotFoundException(`Lead with id ${id} not found`);
    }
    await this.em.removeAndFlush(lead);
  }

  async findCommentsForLead(leadId: number): Promise<CommentResponse[]> {
    await this.ensureLeadExists(leadId);
    const comments = await this.em.find(
      Comment,
      { lead: leadId },
      { orderBy: { createdAt: QueryOrder.ASC } },
    );
    return comments.map((comment) => this.mapComment(comment, leadId));
  }

  async addComment(
    leadId: number,
    dto: CreateCommentDto,
  ): Promise<CommentResponse> {
    await this.ensureLeadExists(leadId);
    const comment = this.em.create(Comment, {
      lead: this.em.getReference(Lead, leadId),
      text: dto.text,
      createdAt: new Date(),
    });
    await this.em.persistAndFlush(comment);
    return this.mapComment(comment, leadId);
  }

  private async ensureLeadExists(leadId: number): Promise<void> {
    const exists = await this.em.count(Lead, { id: leadId });
    if (exists === 0) {
      throw new NotFoundException(`Lead with id ${leadId} not found`);
    }
  }

  private mapLead(lead: Lead): LeadResponse {
    return {
      id: lead.id,
      name: lead.name,
      email: lead.email,
      company: lead.company,
      status: lead.status,
      value: lead.value,
      notes: lead.notes,
      createdAt: lead.createdAt,
      updatedAt: lead.updatedAt,
    };
  }

  private mapComment(comment: Comment, leadId: number): CommentResponse {
    return {
      id: comment.id,
      leadId,
      text: comment.text,
      createdAt: comment.createdAt,
    };
  }
}

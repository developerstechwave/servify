import { IsString, IsEnum, IsOptional, IsUUID } from 'class-validator';
import { IssueTopic } from '../entities/issue.entity';

export class CreateIssueDto {
  @IsEnum(IssueTopic)
  topic: IssueTopic;

  @IsString()
  description: string;

  @IsOptional()
  @IsUUID()
  serviceId?: string;

  @IsOptional()
  @IsString()
  serviceName?: string;
}

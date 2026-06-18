import { IsEnum, IsOptional, IsString } from 'class-validator';
import { IssueStatus } from '../entities/issue.entity';

export class UpdateIssueDto {
  @IsOptional()
  @IsEnum(IssueStatus)
  status?: IssueStatus;

  @IsOptional()
  @IsString()
  assigneeId?: string;

  @IsOptional()
  @IsString()
  assigneeName?: string;
}

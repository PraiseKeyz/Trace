import { IsString, IsOptional, IsNumber, Min } from 'class-validator';

export class ApplyOpportunityDto {
  @IsString()
  opportunity_id: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  match_score?: number;
}

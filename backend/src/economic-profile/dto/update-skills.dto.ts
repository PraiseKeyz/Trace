import { IsString, IsOptional, IsInt, IsArray, Min, Max } from 'class-validator';

export class UpdateSkillsDto {
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  skills?: string[];

  @IsString()
  @IsOptional()
  trade_category?: string;

  @IsInt()
  @Min(0)
  @Max(60)
  @IsOptional()
  years_active?: number;
}

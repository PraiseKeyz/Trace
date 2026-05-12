import { IsString, IsOptional, IsNumber, IsBoolean, IsArray, IsEnum, Min } from 'class-validator';

export class CreateOpportunityDto {
  @IsString()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  type: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  skills_required?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  languages_required?: string[];

  @IsString()
  @IsOptional()
  state?: string;

  @IsString()
  @IsOptional()
  city?: string;

  @IsNumber()
  @IsOptional()
  latitude?: number;

  @IsNumber()
  @IsOptional()
  longitude?: number;

  @IsBoolean()
  @IsOptional()
  is_remote?: boolean;

  @IsNumber()
  @Min(0)
  @IsOptional()
  pay_min?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  pay_max?: number;

  @IsString()
  @IsOptional()
  currency?: string;

  @IsString()
  @IsOptional()
  payment_method?: string;
}

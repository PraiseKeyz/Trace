import { IsString, IsOptional, IsNumber, IsEmail, IsBoolean, IsArray } from 'class-validator';

export class UpdateUserDto {
  @IsString()
  @IsOptional()
  full_name?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

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

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  languages?: string[];

  @IsString()
  @IsOptional()
  preferred_language?: string;

  @IsBoolean()
  @IsOptional()
  data_sharing_consent?: boolean;
}

import { IsString, IsOptional, IsNumber, IsEmail, IsBoolean, IsArray, IsIn, Matches } from 'class-validator';

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

  @IsIn(['1', '2'])
  @IsOptional()
  gender?: '1' | '2';

  @IsString()
  @IsOptional()
  @Matches(/^\d{2}\/\d{2}\/\d{4}$/, { message: 'DOB must be in DD/MM/YYYY format' })
  dob?: string;

  @IsIn(['trader', 'gig_worker'])
  @IsOptional()
  persona?: 'trader' | 'gig_worker';
}

import { IsArray, IsEmail, IsIn, IsNumber, IsOptional, IsString, Matches } from 'class-validator';


export class OnboardingDto {
  @IsIn(['trader', 'gig_worker'])
  @IsOptional()
  persona?: 'trader' | 'gig_worker';

  @IsString()
  @IsOptional()
  fullName?: string;

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

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  firstName?: string;

  @IsString()
  @IsOptional()
  lastName?: string;

  @IsString()
  @IsOptional()
  middleName?: string;

  @IsString()
  @IsOptional()
  @Matches(/^\d{11}$/)
  bvn?: string;

  @IsString()
  @IsOptional()
  @Matches(/^\d{2}\/\d{2}\/\d{4}$/)
  dob?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsIn(['1', '2'])
  @IsOptional()
  gender?: '1' | '2';

  @IsString()
  @IsOptional()
  @Matches(/^\d{10}$/)
  beneficiaryAccount?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  languages?: string[];
}

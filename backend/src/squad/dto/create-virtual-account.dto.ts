import { IsEmail, IsIn, IsOptional, IsString, Matches } from 'class-validator';

export class CreateVirtualAccountDto {
  @IsString()
  customer_identifier!: string;

  @IsString()
  first_name!: string;

  @IsString()
  last_name!: string;

  @IsString()
  @IsOptional()
  middle_name?: string;

  @IsString()
  @Matches(/^\d{11}$/)
  mobile_num!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @Matches(/^\d{11}$/)
  bvn!: string;

  @IsString()
  @Matches(/^\d{2}\/\d{2}\/\d{4}$/)
  dob!: string;

  @IsString()
  address!: string;

  @IsIn(['1', '2'])
  gender!: '1' | '2';

  @IsString()
  @IsOptional()
  @Matches(/^\d{10}$/)
  beneficiary_account?: string;
}

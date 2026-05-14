import { IsIn, IsString, Matches } from 'class-validator';

export class GenerateMyVirtualAccountDto {
  @IsString()
  @Matches(/^\d{11}$/, { message: 'BVN must be exactly 11 digits' })
  bvn: string;

  @IsString()
  @Matches(/^\d{2}\/\d{2}\/\d{4}$/, { message: 'DOB must be in DD/MM/YYYY format' })
  dob: string;

  @IsString()
  address: string;

  @IsIn(['1', '2'], { message: 'Gender must be 1 (Male) or 2 (Female)' })
  gender: '1' | '2';
}

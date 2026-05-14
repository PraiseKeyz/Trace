import { IsString, Matches } from 'class-validator';

export class LookupAccountDto {
  @IsString()
  bank_code: string;

  @IsString()
  @Matches(/^\d{10}$/)
  account_number: string;
}

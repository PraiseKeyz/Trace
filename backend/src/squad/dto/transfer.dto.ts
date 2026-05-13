import { IsIn, IsNumberString, IsString, Matches } from 'class-validator';

export class TransferDto {
  @IsString()
  remark!: string;

  @IsString()
  bank_code!: string;

  @IsIn(['NGN'])
  currency_id: 'NGN' = 'NGN';

  @IsNumberString()
  amount!: string;

  @IsString()
  @Matches(/^\d{10}$/)
  account_number!: string;

  @IsString()
  transaction_reference!: string;

  @IsString()
  account_name!: string;
}

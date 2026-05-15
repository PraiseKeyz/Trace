import { IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class WithdrawDto {
  @IsNumber()
  @Min(100, { message: 'Minimum withdrawal amount is ₦100' })
  amount: number;

  @IsString()
  @IsNotEmpty()
  bank_code: string;

  @IsString()
  @IsNotEmpty()
  account_number: string;

  @IsString()
  @IsNotEmpty()
  account_name: string;

  @IsString()
  @IsOptional()
  remark?: string;
}

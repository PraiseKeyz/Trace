import { IsNumber, Min } from 'class-validator';

export class DepositDto {
  @IsNumber()
  @Min(500, { message: 'Minimum deposit amount is ₦500' })
  amount: number; // in naira — converted to kobo at the Squad API boundary
}

import { IsString, IsNumber, IsIn, Min } from 'class-validator';

export class RefundDto {
  @IsString()
  gateway_transaction_ref!: string;

  @IsString()
  transaction_ref!: string;

  @IsNumber()
  @Min(1)
  refund_amount!: number;

  @IsIn(['full', 'partial'])
  refund_type!: 'full' | 'partial';

  @IsString()
  reason_for_refund!: string;
}

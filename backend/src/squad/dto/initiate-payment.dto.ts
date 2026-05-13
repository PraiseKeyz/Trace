import {
  IsArray,
  IsBoolean,
  IsEmail,
  IsIn,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  IsUrl,
  Min,
} from 'class-validator';

export class InitiatePaymentDto {
  @IsEmail()
  email!: string;

  @IsNumber()
  @Min(1)
  amount!: number;

  @IsIn(['inline'])
  initiate_type: 'inline' = 'inline';

  @IsIn(['NGN', 'USD'])
  currency: 'NGN' | 'USD' = 'NGN';

  @IsString()
  @IsOptional()
  transaction_ref?: string;

  @IsString()
  customer_name!: string;

  @IsUrl({ require_tld: false })
  callback_url!: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  payment_channels?: Array<'card' | 'bank' | 'ussd' | 'transfer'>;

  @IsObject()
  @IsOptional()
  metadata?: Record<string, unknown>;

  @IsBoolean()
  @IsOptional()
  pass_charge?: boolean;

  @IsString()
  @IsOptional()
  sub_merchant_id?: string;
}

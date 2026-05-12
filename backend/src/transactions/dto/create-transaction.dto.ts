import { IsString, IsNumber, IsOptional, IsEnum, IsObject, Min } from 'class-validator';

export enum TransactionType {
  CREDIT = 'credit',
  DEBIT = 'debit',
  TRANSFER = 'transfer',
  ESCROW = 'escrow',
}

export enum TransactionStatus {
  PENDING = 'pending',
  SUCCESSFUL = 'successful',
  FAILED = 'failed',
  REFUNDED = 'refunded',
}

export class CreateTransactionDto {
  @IsString()
  @IsOptional()
  counterparty_id?: string;

  @IsString()
  @IsOptional()
  squad_reference?: string;

  @IsEnum(TransactionType)
  type: string;

  @IsString()
  @IsOptional()
  category?: string;

  @IsNumber()
  @Min(0)
  amount: number;

  @IsString()
  @IsOptional()
  currency?: string;

  @IsEnum(TransactionStatus)
  @IsOptional()
  status?: string;

  @IsObject()
  @IsOptional()
  metadata?: any;
}

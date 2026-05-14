import { IsInt, IsOptional, IsString, IsIn, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class QueryVaTransactionsDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number = 1;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  perPage?: number = 20;

  @IsString()
  @IsOptional()
  virtualAccount?: string;

  @IsString()
  @IsOptional()
  customerIdentifier?: string;

  @IsString()
  @IsOptional()
  startDate?: string;

  @IsString()
  @IsOptional()
  endDate?: string;

  @IsString()
  @IsOptional()
  transactionReference?: string;

  @IsString()
  @IsOptional()
  session_id?: string;

  @IsIn(['ASC', 'DESC'])
  @IsOptional()
  dir?: 'ASC' | 'DESC' = 'DESC';
}

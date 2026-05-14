import { IsIn, IsInt, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class ListTransfersDto {
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

  @IsIn(['ASC', 'DESC'])
  @IsOptional()
  dir?: 'ASC' | 'DESC' = 'DESC';
}

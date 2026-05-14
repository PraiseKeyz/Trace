import { IsUUID, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateVouchDto {
  @IsUUID()
  recipient_id: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  message?: string;
}

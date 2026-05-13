import { IsString } from 'class-validator';

export class RequeryTransferDto {
  @IsString()
  transaction_reference: string;
}

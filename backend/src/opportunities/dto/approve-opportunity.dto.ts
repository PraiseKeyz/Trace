import { IsNumber, Min } from 'class-validator';

export class ApproveOpportunityDto {
  @IsNumber()
  @Min(1)
  agreed_amount: number;
}

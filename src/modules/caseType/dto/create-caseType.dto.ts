import { IsString, IsNotEmpty } from 'class-validator';

export class CreateCaseTypeDto {
  @IsString()
  @IsNotEmpty()
  name: string; // STORY / APPEAL / FUTURE TYPES
}

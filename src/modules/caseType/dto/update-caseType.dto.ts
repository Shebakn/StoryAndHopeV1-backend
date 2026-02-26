import { PartialType } from '@nestjs/mapped-types';
import { CreateCaseTypeDto } from './create-caseType.dto';

export class UpdateCaseTypeDto extends PartialType(CreateCaseTypeDto) {}

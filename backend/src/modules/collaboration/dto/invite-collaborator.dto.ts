import { IsEnum, IsInt, Min } from 'class-validator';
import { CollaborationRole } from '../../../types/enums';

export class InviteCollaboratorDto {
  @IsInt()
  @Min(1)
  userId!: number;

  @IsEnum(CollaborationRole)
  role!: CollaborationRole;
}

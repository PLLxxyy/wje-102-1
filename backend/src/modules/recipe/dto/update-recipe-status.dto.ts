import { IsEnum } from 'class-validator';
import { RecipeStatus } from '../../../types/enums';

export class UpdateRecipeStatusDto {
  @IsEnum(RecipeStatus)
  status!: RecipeStatus;
}

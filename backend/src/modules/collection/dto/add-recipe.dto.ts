import { IsInt, Min } from 'class-validator';

export class AddRecipeDto {
  @IsInt()
  @Min(1)
  recipeId!: number;
}

import { IsEnum, IsNumber, IsString, MaxLength, Min } from 'class-validator';
import { IngredientCategory } from '../../../types/enums';

export class CreateIngredientDto {
  @IsString()
  @MaxLength(50)
  name!: string;

  @IsEnum(IngredientCategory)
  category!: IngredientCategory;

  @IsNumber()
  @Min(0)
  calories_per_100g!: number;

  @IsNumber()
  @Min(0)
  protein_per_100g!: number;

  @IsNumber()
  @Min(0)
  fat_per_100g!: number;

  @IsNumber()
  @Min(0)
  carb_per_100g!: number;

  @IsString()
  @MaxLength(20)
  default_unit!: string;
}

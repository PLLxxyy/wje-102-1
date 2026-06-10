import { IsEnum, IsNumber, IsOptional, IsString, MaxLength, Min } from 'class-validator';
import { IngredientCategory } from '../../../types/enums';

export class UpdateIngredientDto {
  @IsOptional()
  @IsString()
  @MaxLength(50)
  name?: string;

  @IsOptional()
  @IsEnum(IngredientCategory)
  category?: IngredientCategory;

  @IsOptional()
  @IsNumber()
  @Min(0)
  calories_per_100g?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  protein_per_100g?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  fat_per_100g?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  carb_per_100g?: number;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  default_unit?: string;
}

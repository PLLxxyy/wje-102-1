import {
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { DifficultyLevel, RecipeCategory, RecipeStatus } from '../../../types/enums';

export class RecipeIngredientInputDto {
  @IsInt()
  @Min(1)
  ingredient_id!: number;

  @IsNumber()
  @Min(0.01)
  amount!: number;

  @IsString()
  @MaxLength(20)
  unit!: string;
}

export class RecipeStepInputDto {
  @IsInt()
  @Min(1)
  step_number!: number;

  @IsString()
  @MaxLength(2000)
  description!: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  image_url?: string | null;

  @IsOptional()
  @IsInt()
  @Min(1)
  duration_minutes?: number | null;
}

export class CreateRecipeDto {
  @IsString()
  @MaxLength(100)
  title!: string;

  @IsString()
  @MaxLength(2000)
  description!: string;

  @IsEnum(RecipeCategory)
  category!: RecipeCategory;

  @IsInt()
  @Min(1)
  servings!: number;

  @IsEnum(DifficultyLevel)
  difficulty!: DifficultyLevel;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  cover_image?: string | null;

  @IsOptional()
  @IsEnum(RecipeStatus)
  status?: RecipeStatus;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => RecipeIngredientInputDto)
  ingredients!: RecipeIngredientInputDto[];

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => RecipeStepInputDto)
  steps!: RecipeStepInputDto[];
}

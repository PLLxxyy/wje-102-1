import { DifficultyLevel, RecipeCategory, RecipeStatus } from '../../types/enums';

export interface RecipeIngredientSnapshot {
  ingredient_id: number;
  amount: number;
  unit: string;
}

export interface RecipeStepSnapshot {
  step_number: number;
  description: string;
  image_url: string | null;
  duration_minutes: number | null;
}

export interface RecipeSnapshot {
  title: string;
  description: string;
  category: RecipeCategory;
  servings: number;
  difficulty: DifficultyLevel;
  cover_image: string | null;
  status: RecipeStatus;
  ingredients: RecipeIngredientSnapshot[];
  steps: RecipeStepSnapshot[];
}

import {
  CollaborationRole,
  DifficultyLevel,
  RecipeCategory,
  RecipeStatus,
} from './enums';
import { Ingredient } from './ingredient';
import { User } from './user';

export interface RecipeStep {
  id: number;
  recipe_id: number;
  step_number: number;
  description: string;
  image_url: string | null;
  duration_minutes: number | null;
}

export interface RecipeIngredient {
  id: number;
  recipe_id: number;
  ingredient_id: number;
  ingredient: Ingredient;
  amount: number;
  unit: string;
}

export interface Recipe {
  id: number;
  title: string;
  description: string;
  category: RecipeCategory;
  servings: number;
  difficulty: DifficultyLevel;
  cover_image: string | null;
  status: RecipeStatus;
  author_id: number;
  author: User;
  total_calories: number | null;
  total_protein: number | null;
  total_fat: number | null;
  total_carb: number | null;
  steps: RecipeStep[];
  recipeIngredients: RecipeIngredient[];
  collaborations: Collaboration[];
  created_at: string;
  updated_at: string;
}

export interface RecipeIngredientInput {
  ingredient_id: number;
  amount: number;
  unit: string;
}

export interface RecipeStepInput {
  step_number: number;
  description: string;
  image_url?: string | null;
  duration_minutes?: number | null;
}

export interface RecipePayload {
  title: string;
  description: string;
  category: RecipeCategory;
  servings: number;
  difficulty: DifficultyLevel;
  cover_image?: string | null;
  status?: RecipeStatus;
  ingredients: RecipeIngredientInput[];
  steps: RecipeStepInput[];
}

export interface RecipeVersion {
  id: number;
  recipe_id: number;
  created_by_id: number | null;
  createdBy: User | null;
  snapshot: Omit<RecipePayload, 'ingredients' | 'steps'> & {
    ingredients: RecipeIngredientInput[];
    steps: Required<RecipeStepInput>[];
  };
  created_at: string;
}

export interface Collaboration {
  id: number;
  recipe_id: number;
  user_id: number;
  user: User;
  role: CollaborationRole;
  invited_at: string;
  accepted_at: string | null;
}

export interface RecipeQuery {
  category?: RecipeCategory;
  difficulty?: DifficultyLevel;
  status?: RecipeStatus;
  search?: string;
}

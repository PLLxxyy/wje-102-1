import type { DifficultyLevel, RecipeCategory, RecipeStatus } from './enums';

export interface User {
  id: number;
  username: string;
  email: string;
  avatar?: string | null;
  role: 'user' | 'admin';
}

export interface Ingredient {
  id: number;
  name: string;
  category: string;
  caloriesPer100g: number;
  proteinPer100g: number;
  fatPer100g: number;
  carbPer100g: number;
  defaultUnit: string;
}

export interface RecipeIngredient {
  id: number;
  ingredient: Ingredient;
  amount: number;
  unit: string;
}

export interface RecipeStep {
  id: number;
  stepNumber: number;
  description: string;
  durationMinutes?: number;
}

export interface Collaboration {
  id: number;
  user: User;
  role: 'viewer' | 'editor';
  acceptedAt?: string | null;
}

export interface Recipe {
  id: number;
  title: string;
  description: string;
  category: RecipeCategory;
  servings: number;
  difficulty: DifficultyLevel;
  status: RecipeStatus;
  author: User;
  totalCalories: number;
  totalProtein: number;
  totalFat: number;
  totalCarb: number;
  steps: RecipeStep[];
  ingredients: RecipeIngredient[];
  collaborations: Collaboration[];
}

export interface Collection {
  id: number;
  name: string;
  description?: string;
  isPublic: boolean;
  recipes: Recipe[];
}


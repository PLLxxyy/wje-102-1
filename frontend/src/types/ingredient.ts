import { IngredientCategory } from './enums';

export interface Ingredient {
  id: number;
  name: string;
  category: IngredientCategory;
  calories_per_100g: number;
  protein_per_100g: number;
  fat_per_100g: number;
  carb_per_100g: number;
  default_unit: string;
}

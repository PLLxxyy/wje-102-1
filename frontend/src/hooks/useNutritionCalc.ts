import { useMemo } from 'react';
import { Ingredient } from '../types/ingredient';
import { RecipeIngredientInput } from '../types/recipe';
import { calculateNutrition, NutritionTotals } from '../utils/nutrition';

export function useNutritionCalc(
  entries: RecipeIngredientInput[],
  ingredients: Ingredient[],
): NutritionTotals {
  return useMemo(() => calculateNutrition(entries, ingredients), [entries, ingredients]);
}

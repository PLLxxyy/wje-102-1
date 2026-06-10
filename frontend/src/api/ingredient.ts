import { IngredientCategory } from '../types/enums';
import { Ingredient } from '../types/ingredient';
import { request, unwrap } from '../utils/request';

export const ingredientApi = {
  list(params?: { search?: string; category?: IngredientCategory }): Promise<Ingredient[]> {
    return unwrap(request.get('/ingredients', { params }));
  },
};

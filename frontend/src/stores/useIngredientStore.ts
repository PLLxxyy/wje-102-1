import { create } from 'zustand';
import { ingredientApi } from '../api/ingredient';
import { Ingredient } from '../types/ingredient';

interface IngredientStore {
  ingredients: Ingredient[];
  loading: boolean;
  fetchIngredients: () => Promise<void>;
}

export const useIngredientStore = create<IngredientStore>((set) => ({
  ingredients: [],
  loading: false,
  fetchIngredients: async () => {
    set({ loading: true });
    try {
      const ingredients = await ingredientApi.list();
      set({ ingredients, loading: false });
    } catch {
      set({ loading: false });
    }
  },
}));

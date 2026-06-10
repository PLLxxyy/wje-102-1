import { create } from 'zustand';
import { recipeApi } from '../api/recipe';
import { Recipe, RecipeQuery } from '../types/recipe';

interface RecipeStore {
  recipes: Recipe[];
  myRecipes: Recipe[];
  currentRecipe: Recipe | null;
  loading: boolean;
  fetchRecipes: (query?: RecipeQuery) => Promise<void>;
  fetchMyRecipes: (search?: string) => Promise<void>;
  fetchRecipe: (id: number) => Promise<Recipe | null>;
}

export const useRecipeStore = create<RecipeStore>((set) => ({
  recipes: [],
  myRecipes: [],
  currentRecipe: null,
  loading: false,
  fetchRecipes: async (query) => {
    set({ loading: true });
    try {
      const recipes = await recipeApi.list(query);
      set({ recipes, loading: false });
    } catch {
      set({ loading: false });
    }
  },
  fetchMyRecipes: async (search) => {
    set({ loading: true });
    try {
      const myRecipes = await recipeApi.mine(search);
      set({ myRecipes, loading: false });
    } catch {
      set({ loading: false });
    }
  },
  fetchRecipe: async (id) => {
    set({ loading: true });
    try {
      const recipe = await recipeApi.detail(id);
      set({ currentRecipe: recipe, loading: false });
      return recipe;
    } catch {
      set({ loading: false });
      return null;
    }
  },
}));

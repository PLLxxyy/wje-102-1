import axios from 'axios';
import type { Recipe } from '../types/models';
import { DifficultyLevel, RecipeCategory, RecipeStatus } from '../types/enums';

export interface ApiResponse<T> {
  code: number;
  data: T;
  message: string;
}

const client = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 12000
});

client.interceptors.request.use((config) => {
  const token = window.localStorage.getItem('recipeworks_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export async function fetchRecipes(): Promise<Recipe[]> {
  try {
    const response = await client.get<ApiResponse<Recipe[]>>('/recipes');
    return response.data.data;
  } catch {
    return seedRecipes;
  }
}

export async function saveToken(token: string): Promise<void> {
  window.localStorage.setItem('recipeworks_token', token);
}

export const seedRecipes: Recipe[] = [
  {
    id: 1,
    title: '番茄牛腩协作版',
    description: '适合多人共创的家常硬菜，自动计算营养并保留步骤版本。',
    category: RecipeCategory.Meat,
    servings: 4,
    difficulty: DifficultyLevel.Medium,
    status: RecipeStatus.Published,
    author: { id: 1, username: '主厨阿宁', email: 'chef@example.com', role: 'admin' },
    totalCalories: 1680,
    totalProtein: 112,
    totalFat: 88,
    totalCarb: 92,
    ingredients: [
      {
        id: 1,
        amount: 500,
        unit: 'g',
        ingredient: {
          id: 1,
          name: '牛腩',
          category: '肉类',
          caloriesPer100g: 283,
          proteinPer100g: 19,
          fatPer100g: 21,
          carbPer100g: 0,
          defaultUnit: 'g'
        }
      },
      {
        id: 2,
        amount: 300,
        unit: 'g',
        ingredient: {
          id: 2,
          name: '番茄',
          category: '蔬菜',
          caloriesPer100g: 20,
          proteinPer100g: 0.9,
          fatPer100g: 0.2,
          carbPer100g: 4,
          defaultUnit: 'g'
        }
      }
    ],
    steps: [
      { id: 1, stepNumber: 1, description: '牛腩焯水后切块，番茄去皮切丁。', durationMinutes: 15 },
      { id: 2, stepNumber: 2, description: '炒香洋葱和番茄，加入牛腩小火炖煮。', durationMinutes: 80 }
    ],
    collaborations: [
      { id: 1, role: 'editor', acceptedAt: new Date().toISOString(), user: { id: 2, username: '营养师小周', email: 'nutri@example.com', role: 'user' } }
    ]
  }
];


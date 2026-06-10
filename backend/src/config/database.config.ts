import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { Collaboration } from '../modules/collaboration/collaboration.entity';
import { Collection } from '../modules/collection/collection.entity';
import { Ingredient } from '../modules/ingredient/ingredient.entity';
import { OperationLog } from '../modules/operation-log/operation-log.entity';
import { RecipeIngredient } from '../modules/recipe/recipe-ingredient.entity';
import { RecipeStep } from '../modules/recipe/recipe-step.entity';
import { RecipeVersion } from '../modules/recipe/recipe-version.entity';
import { Recipe } from '../modules/recipe/recipe.entity';
import { User } from '../modules/user/user.entity';

const parsePort = (value: string | undefined, fallback: number): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

export const databaseConfig = (): TypeOrmModuleOptions => ({
  type: 'mysql',
  host: process.env.DB_HOST ?? 'localhost',
  port: parsePort(process.env.DB_PORT, 3306),
  username: process.env.DB_USER ?? '',
  password: process.env.DB_PASSWORD ?? '',
  database: process.env.DB_NAME ?? 'recipe_works',
  entities: [
    User,
    Recipe,
    Ingredient,
    RecipeStep,
    RecipeIngredient,
    Collection,
    Collaboration,
    OperationLog,
    RecipeVersion,
  ],
  synchronize: true,
  charset: 'utf8mb4_unicode_ci',
});

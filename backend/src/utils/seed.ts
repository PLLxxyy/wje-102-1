import 'dotenv/config';
import * as bcrypt from 'bcrypt';
import { DataSource, DataSourceOptions, In, Repository } from 'typeorm';
import { databaseConfig } from '../config/database.config';
import {
  CollaborationRole,
  DifficultyLevel,
  IngredientCategory,
  RecipeCategory,
  RecipeStatus,
  UserRole,
} from '../types/enums';
import { Collaboration } from '../modules/collaboration/collaboration.entity';
import { Collection } from '../modules/collection/collection.entity';
import { Ingredient } from '../modules/ingredient/ingredient.entity';
import { RecipeIngredient } from '../modules/recipe/recipe-ingredient.entity';
import { RecipeStep } from '../modules/recipe/recipe-step.entity';
import { Recipe } from '../modules/recipe/recipe.entity';
import { User } from '../modules/user/user.entity';

interface SeedUser {
  username: string;
  email: string;
  password: string;
  role: UserRole;
  bio: string;
}

interface SeedIngredient {
  name: string;
  category: IngredientCategory;
  calories_per_100g: number;
  protein_per_100g: number;
  fat_per_100g: number;
  carb_per_100g: number;
  default_unit: string;
}

interface SeedRecipeIngredient {
  name: string;
  amount: number;
  unit: string;
}

interface SeedRecipeStep {
  description: string;
  duration_minutes: number;
}

interface SeedRecipe {
  title: string;
  description: string;
  category: RecipeCategory;
  difficulty: DifficultyLevel;
  servings: number;
  status: RecipeStatus;
  author: string;
  ingredients: SeedRecipeIngredient[];
  steps: SeedRecipeStep[];
}

const users: SeedUser[] = [
  {
    username: 'chef_wang',
    email: 'wang@example.com',
    password: '123456',
    role: UserRole.User,
    bio: '川菜爱好者，擅长麻辣口味',
  },
  {
    username: 'foodie_li',
    email: 'li@example.com',
    password: '123456',
    role: UserRole.User,
    bio: '甜品烘焙达人，分享简单易做的甜品',
  },
  {
    username: 'admin_zhang',
    email: 'zhang@example.com',
    password: 'admin123',
    role: UserRole.Admin,
    bio: '系统管理员',
  },
];

const ingredientRows: Array<[string, IngredientCategory, number, number, number, number, string]> = [
  ['鸡胸肉', IngredientCategory.Meat, 133, 31.0, 1.2, 0, 'g'],
  ['猪五花肉', IngredientCategory.Meat, 395, 14.0, 37.0, 0.8, 'g'],
  ['牛腩', IngredientCategory.Meat, 250, 17.1, 19.5, 0, 'g'],
  ['鸡蛋', IngredientCategory.Meat, 144, 13.3, 8.8, 2.8, '个'],
  ['虾仁', IngredientCategory.Seafood, 87, 18.6, 0.8, 2.8, 'g'],
  ['鲈鱼', IngredientCategory.Seafood, 105, 18.6, 3.4, 0, 'g'],
  ['西红柿', IngredientCategory.Vegetable, 18, 0.9, 0.2, 3.9, '个'],
  ['黄瓜', IngredientCategory.Vegetable, 16, 0.7, 0.1, 3.6, '根'],
  ['土豆', IngredientCategory.Vegetable, 77, 2.0, 0.1, 17.5, 'g'],
  ['胡萝卜', IngredientCategory.Vegetable, 41, 0.9, 0.2, 9.6, 'g'],
  ['青椒', IngredientCategory.Vegetable, 22, 0.9, 0.2, 5.4, '个'],
  ['豆腐', IngredientCategory.Vegetable, 81, 8.1, 3.7, 4.2, 'g'],
  ['大米', IngredientCategory.Staple, 346, 7.4, 0.8, 77.9, 'g'],
  ['面条', IngredientCategory.Staple, 301, 9.4, 1.6, 62.5, 'g'],
  ['面粉', IngredientCategory.Staple, 366, 11.2, 1.5, 73.6, 'g'],
  ['食用油', IngredientCategory.Seasoning, 899, 0, 99.9, 0, 'ml'],
  ['食盐', IngredientCategory.Seasoning, 0, 0, 0, 0, 'g'],
  ['生抽', IngredientCategory.Seasoning, 53, 5.6, 0.1, 8.2, 'ml'],
  ['白砂糖', IngredientCategory.Seasoning, 400, 0, 0, 99.9, 'g'],
  ['大蒜', IngredientCategory.Seasoning, 126, 4.5, 0.2, 27.6, 'g'],
  ['生姜', IngredientCategory.Seasoning, 41, 1.3, 0.2, 8.7, 'g'],
  ['牛奶', IngredientCategory.Other, 54, 3.0, 3.2, 3.4, 'ml'],
  ['淡奶油', IngredientCategory.Other, 340, 2.0, 35.0, 2.7, 'ml'],
  ['酵母', IngredientCategory.Other, 315, 40.4, 7.6, 40.0, 'g'],
];

const ingredients: SeedIngredient[] = ingredientRows.map(([name, category, calories, protein, fat, carb, unit]) => ({
  name,
  category,
  calories_per_100g: calories,
  protein_per_100g: protein,
  fat_per_100g: fat,
  carb_per_100g: carb,
  default_unit: unit,
}));

const recipes: SeedRecipe[] = [
  {
    title: '番茄炒蛋',
    category: RecipeCategory.Meat,
    difficulty: DifficultyLevel.Easy,
    servings: 2,
    status: RecipeStatus.Published,
    author: 'chef_wang',
    description: '家常经典，酸甜可口，十分钟快手菜',
    ingredients: [
      { name: '鸡蛋', amount: 3, unit: '个' },
      { name: '西红柿', amount: 2, unit: '个' },
      { name: '食用油', amount: 15, unit: 'ml' },
      { name: '食盐', amount: 2, unit: 'g' },
      { name: '白砂糖', amount: 5, unit: 'g' },
      { name: '大蒜', amount: 3, unit: 'g' },
    ],
    steps: [
      { description: '西红柿洗净切块，鸡蛋打散加少许盐搅匀', duration_minutes: 3 },
      { description: '热锅凉油，油温七成热时倒入蛋液，快速翻炒至凝固盛出', duration_minutes: 2 },
      { description: '锅中留底油，放入蒜末爆香，加入西红柿块翻炒出汁', duration_minutes: 3 },
      { description: '加入糖和盐调味，倒入炒好的鸡蛋翻炒均匀即可出锅', duration_minutes: 2 },
    ],
  },
  {
    title: '红烧牛腩',
    category: RecipeCategory.Meat,
    difficulty: DifficultyLevel.Hard,
    servings: 4,
    status: RecipeStatus.Published,
    author: 'chef_wang',
    description: '浓郁入味，软烂不柴，配米饭绝配',
    ingredients: [
      { name: '牛腩', amount: 500, unit: 'g' },
      { name: '土豆', amount: 200, unit: 'g' },
      { name: '胡萝卜', amount: 100, unit: 'g' },
      { name: '生抽', amount: 30, unit: 'ml' },
      { name: '食用油', amount: 20, unit: 'ml' },
      { name: '食盐', amount: 3, unit: 'g' },
      { name: '生姜', amount: 10, unit: 'g' },
      { name: '大蒜', amount: 5, unit: 'g' },
    ],
    steps: [
      { description: '牛腩切块，冷水下锅焯水去血沫，捞出备用', duration_minutes: 10 },
      { description: '土豆、胡萝卜去皮切滚刀块，生姜切片，大蒜拍碎', duration_minutes: 5 },
      { description: '热锅倒油，放入姜片蒜末爆香，加入牛腩翻炒至表面微焦', duration_minutes: 5 },
      { description: '加入生抽翻炒上色，倒入没过牛腩的热水，大火烧开转小火炖 60 分钟', duration_minutes: 65 },
      { description: '加入土豆和胡萝卜块，继续炖 20 分钟至软烂，加盐调味收汁', duration_minutes: 25 },
    ],
  },
  {
    title: '草莓奶油蛋糕',
    category: RecipeCategory.Dessert,
    difficulty: DifficultyLevel.Medium,
    servings: 6,
    status: RecipeStatus.Published,
    author: 'foodie_li',
    description: '轻盈绵密的奶油搭配新鲜草莓，下午茶首选',
    ingredients: [
      { name: '面粉', amount: 120, unit: 'g' },
      { name: '鸡蛋', amount: 4, unit: '个' },
      { name: '白砂糖', amount: 80, unit: 'g' },
      { name: '牛奶', amount: 60, unit: 'ml' },
      { name: '食用油', amount: 40, unit: 'ml' },
      { name: '淡奶油', amount: 300, unit: 'ml' },
    ],
    steps: [
      { description: '蛋黄蛋清分离。蛋黄中加入 30g 糖、牛奶、食用油搅匀，筛入面粉翻拌至无颗粒', duration_minutes: 5 },
      { description: '蛋清分三次加入 50g 糖，用电动打蛋器打发至硬性发泡', duration_minutes: 8 },
      { description: '取 1/3 蛋白霜加入蛋黄糊中翻拌均匀，再全部倒回蛋白霜中继续翻拌', duration_minutes: 3 },
      { description: '倒入 8 寸蛋糕模具，震出气泡，放入预热好的烤箱 160 度烤 40 分钟', duration_minutes: 45 },
      { description: '出炉倒扣晾凉后脱模。淡奶油打发至硬性，涂抹在蛋糕体上，装饰草莓即可', duration_minutes: 15 },
    ],
  },
];

async function upsertUsers(repository: Repository<User>): Promise<Map<string, User>> {
  const result = new Map<string, User>();
  for (const seedUser of users) {
    const passwordHash = await bcrypt.hash(seedUser.password, 10);
    const existing = await repository.findOne({ where: { username: seedUser.username } });
    const user = existing ?? repository.create({ username: seedUser.username, email: seedUser.email });
    user.email = seedUser.email;
    user.password_hash = passwordHash;
    user.role = seedUser.role;
    user.bio = seedUser.bio;
    user.avatar = null;
    result.set(seedUser.username, await repository.save(user));
  }
  return result;
}

async function upsertIngredients(repository: Repository<Ingredient>): Promise<Map<string, Ingredient>> {
  for (const seedIngredient of ingredients) {
    const existing = await repository.findOne({ where: { name: seedIngredient.name } });
    await repository.save(repository.create({ ...existing, ...seedIngredient }));
  }
  const saved = await repository.findBy({ name: In(ingredients.map((ingredient) => ingredient.name)) });
  return new Map(saved.map((ingredient) => [ingredient.name, ingredient]));
}

async function upsertRecipes(
  recipeRepository: Repository<Recipe>,
  stepRepository: Repository<RecipeStep>,
  recipeIngredientRepository: Repository<RecipeIngredient>,
  userMap: Map<string, User>,
  ingredientMap: Map<string, Ingredient>,
): Promise<Map<string, Recipe>> {
  const result = new Map<string, Recipe>();
  for (const seedRecipe of recipes) {
    const author = userMap.get(seedRecipe.author);
    if (!author) {
      throw new Error(`Missing seed author ${seedRecipe.author}`);
    }
    const existing = await recipeRepository.findOne({ where: { title: seedRecipe.title } });
    const recipe = existing ?? recipeRepository.create({ title: seedRecipe.title });
    recipe.description = seedRecipe.description;
    recipe.category = seedRecipe.category;
    recipe.difficulty = seedRecipe.difficulty;
    recipe.servings = seedRecipe.servings;
    recipe.status = seedRecipe.status;
    recipe.cover_image = null;
    recipe.author_id = author.id;
    const totals = calculateNutrition(seedRecipe.ingredients, ingredientMap);
    recipe.total_calories = totals.total_calories;
    recipe.total_protein = totals.total_protein;
    recipe.total_fat = totals.total_fat;
    recipe.total_carb = totals.total_carb;
    const savedRecipe = await recipeRepository.save(recipe);
    await stepRepository.delete({ recipe_id: savedRecipe.id });
    await recipeIngredientRepository.delete({ recipe_id: savedRecipe.id });
    await stepRepository.save(
      seedRecipe.steps.map((step, index) =>
        stepRepository.create({
          recipe_id: savedRecipe.id,
          step_number: index + 1,
          description: step.description,
          duration_minutes: step.duration_minutes,
          image_url: null,
        }),
      ),
    );
    await recipeIngredientRepository.save(
      seedRecipe.ingredients.map((item) => {
        const ingredient = ingredientMap.get(item.name);
        if (!ingredient) {
          throw new Error(`Missing seed ingredient ${item.name}`);
        }
        return recipeIngredientRepository.create({
          recipe_id: savedRecipe.id,
          ingredient_id: ingredient.id,
          amount: item.amount,
          unit: item.unit,
        });
      }),
    );
    result.set(seedRecipe.title, savedRecipe);
  }
  return result;
}

function calculateNutrition(
  recipeIngredients: SeedRecipeIngredient[],
  ingredientMap: Map<string, Ingredient>,
): {
  total_calories: number;
  total_protein: number;
  total_fat: number;
  total_carb: number;
} {
  const totals = recipeIngredients.reduce(
    (sum, item) => {
      const ingredient = ingredientMap.get(item.name);
      if (!ingredient) {
        throw new Error(`Missing ingredient ${item.name}`);
      }
      const ratio = item.amount / 100;
      return {
        total_calories: sum.total_calories + ingredient.calories_per_100g * ratio,
        total_protein: sum.total_protein + ingredient.protein_per_100g * ratio,
        total_fat: sum.total_fat + ingredient.fat_per_100g * ratio,
        total_carb: sum.total_carb + ingredient.carb_per_100g * ratio,
      };
    },
    { total_calories: 0, total_protein: 0, total_fat: 0, total_carb: 0 },
  );
  return {
    total_calories: round(totals.total_calories),
    total_protein: round(totals.total_protein),
    total_fat: round(totals.total_fat),
    total_carb: round(totals.total_carb),
  };
}

async function seedCollections(
  collectionRepository: Repository<Collection>,
  userMap: Map<string, User>,
  recipeMap: Map<string, Recipe>,
): Promise<void> {
  const owner = userMap.get('foodie_li');
  const recipe = recipeMap.get('番茄炒蛋');
  if (!owner || !recipe) {
    return;
  }
  const existing = await collectionRepository.findOne({
    where: { user_id: owner.id, name: '家常快手收藏' },
    relations: { recipes: true },
  });
  const collection =
    existing ??
    collectionRepository.create({
      user_id: owner.id,
      name: '家常快手收藏',
      description: '下班后也能稳定复现的家常菜',
      is_public: true,
      recipes: [],
    });
  collection.recipes = [recipe];
  await collectionRepository.save(collection);
}

async function seedCollaborations(
  collaborationRepository: Repository<Collaboration>,
  userMap: Map<string, User>,
  recipeMap: Map<string, Recipe>,
): Promise<void> {
  const collaborator = userMap.get('foodie_li');
  const recipe = recipeMap.get('红烧牛腩');
  if (!collaborator || !recipe) {
    return;
  }
  const existing = await collaborationRepository.findOne({
    where: { recipe_id: recipe.id, user_id: collaborator.id },
  });
  const collaboration =
    existing ??
    collaborationRepository.create({
      recipe_id: recipe.id,
      user_id: collaborator.id,
    });
  collaboration.role = CollaborationRole.Editor;
  collaboration.accepted_at = new Date();
  await collaborationRepository.save(collaboration);
}

function round(value: number): number {
  return Math.round(value * 100) / 100;
}

async function run(): Promise<void> {
  const dataSource = new DataSource(databaseConfig() as DataSourceOptions);
  await dataSource.initialize();
  try {
    const userMap = await upsertUsers(dataSource.getRepository(User));
    const ingredientMap = await upsertIngredients(dataSource.getRepository(Ingredient));
    const recipeMap = await upsertRecipes(
      dataSource.getRepository(Recipe),
      dataSource.getRepository(RecipeStep),
      dataSource.getRepository(RecipeIngredient),
      userMap,
      ingredientMap,
    );
    await seedCollections(dataSource.getRepository(Collection), userMap, recipeMap);
    await seedCollaborations(dataSource.getRepository(Collaboration), userMap, recipeMap);
    console.log('Seed data has been synchronized.');
  } finally {
    await dataSource.destroy();
  }
}

void run();

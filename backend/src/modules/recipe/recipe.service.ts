import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, In, Repository } from 'typeorm';
import { JwtUser } from '../../common/interfaces/jwt-user.interface';
import { CollaborationRole, RecipeStatus, UserRole } from '../../types/enums';
import { Collaboration } from '../collaboration/collaboration.entity';
import { Ingredient } from '../ingredient/ingredient.entity';
import { CreateRecipeDto, RecipeIngredientInputDto, RecipeStepInputDto } from './dto/create-recipe.dto';
import { UpdateRecipeDto } from './dto/update-recipe.dto';
import { RecipeIngredient } from './recipe-ingredient.entity';
import { RecipeSnapshot } from './recipe-snapshot.interface';
import { RecipeStep } from './recipe-step.entity';
import { RecipeVersion } from './recipe-version.entity';
import { Recipe } from './recipe.entity';

export interface RecipeQuery {
  category?: string;
  difficulty?: string;
  status?: RecipeStatus;
  search?: string;
  authorId?: number;
  allStatuses?: boolean;
}

interface NutritionTotals {
  total_calories: number;
  total_protein: number;
  total_fat: number;
  total_carb: number;
}

@Injectable()
export class RecipeService {
  constructor(
    @InjectRepository(Recipe)
    private readonly recipeRepository: Repository<Recipe>,
    @InjectRepository(RecipeStep)
    private readonly stepRepository: Repository<RecipeStep>,
    @InjectRepository(RecipeIngredient)
    private readonly recipeIngredientRepository: Repository<RecipeIngredient>,
    @InjectRepository(Ingredient)
    private readonly ingredientRepository: Repository<Ingredient>,
    @InjectRepository(Collaboration)
    private readonly collaborationRepository: Repository<Collaboration>,
    @InjectRepository(RecipeVersion)
    private readonly versionRepository: Repository<RecipeVersion>,
  ) {}

  async findAll(query: RecipeQuery): Promise<Recipe[]> {
    const builder = this.baseQuery();
    if (query.category) {
      builder.andWhere('recipe.category = :category', { category: query.category });
    }
    if (query.difficulty) {
      builder.andWhere('recipe.difficulty = :difficulty', { difficulty: query.difficulty });
    }
    if (query.status) {
      builder.andWhere('recipe.status = :status', { status: query.status });
    } else if (!query.allStatuses) {
      builder.andWhere('recipe.status = :status', { status: RecipeStatus.Published });
    }
    if (query.authorId) {
      builder.andWhere('recipe.author_id = :authorId', { authorId: query.authorId });
    }
    if (query.search && query.search.trim().length > 0) {
      const keyword = `%${query.search.trim()}%`;
      builder.andWhere(
        new Brackets((nested) => {
          nested
            .where('recipe.title LIKE :keyword', { keyword })
            .orWhere('recipe.description LIKE :keyword', { keyword });
        }),
      );
    }
    return builder.orderBy('recipe.updated_at', 'DESC').getMany();
  }

  async findMine(userId: number, search?: string): Promise<Recipe[]> {
    return this.findAll({
      authorId: userId,
      search,
      allStatuses: true,
    });
  }

  async findOne(id: number): Promise<Recipe> {
    const recipe = await this.baseQuery().where('recipe.id = :id', { id }).getOne();
    if (!recipe) {
      throw new NotFoundException('菜谱不存在');
    }
    recipe.steps = recipe.steps.sort((a, b) => a.step_number - b.step_number);
    recipe.recipeIngredients = recipe.recipeIngredients.sort((a, b) => a.id - b.id);
    return recipe;
  }

  async create(dto: CreateRecipeDto, user: JwtUser): Promise<Recipe> {
    const recipe = await this.recipeRepository.save(
      this.recipeRepository.create({
        title: dto.title,
        description: dto.description,
        category: dto.category,
        servings: dto.servings,
        difficulty: dto.difficulty,
        cover_image: dto.cover_image ?? null,
        status: dto.status ?? RecipeStatus.Draft,
        author_id: user.id,
      }),
    );
    await this.replaceRecipeIngredients(recipe.id, dto.ingredients);
    await this.replaceSteps(recipe.id, dto.steps);
    await this.applyNutrition(recipe.id, dto.ingredients);
    const saved = await this.findOne(recipe.id);
    await this.createSnapshot(saved, user.id);
    return saved;
  }

  async update(id: number, dto: UpdateRecipeDto, user: JwtUser): Promise<Recipe> {
    const recipe = await this.findOne(id);
    await this.assertCanEdit(recipe, user);
    if (dto.title !== undefined) recipe.title = dto.title;
    if (dto.description !== undefined) recipe.description = dto.description;
    if (dto.category !== undefined) recipe.category = dto.category;
    if (dto.servings !== undefined) recipe.servings = dto.servings;
    if (dto.difficulty !== undefined) recipe.difficulty = dto.difficulty;
    if (dto.cover_image !== undefined) recipe.cover_image = dto.cover_image ?? null;
    if (dto.status !== undefined) recipe.status = dto.status;
    await this.recipeRepository.save(recipe);

    if (dto.ingredients !== undefined) {
      await this.replaceRecipeIngredients(recipe.id, dto.ingredients);
      await this.applyNutrition(recipe.id, dto.ingredients);
    }
    if (dto.steps !== undefined) {
      await this.replaceSteps(recipe.id, dto.steps);
    }
    const saved = await this.findOne(recipe.id);
    await this.createSnapshot(saved, user.id);
    return saved;
  }

  async updateStatus(id: number, status: RecipeStatus, user: JwtUser): Promise<Recipe> {
    return this.update(id, { status }, user);
  }

  async remove(id: number, user: JwtUser): Promise<{ deleted: true }> {
    const recipe = await this.findOne(id);
    await this.assertCanEdit(recipe, user);
    await this.recipeRepository.remove(recipe);
    return { deleted: true };
  }

  async getVersions(id: number, user: JwtUser): Promise<RecipeVersion[]> {
    const recipe = await this.findOne(id);
    await this.assertCanView(recipe, user);
    return this.versionRepository.find({
      where: { recipe_id: id },
      relations: { createdBy: true },
      order: { created_at: 'DESC' },
    });
  }

  async rollback(id: number, versionId: number, user: JwtUser): Promise<Recipe> {
    const recipe = await this.findOne(id);
    await this.assertCanEdit(recipe, user);
    const version = await this.versionRepository.findOne({
      where: { id: versionId, recipe_id: id },
    });
    if (!version) {
      throw new NotFoundException('菜谱版本不存在');
    }
    const snapshot = version.snapshot;
    recipe.title = snapshot.title;
    recipe.description = snapshot.description;
    recipe.category = snapshot.category;
    recipe.servings = snapshot.servings;
    recipe.difficulty = snapshot.difficulty;
    recipe.cover_image = snapshot.cover_image;
    recipe.status = snapshot.status;
    await this.recipeRepository.save(recipe);
    await this.replaceRecipeIngredients(recipe.id, snapshot.ingredients);
    await this.replaceSteps(recipe.id, snapshot.steps);
    await this.applyNutrition(recipe.id, snapshot.ingredients);
    const saved = await this.findOne(recipe.id);
    await this.createSnapshot(saved, user.id);
    return saved;
  }

  private baseQuery() {
    return this.recipeRepository
      .createQueryBuilder('recipe')
      .leftJoinAndSelect('recipe.author', 'author')
      .leftJoinAndSelect('recipe.steps', 'steps')
      .leftJoinAndSelect('recipe.recipeIngredients', 'recipeIngredients')
      .leftJoinAndSelect('recipeIngredients.ingredient', 'ingredient')
      .leftJoinAndSelect('recipe.collaborations', 'collaborations')
      .leftJoinAndSelect('collaborations.user', 'collaborationUser');
  }

  private async replaceRecipeIngredients(
    recipeId: number,
    ingredients: RecipeIngredientInputDto[],
  ): Promise<void> {
    await this.recipeIngredientRepository.delete({ recipe_id: recipeId });
    const records = ingredients.map((item) =>
      this.recipeIngredientRepository.create({
        recipe_id: recipeId,
        ingredient_id: item.ingredient_id,
        amount: item.amount,
        unit: item.unit,
      }),
    );
    await this.recipeIngredientRepository.save(records);
  }

  private async replaceSteps(recipeId: number, steps: RecipeStepInputDto[]): Promise<void> {
    await this.stepRepository.delete({ recipe_id: recipeId });
    const records = steps
      .slice()
      .sort((a, b) => a.step_number - b.step_number)
      .map((step, index) =>
        this.stepRepository.create({
          recipe_id: recipeId,
          step_number: index + 1,
          description: step.description,
          image_url: step.image_url ?? null,
          duration_minutes: step.duration_minutes ?? null,
        }),
      );
    await this.stepRepository.save(records);
  }

  private async applyNutrition(
    recipeId: number,
    ingredientInputs: RecipeIngredientInputDto[],
  ): Promise<void> {
    const totals = await this.calculateNutrition(ingredientInputs);
    await this.recipeRepository.update(recipeId, totals);
  }

  private async calculateNutrition(
    ingredientInputs: RecipeIngredientInputDto[],
  ): Promise<NutritionTotals> {
    const ids = ingredientInputs.map((item) => item.ingredient_id);
    const ingredients = await this.ingredientRepository.findBy({ id: In(ids) });
    const ingredientMap = new Map(ingredients.map((ingredient) => [ingredient.id, ingredient]));
    const totals = ingredientInputs.reduce<NutritionTotals>(
      (sum, item) => {
        const ingredient = ingredientMap.get(item.ingredient_id);
        if (!ingredient) {
          throw new NotFoundException(`食材 ${item.ingredient_id} 不存在`);
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
      total_calories: this.round(totals.total_calories),
      total_protein: this.round(totals.total_protein),
      total_fat: this.round(totals.total_fat),
      total_carb: this.round(totals.total_carb),
    };
  }

  private async assertCanView(recipe: Recipe, user: JwtUser): Promise<void> {
    if (recipe.status === RecipeStatus.Published || recipe.author_id === user.id) {
      return;
    }
    const collaboration = await this.collaborationRepository.findOne({
      where: { recipe_id: recipe.id, user_id: user.id },
    });
    if (!collaboration || !collaboration.accepted_at) {
      throw new ForbiddenException('无权查看该菜谱');
    }
  }

  private async assertCanEdit(recipe: Recipe, user: JwtUser): Promise<void> {
    if (user.role === UserRole.Admin || recipe.author_id === user.id) {
      return;
    }
    const collaboration = await this.collaborationRepository.findOne({
      where: { recipe_id: recipe.id, user_id: user.id, role: CollaborationRole.Editor },
    });
    if (!collaboration || !collaboration.accepted_at) {
      throw new ForbiddenException('无权编辑该菜谱');
    }
  }

  private async createSnapshot(recipe: Recipe, createdById: number): Promise<void> {
    const snapshot: RecipeSnapshot = {
      title: recipe.title,
      description: recipe.description,
      category: recipe.category,
      servings: recipe.servings,
      difficulty: recipe.difficulty,
      cover_image: recipe.cover_image,
      status: recipe.status,
      ingredients: recipe.recipeIngredients.map((item) => ({
        ingredient_id: item.ingredient_id,
        amount: item.amount,
        unit: item.unit,
      })),
      steps: recipe.steps.map((step) => ({
        step_number: step.step_number,
        description: step.description,
        image_url: step.image_url,
        duration_minutes: step.duration_minutes,
      })),
    };
    await this.versionRepository.save(
      this.versionRepository.create({
        recipe_id: recipe.id,
        created_by_id: createdById,
        snapshot,
      }),
    );
  }

  private round(value: number): number {
    return Math.round(value * 100) / 100;
  }
}

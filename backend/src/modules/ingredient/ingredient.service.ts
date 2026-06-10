import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';
import { IngredientCategory } from '../../types/enums';
import { CreateIngredientDto } from './dto/create-ingredient.dto';
import { UpdateIngredientDto } from './dto/update-ingredient.dto';
import { Ingredient } from './ingredient.entity';

@Injectable()
export class IngredientService {
  constructor(
    @InjectRepository(Ingredient)
    private readonly ingredientRepository: Repository<Ingredient>,
  ) {}

  async findAll(search?: string, category?: IngredientCategory): Promise<Ingredient[]> {
    const query = this.ingredientRepository.createQueryBuilder('ingredient');
    if (search && search.trim().length > 0) {
      const keyword = `%${search.trim()}%`;
      query.andWhere(
        new Brackets((builder) => {
          builder.where('ingredient.name LIKE :keyword', { keyword });
        }),
      );
    }
    if (category) {
      query.andWhere('ingredient.category = :category', { category });
    }
    return query.orderBy('ingredient.category', 'ASC').addOrderBy('ingredient.name', 'ASC').getMany();
  }

  async findById(id: number): Promise<Ingredient> {
    const ingredient = await this.ingredientRepository.findOne({ where: { id } });
    if (!ingredient) {
      throw new NotFoundException('食材不存在');
    }
    return ingredient;
  }

  create(dto: CreateIngredientDto): Promise<Ingredient> {
    return this.ingredientRepository.save(this.ingredientRepository.create(dto));
  }

  async update(id: number, dto: UpdateIngredientDto): Promise<Ingredient> {
    const ingredient = await this.findById(id);
    Object.assign(ingredient, dto);
    return this.ingredientRepository.save(ingredient);
  }

  async remove(id: number): Promise<{ deleted: true }> {
    const ingredient = await this.findById(id);
    await this.ingredientRepository.remove(ingredient);
    return { deleted: true };
  }
}

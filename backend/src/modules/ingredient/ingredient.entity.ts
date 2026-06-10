import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { decimalTransformer } from '../../common/transformers/decimal.transformer';
import { IngredientCategory } from '../../types/enums';
import { RecipeIngredient } from '../recipe/recipe-ingredient.entity';

@Entity('ingredients')
export class Ingredient {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 50, unique: true })
  name!: string;

  @Column({ type: 'enum', enum: IngredientCategory })
  category!: IngredientCategory;

  @Column({ type: 'decimal', precision: 8, scale: 2, transformer: decimalTransformer })
  calories_per_100g!: number;

  @Column({ type: 'decimal', precision: 8, scale: 2, transformer: decimalTransformer })
  protein_per_100g!: number;

  @Column({ type: 'decimal', precision: 8, scale: 2, transformer: decimalTransformer })
  fat_per_100g!: number;

  @Column({ type: 'decimal', precision: 8, scale: 2, transformer: decimalTransformer })
  carb_per_100g!: number;

  @Column({ length: 20 })
  default_unit!: string;

  @OneToMany(() => RecipeIngredient, (recipeIngredient) => recipeIngredient.ingredient)
  recipeIngredients!: RecipeIngredient[];
}

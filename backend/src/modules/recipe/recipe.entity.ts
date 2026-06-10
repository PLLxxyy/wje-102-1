import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { decimalTransformer } from '../../common/transformers/decimal.transformer';
import { DifficultyLevel, RecipeCategory, RecipeStatus } from '../../types/enums';
import { Collaboration } from '../collaboration/collaboration.entity';
import { Collection } from '../collection/collection.entity';
import { User } from '../user/user.entity';
import { RecipeIngredient } from './recipe-ingredient.entity';
import { RecipeStep } from './recipe-step.entity';
import { RecipeVersion } from './recipe-version.entity';

@Entity('recipes')
export class Recipe {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 100 })
  title!: string;

  @Column({ type: 'text' })
  description!: string;

  @Column({ type: 'enum', enum: RecipeCategory })
  category!: RecipeCategory;

  @Column({ type: 'int' })
  servings!: number;

  @Column({ type: 'enum', enum: DifficultyLevel })
  difficulty!: DifficultyLevel;

  @Column({ name: 'cover_image', type: 'varchar', length: 500, nullable: true })
  cover_image!: string | null;

  @Column({ type: 'enum', enum: RecipeStatus, default: RecipeStatus.Draft })
  status!: RecipeStatus;

  @Column({ name: 'author_id' })
  author_id!: number;

  @ManyToOne(() => User, (user) => user.recipes, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'author_id' })
  author!: User;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
    transformer: decimalTransformer,
  })
  total_calories!: number | null;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
    transformer: decimalTransformer,
  })
  total_protein!: number | null;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
    transformer: decimalTransformer,
  })
  total_fat!: number | null;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
    transformer: decimalTransformer,
  })
  total_carb!: number | null;

  @OneToMany(() => RecipeStep, (step) => step.recipe, { cascade: true })
  steps!: RecipeStep[];

  @OneToMany(() => RecipeIngredient, (recipeIngredient) => recipeIngredient.recipe, {
    cascade: true,
  })
  recipeIngredients!: RecipeIngredient[];

  @OneToMany(() => Collaboration, (collaboration) => collaboration.recipe)
  collaborations!: Collaboration[];

  @OneToMany(() => RecipeVersion, (version) => version.recipe)
  versions!: RecipeVersion[];

  @ManyToMany(() => Collection, (collection) => collection.recipes)
  collections!: Collection[];

  @CreateDateColumn({ name: 'created_at' })
  created_at!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at!: Date;
}

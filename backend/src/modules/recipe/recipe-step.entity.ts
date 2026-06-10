import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Recipe } from './recipe.entity';

@Entity('recipe_steps')
export class RecipeStep {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'recipe_id' })
  recipe_id!: number;

  @ManyToOne(() => Recipe, (recipe) => recipe.steps, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'recipe_id' })
  recipe!: Recipe;

  @Column({ name: 'step_number', type: 'int' })
  step_number!: number;

  @Column({ type: 'text' })
  description!: string;

  @Column({ name: 'image_url', type: 'varchar', length: 500, nullable: true })
  image_url!: string | null;

  @Column({ name: 'duration_minutes', type: 'int', nullable: true })
  duration_minutes!: number | null;
}

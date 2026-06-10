import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../user/user.entity';
import { RecipeSnapshot } from './recipe-snapshot.interface';
import { Recipe } from './recipe.entity';

@Entity('recipe_versions')
export class RecipeVersion {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'recipe_id' })
  recipe_id!: number;

  @ManyToOne(() => Recipe, (recipe) => recipe.versions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'recipe_id' })
  recipe!: Recipe;

  @Column({ name: 'created_by_id', type: 'int', nullable: true })
  created_by_id!: number | null;

  @ManyToOne(() => User, (user) => user.recipeVersions, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'created_by_id' })
  createdBy!: User | null;

  @Column({ type: 'json' })
  snapshot!: RecipeSnapshot;

  @CreateDateColumn({ name: 'created_at' })
  created_at!: Date;
}

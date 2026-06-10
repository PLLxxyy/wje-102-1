import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { CollaborationRole } from '../../types/enums';
import { Recipe } from '../recipe/recipe.entity';
import { User } from '../user/user.entity';

@Entity('collaborations')
export class Collaboration {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'recipe_id' })
  recipe_id!: number;

  @ManyToOne(() => Recipe, (recipe) => recipe.collaborations, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'recipe_id' })
  recipe!: Recipe;

  @Column({ name: 'user_id' })
  user_id!: number;

  @ManyToOne(() => User, (user) => user.collaborations, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Column({ type: 'enum', enum: CollaborationRole, default: CollaborationRole.Viewer })
  role!: CollaborationRole;

  @Column({ name: 'invited_at', type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  invited_at!: Date;

  @Column({ name: 'accepted_at', type: 'datetime', nullable: true })
  accepted_at!: Date | null;
}

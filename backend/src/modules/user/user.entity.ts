import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Collaboration } from '../collaboration/collaboration.entity';
import { Collection } from '../collection/collection.entity';
import { OperationLog } from '../operation-log/operation-log.entity';
import { RecipeVersion } from '../recipe/recipe-version.entity';
import { Recipe } from '../recipe/recipe.entity';
import { UserRole } from '../../types/enums';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 50, unique: true })
  username!: string;

  @Column({ length: 100, unique: true })
  email!: string;

  @Column({ length: 255, select: false })
  password_hash!: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  avatar!: string | null;

  @Column({ type: 'text', nullable: true })
  bio!: string | null;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.User })
  role!: UserRole;

  @OneToMany(() => Recipe, (recipe) => recipe.author)
  recipes!: Recipe[];

  @OneToMany(() => Collection, (collection) => collection.user)
  collections!: Collection[];

  @OneToMany(() => Collaboration, (collaboration) => collaboration.user)
  collaborations!: Collaboration[];

  @OneToMany(() => OperationLog, (log) => log.user)
  operationLogs!: OperationLog[];

  @OneToMany(() => RecipeVersion, (version) => version.createdBy)
  recipeVersions!: RecipeVersion[];

  @CreateDateColumn({ name: 'created_at' })
  created_at!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at!: Date;
}

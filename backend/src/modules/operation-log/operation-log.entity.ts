import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../user/user.entity';

@Entity('operation_logs')
export class OperationLog {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'user_id', type: 'int', nullable: true })
  user_id!: number | null;

  @ManyToOne(() => User, (user) => user.operationLogs, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'user_id' })
  user!: User | null;

  @Column({ length: 50 })
  action!: string;

  @Column({ length: 50 })
  resource!: string;

  @Column({ name: 'resource_id', type: 'int', nullable: true })
  resource_id!: number | null;

  @Column({ type: 'text', nullable: true })
  detail!: string | null;

  @Column({ length: 50 })
  ip!: string;

  @CreateDateColumn({ name: 'created_at' })
  created_at!: Date;
}

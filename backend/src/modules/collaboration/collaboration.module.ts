import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Recipe } from '../recipe/recipe.entity';
import { User } from '../user/user.entity';
import { CollaborationController } from './collaboration.controller';
import { Collaboration } from './collaboration.entity';
import { CollaborationGateway } from './collaboration.gateway';
import { CollaborationService } from './collaboration.service';

@Module({
  imports: [TypeOrmModule.forFeature([Collaboration, Recipe, User])],
  controllers: [CollaborationController],
  providers: [CollaborationService, CollaborationGateway],
  exports: [CollaborationService, TypeOrmModule],
})
export class CollaborationModule {}

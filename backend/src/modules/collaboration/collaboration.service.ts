import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtUser } from '../../common/interfaces/jwt-user.interface';
import { CollaborationRole, UserRole } from '../../types/enums';
import { Recipe } from '../recipe/recipe.entity';
import { User } from '../user/user.entity';
import { InviteCollaboratorDto } from './dto/invite-collaborator.dto';
import { Collaboration } from './collaboration.entity';

@Injectable()
export class CollaborationService {
  constructor(
    @InjectRepository(Collaboration)
    private readonly collaborationRepository: Repository<Collaboration>,
    @InjectRepository(Recipe)
    private readonly recipeRepository: Repository<Recipe>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async listForRecipe(recipeId: number, user: JwtUser): Promise<Collaboration[]> {
    const recipe = await this.findRecipe(recipeId);
    await this.assertRecipeOwner(recipe, user);
    return this.collaborationRepository.find({
      where: { recipe_id: recipeId },
      relations: { user: true },
      order: { invited_at: 'DESC' },
    });
  }

  async invite(recipeId: number, dto: InviteCollaboratorDto, user: JwtUser): Promise<Collaboration> {
    const recipe = await this.findRecipe(recipeId);
    await this.assertRecipeOwner(recipe, user);
    const invitedUser = await this.userRepository.findOne({ where: { id: dto.userId } });
    if (!invitedUser) {
      throw new NotFoundException('协作者不存在');
    }
    const existing = await this.collaborationRepository.findOne({
      where: { recipe_id: recipeId, user_id: dto.userId },
      relations: { user: true },
    });
    if (existing) {
      existing.role = dto.role;
      return this.collaborationRepository.save(existing);
    }
    return this.collaborationRepository.save(
      this.collaborationRepository.create({
        recipe_id: recipeId,
        user_id: dto.userId,
        role: dto.role,
        accepted_at: null,
      }),
    );
  }

  async accept(id: number, user: JwtUser): Promise<Collaboration> {
    const collaboration = await this.collaborationRepository.findOne({
      where: { id },
      relations: { user: true, recipe: true },
    });
    if (!collaboration) {
      throw new NotFoundException('协作邀请不存在');
    }
    if (collaboration.user_id !== user.id) {
      throw new ForbiddenException('无权接受该协作邀请');
    }
    collaboration.accepted_at = new Date();
    return this.collaborationRepository.save(collaboration);
  }

  async canEdit(recipeId: number, userId: number): Promise<boolean> {
    const recipe = await this.recipeRepository.findOne({ where: { id: recipeId } });
    if (!recipe) {
      return false;
    }
    if (recipe.author_id === userId) {
      return true;
    }
    const collaboration = await this.collaborationRepository.findOne({
      where: { recipe_id: recipeId, user_id: userId, role: CollaborationRole.Editor },
    });
    return Boolean(collaboration?.accepted_at);
  }

  private async findRecipe(recipeId: number): Promise<Recipe> {
    const recipe = await this.recipeRepository.findOne({ where: { id: recipeId } });
    if (!recipe) {
      throw new NotFoundException('菜谱不存在');
    }
    return recipe;
  }

  private async assertRecipeOwner(recipe: Recipe, user: JwtUser): Promise<void> {
    if (recipe.author_id !== user.id && user.role !== UserRole.Admin) {
      throw new ForbiddenException('只有作者可以管理协作者');
    }
  }
}

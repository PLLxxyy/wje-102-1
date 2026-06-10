import { Body, Controller, Get, Param, ParseIntPipe, Post, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { JwtUser } from '../../common/interfaces/jwt-user.interface';
import { Collaboration } from './collaboration.entity';
import { CollaborationService } from './collaboration.service';
import { InviteCollaboratorDto } from './dto/invite-collaborator.dto';

@Controller('collaborations')
@UseGuards(JwtAuthGuard)
export class CollaborationController {
  constructor(private readonly collaborationService: CollaborationService) {}

  @Get('recipes/:recipeId')
  listForRecipe(
    @Param('recipeId', ParseIntPipe) recipeId: number,
    @CurrentUser() user: JwtUser,
  ): Promise<Collaboration[]> {
    return this.collaborationService.listForRecipe(recipeId, user);
  }

  @Post('recipes/:recipeId/invite')
  invite(
    @Param('recipeId', ParseIntPipe) recipeId: number,
    @Body() dto: InviteCollaboratorDto,
    @CurrentUser() user: JwtUser,
  ): Promise<Collaboration> {
    return this.collaborationService.invite(recipeId, dto, user);
  }

  @Post(':id/accept')
  accept(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: JwtUser): Promise<Collaboration> {
    return this.collaborationService.accept(id, user);
  }
}

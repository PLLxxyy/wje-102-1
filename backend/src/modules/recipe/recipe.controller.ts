import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { JwtUser } from '../../common/interfaces/jwt-user.interface';
import { RecipeStatus } from '../../types/enums';
import { CreateRecipeDto } from './dto/create-recipe.dto';
import { UpdateRecipeStatusDto } from './dto/update-recipe-status.dto';
import { UpdateRecipeDto } from './dto/update-recipe.dto';
import { RecipeVersion } from './recipe-version.entity';
import { Recipe } from './recipe.entity';
import { RecipeService } from './recipe.service';

@Controller('recipes')
export class RecipeController {
  constructor(private readonly recipeService: RecipeService) {}

  @Get()
  findAll(
    @Query('category') category?: string,
    @Query('difficulty') difficulty?: string,
    @Query('status') status?: RecipeStatus,
    @Query('search') search?: string,
  ): Promise<Recipe[]> {
    return this.recipeService.findAll({ category, difficulty, status, search });
  }

  @Get('my')
  @UseGuards(JwtAuthGuard)
  findMine(@CurrentUser() user: JwtUser, @Query('search') search?: string): Promise<Recipe[]> {
    return this.recipeService.findMine(user.id, search);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() dto: CreateRecipeDto, @CurrentUser() user: JwtUser): Promise<Recipe> {
    return this.recipeService.create(dto, user);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Recipe> {
    return this.recipeService.findOne(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateRecipeDto,
    @CurrentUser() user: JwtUser,
  ): Promise<Recipe> {
    return this.recipeService.update(id, dto, user);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard)
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateRecipeStatusDto,
    @CurrentUser() user: JwtUser,
  ): Promise<Recipe> {
    return this.recipeService.updateStatus(id, dto.status, user);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: JwtUser): Promise<{ deleted: true }> {
    return this.recipeService.remove(id, user);
  }

  @Get(':id/versions')
  @UseGuards(JwtAuthGuard)
  versions(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: JwtUser,
  ): Promise<RecipeVersion[]> {
    return this.recipeService.getVersions(id, user);
  }

  @Post(':id/versions/:versionId/rollback')
  @UseGuards(JwtAuthGuard)
  rollback(
    @Param('id', ParseIntPipe) id: number,
    @Param('versionId', ParseIntPipe) versionId: number,
    @CurrentUser() user: JwtUser,
  ): Promise<Recipe> {
    return this.recipeService.rollback(id, versionId, user);
  }
}

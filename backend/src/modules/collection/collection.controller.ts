import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { JwtUser } from '../../common/interfaces/jwt-user.interface';
import { AddRecipeDto } from './dto/add-recipe.dto';
import { CreateCollectionDto } from './dto/create-collection.dto';
import { UpdateCollectionDto } from './dto/update-collection.dto';
import { Collection } from './collection.entity';
import { CollectionService } from './collection.service';

@Controller('collections')
@UseGuards(JwtAuthGuard)
export class CollectionController {
  constructor(private readonly collectionService: CollectionService) {}

  @Get()
  findMine(@CurrentUser() user: JwtUser): Promise<Collection[]> {
    return this.collectionService.findMine(user.id);
  }

  @Post()
  create(@CurrentUser() user: JwtUser, @Body() dto: CreateCollectionDto): Promise<Collection> {
    return this.collectionService.create(user.id, dto);
  }

  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: JwtUser,
    @Body() dto: UpdateCollectionDto,
  ): Promise<Collection> {
    return this.collectionService.update(id, user.id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: JwtUser): Promise<{ deleted: true }> {
    return this.collectionService.remove(id, user.id);
  }

  @Post(':id/recipes')
  addRecipe(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: JwtUser,
    @Body() dto: AddRecipeDto,
  ): Promise<Collection> {
    return this.collectionService.addRecipe(id, user.id, dto.recipeId);
  }

  @Delete(':id/recipes/:recipeId')
  removeRecipe(
    @Param('id', ParseIntPipe) id: number,
    @Param('recipeId', ParseIntPipe) recipeId: number,
    @CurrentUser() user: JwtUser,
  ): Promise<Collection> {
    return this.collectionService.removeRecipe(id, user.id, recipeId);
  }
}

import { RecipeStatus } from '../types/enums';
import { DeleteResult } from '../types/api';
import {
  Collaboration,
  Recipe,
  RecipePayload,
  RecipeQuery,
  RecipeVersion,
} from '../types/recipe';
import { CollaborationRole } from '../types/enums';
import { request, unwrap } from '../utils/request';

export const recipeApi = {
  list(params?: RecipeQuery): Promise<Recipe[]> {
    return unwrap(request.get('/recipes', { params }));
  },
  mine(search?: string): Promise<Recipe[]> {
    return unwrap(request.get('/recipes/my', { params: { search } }));
  },
  detail(id: number): Promise<Recipe> {
    return unwrap(request.get(`/recipes/${id}`));
  },
  create(payload: RecipePayload): Promise<Recipe> {
    return unwrap(request.post('/recipes', payload));
  },
  update(id: number, payload: Partial<RecipePayload>): Promise<Recipe> {
    return unwrap(request.put(`/recipes/${id}`, payload));
  },
  updateStatus(id: number, status: RecipeStatus): Promise<Recipe> {
    return unwrap(request.patch(`/recipes/${id}/status`, { status }));
  },
  remove(id: number): Promise<DeleteResult> {
    return unwrap(request.delete(`/recipes/${id}`));
  },
  versions(id: number): Promise<RecipeVersion[]> {
    return unwrap(request.get(`/recipes/${id}/versions`));
  },
  rollback(id: number, versionId: number): Promise<Recipe> {
    return unwrap(request.post(`/recipes/${id}/versions/${versionId}/rollback`));
  },
  collaborations(recipeId: number): Promise<Collaboration[]> {
    return unwrap(request.get(`/collaborations/recipes/${recipeId}`));
  },
  invite(recipeId: number, userId: number, role: CollaborationRole): Promise<Collaboration> {
    return unwrap(request.post(`/collaborations/recipes/${recipeId}/invite`, { userId, role }));
  },
  acceptCollaboration(id: number): Promise<Collaboration> {
    return unwrap(request.post(`/collaborations/${id}/accept`));
  },
};

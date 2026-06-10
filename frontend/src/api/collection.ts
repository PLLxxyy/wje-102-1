import { DeleteResult } from '../types/api';
import { Collection } from '../types/collection';
import { request, unwrap } from '../utils/request';

export interface CollectionPayload {
  name: string;
  description?: string | null;
  is_public?: boolean;
}

export const collectionApi = {
  list(): Promise<Collection[]> {
    return unwrap(request.get('/collections'));
  },
  create(payload: CollectionPayload): Promise<Collection> {
    return unwrap(request.post('/collections', payload));
  },
  update(id: number, payload: Partial<CollectionPayload>): Promise<Collection> {
    return unwrap(request.put(`/collections/${id}`, payload));
  },
  remove(id: number): Promise<DeleteResult> {
    return unwrap(request.delete(`/collections/${id}`));
  },
  addRecipe(id: number, recipeId: number): Promise<Collection> {
    return unwrap(request.post(`/collections/${id}/recipes`, { recipeId }));
  },
  removeRecipe(id: number, recipeId: number): Promise<Collection> {
    return unwrap(request.delete(`/collections/${id}/recipes/${recipeId}`));
  },
};

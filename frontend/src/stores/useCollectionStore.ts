import { create } from 'zustand';
import { collectionApi } from '../api/collection';
import { Collection } from '../types/collection';

interface CollectionStore {
  collections: Collection[];
  loading: boolean;
  fetchCollections: () => Promise<void>;
}

export const useCollectionStore = create<CollectionStore>((set) => ({
  collections: [],
  loading: false,
  fetchCollections: async () => {
    set({ loading: true });
    try {
      const collections = await collectionApi.list();
      set({ collections, loading: false });
    } catch {
      set({ loading: false });
    }
  },
}));

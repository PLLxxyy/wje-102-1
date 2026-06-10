export enum UserRole {
  User = 'user',
  Admin = 'admin',
}

export enum RecipeCategory {
  Meat = '荤菜',
  Vegetarian = '素菜',
  Soup = '汤品',
  Staple = '主食',
  Dessert = '甜品',
  Drink = '饮品',
}

export enum RecipeStatus {
  Draft = 'draft',
  Published = 'published',
  Archived = 'archived',
}

export enum DifficultyLevel {
  Easy = '简单',
  Medium = '中等',
  Hard = '困难',
}

export enum IngredientCategory {
  Vegetable = '蔬菜',
  Meat = '肉类',
  Seafood = '海鲜',
  Seasoning = '调料',
  Staple = '主食',
  Other = '其他',
}

export enum CollaborationRole {
  Viewer = 'viewer',
  Editor = 'editor',
}

export enum OperationAction {
  Create = 'CREATE',
  Update = 'UPDATE',
  Delete = 'DELETE',
  Login = 'LOGIN',
  Logout = 'LOGOUT',
}

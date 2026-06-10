import { AuthResponse, User } from '../types/user';
import { request, unwrap } from '../utils/request';

export interface RegisterPayload {
  username: string;
  email: string;
  password: string;
  avatar?: string | null;
  bio?: string | null;
}

export interface LoginPayload {
  account: string;
  password: string;
}

export interface UpdateProfilePayload {
  avatar?: string | null;
  bio?: string | null;
}

export const userApi = {
  register(payload: RegisterPayload): Promise<AuthResponse> {
    return unwrap(request.post('/auth/register', payload));
  },
  login(payload: LoginPayload): Promise<AuthResponse> {
    return unwrap(request.post('/auth/login', payload));
  },
  profile(): Promise<User> {
    return unwrap(request.get('/auth/profile'));
  },
  search(search?: string): Promise<User[]> {
    return unwrap(request.get('/users', { params: { search } }));
  },
  updateProfile(payload: UpdateProfilePayload): Promise<User> {
    return unwrap(request.put('/users/me/profile', payload));
  },
};

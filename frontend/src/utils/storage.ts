const tokenKey = 'wjerecipeworks_token';

export const storage = {
  getToken(): string | null {
    return window.localStorage.getItem(tokenKey);
  },
  setToken(token: string): void {
    window.localStorage.setItem(tokenKey, token);
  },
  clearToken(): void {
    window.localStorage.removeItem(tokenKey);
  },
};

export const getJwtSecret = (): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET must be provided through environment variables');
  }
  return secret;
};

export const jwtExpiresIn = '7d';

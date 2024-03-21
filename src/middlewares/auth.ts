import { AuthService } from '@src/services/auth';
import { NextFunction, Request, Response } from 'express';

export function authMiddleware(
  req: Partial<Request>,
  res: Partial<Response>,
  next: NextFunction
) {
  const token = req.headers?.['x-access-token'];

  try {
    const decoded = AuthService.decodeToken(token as string);
    req.decoded = decoded;
  } catch (err) {
    return res.status?.(401).send({ code: 401, error: (err as Error).message });
  }

  return next();
}

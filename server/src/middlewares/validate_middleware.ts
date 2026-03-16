import { Request, Response, NextFunction } from 'express';
import { ZodObject, ZodError, ZodSchema } from 'zod';

export const validateSchema = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ 
          error: "Datos de entrada inválidos", 
          details: error.issues 
        });
        return;
      }
      next(error);
    }
  };
};
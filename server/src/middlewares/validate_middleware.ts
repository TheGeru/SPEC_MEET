import { Request, Response, NextFunction } from 'express';
import { ZodObject, ZodError } from 'zod';

export const validateSchema = (schema: ZodObject<any>) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      // .parse() throws an error if validation fails
      // We re-assign req.body to strip out any extra malicious fields 
      // not defined in the Zod schema (if you use .strip() or default behavior)
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
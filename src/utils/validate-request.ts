import type { NextFunction, Request, Response } from 'express';
import { ZodError, ZodObject, ZodType } from 'zod';
import { HttpError } from './http-error';

type Schema = ZodType<unknown> | ZodObject<any>;

type ParamsRecord = Record<string, string>;

type QueryRecord = Record<string, unknown>;

export interface RequestValidationSchemas {
  body?: Schema;
  params?: Schema;
  query?: Schema;
}

const formattedError = (error: ZodError) =>
  error.issues.map((issue) => ({
    path: issue.path.join('.'),
    message: issue.message,
  }));

export const validateRequest = (schemas: RequestValidationSchemas) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      if (schemas.body) {
        const parsedBody = schemas.body.parse(req.body) as unknown;
        req.body = parsedBody;
      }

      if (schemas.params) {
        const parsedParams = schemas.params.parse(req.params) as ParamsRecord;
        req.params = parsedParams as Request['params'];
      }

      if (schemas.query) {
        const parsedQuery = schemas.query.parse(req.query) as QueryRecord;
        req.query = parsedQuery as Request['query'];
      }

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        next(
          new HttpError('Validation Error', 422, {
            issues: formattedError(error),
          }),
        );
        return;
      }
      next(error);
    }
  };
};

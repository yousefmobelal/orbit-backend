import type { ErrorRequestHandler, Response } from 'express';
import { HttpError } from './http-error';

interface MongooseCastError extends Error {
  path: string;
  value: any;
  kind: string;
}

interface MongooseDuplicateKeyError extends Error {
  code: number;
  keyValue: Record<string, any>;
}

interface MongooseValidationError extends Error {
  errors: Record<string, { message: string }>;
}

const handleCastErrorDB = (err: MongooseCastError): HttpError => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new HttpError(message, 400);
};

const handleDuplicatedFieldDB = (err: MongooseDuplicateKeyError): HttpError => {
  const value = Object.values(err.keyValue)[0];
  const message = `Duplicated field {${value}}. Please use another value!`;
  return new HttpError(message, 400);
};

const handleValidationErrorDB = (err: MongooseValidationError): HttpError => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid input data. ${errors.join('. ')}`;
  return new HttpError(message, 400);
};

const sendErrorDev = (err: HttpError, res: Response): void => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const sendErrorProd = (err: HttpError, res: Response): void => {
  // Operational trusted error: send message to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  }
  // Programming or other unkown error: don't leak error details
  else {
    //1) Log Error
    // eslint-disable-next-line no-console
    console.error('Error 🔥', err);

    //2) Send Error
    res.status(500).json({
      status: 'error',
      message: 'Something went wrong',
    });
  }
};

const handleJWTError = (): HttpError => new HttpError('Invalid token. Please log in again!', 401);

const handleJWTExpiredError = (): HttpError =>
  new HttpError('Your token has expired. Please log in again!', 401);

const globalErrorHandler: ErrorRequestHandler = (err, req, res, next): void => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'Error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    // eslint-disable-next-line node/no-unsupported-features/es-syntax
    let error = { ...err };

    // There was a problem when i use error.name === 'CastError' it comes out that
    // err in mongoose doesn't have the property name but it inherits it from it's
    // prototype, so when we do (let error = {...err}) we got only the properties at err
    // you can do this too (let error = {...err, err.name})
    if (err.name === 'CastError') error = handleCastErrorDB(error as MongooseCastError);
    if (err.code === 11000) error = handleDuplicatedFieldDB(error as MongooseDuplicateKeyError);
    if (err.name === 'ValidationError')
      error = handleValidationErrorDB(error as MongooseValidationError);
    if (err.name === 'JsonWebTokenError') error = handleJWTError();
    if (err.name === 'TokenExpiredError') error = handleJWTExpiredError();
    sendErrorProd(error as HttpError, res);
  }
};

export default globalErrorHandler;

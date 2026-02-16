export class HttpError extends Error {
  readonly isOperational: boolean = true;
  readonly status: string;

  constructor(
    message: string,
    readonly statusCode: number,
    readonly details?: Record<string, unknown>,
  ) {
    super(message);
    this.name = 'HttpError';
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
  }
}

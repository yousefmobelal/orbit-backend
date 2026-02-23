export enum ResponseStatus {
  SUCCESS = 'success',
  FAIL = 'fail',
}

export interface ApiResponse<T> {
  status: ResponseStatus;
  data: T;
}

export interface ApiListResponse<T> extends ApiResponse<T> {
  results?: number;
}

export interface ApiErrorResponse {
  status: ResponseStatus.FAIL;
  message: string;
  errors?: any;
}

// Helper functions for creating standardized responses
export const successResponse = <T>(data: T): ApiResponse<T> => ({
  status: ResponseStatus.SUCCESS,
  data,
});

export const successListResponse = <T>(data: T, results?: number): ApiListResponse<T> => ({
  status: ResponseStatus.SUCCESS,
  data,
  results,
});

export const failResponse = (message: string, errors?: any): ApiErrorResponse => ({
  status: ResponseStatus.FAIL,
  message,
  errors,
});

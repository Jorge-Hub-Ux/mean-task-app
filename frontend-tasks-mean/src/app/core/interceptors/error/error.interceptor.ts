import { HttpErrorResponse, HttpInterceptorFn, HttpStatusCode } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';

export type ErrorType = {
  errorTitle: string;
  message: string;
  statusCode?: number;
};

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      console.error(`[HTTP ERROR] ${error.status} - ${error.message}`);

      const formattedError: ErrorType = {
        errorTitle: getErrorTitle(error.status),
        message: getErrorMessage(error),
        statusCode: error.status,
      };

      return throwError(() => formattedError);
    })
  );
};

const getErrorTitle = (status: number): string => {
  switch (status) {
    case HttpStatusCode.BadRequest:
      return 'Bad Request';
    case HttpStatusCode.Unauthorized:
      return 'Unauthorized';
    case HttpStatusCode.NotFound:
      return 'Not Found';
    case HttpStatusCode.InternalServerError:
      return 'Server Error';
    default:
      return 'Unexpected Error';
  }
};

const getErrorMessage = (error: HttpErrorResponse): string => {
  return error.error?.message || 'Something went wrong. Please try again.';
};

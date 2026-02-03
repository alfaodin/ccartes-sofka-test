import { catchError, throwError } from 'rxjs';
import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';

export const httpErrorInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = $localize`:@@httpErrorUnexpected:Ocurrió un error inesperado`;

      if (error.error instanceof ErrorEvent) {
        // Client-side or network error
        errorMessage = $localize`:@@httpErrorNetwork:Error de red: ${error.error.message}:message:`;
        console.error('Client-side error:', error.error.message);
      } else {
        // Server-side error
        console.error(
          `Server returned code ${error.status}, ` +
          `body was: ${JSON.stringify(error.error)}`
        );

        // Map common HTTP status codes to user-friendly messages
        switch (error.status) {
          case 400:
            errorMessage = error.error?.message || $localize`:@@httpError400:Solicitud inválida. Por favor verifique su entrada.`;
            break;
          case 404:
            errorMessage = $localize`:@@httpError404:Producto no encontrado.`;
            break;
          case 409:
            errorMessage = $localize`:@@httpError409:Ya existe un producto con este ID.`;
            break;
          case 500:
            errorMessage = $localize`:@@httpError500:Error del servidor. Por favor intente más tarde.`;
            break;
          case 503:
            errorMessage = $localize`:@@httpError503:Servicio temporalmente no disponible. Por favor intente más tarde.`;
            break;
          case 0:
            errorMessage = $localize`:@@httpError0:No se puede conectar al servidor. Por favor verifique su conexión a internet.`;
            break;
          default:
            if (error.error?.message) {
              errorMessage = error.error.message;
            } else {
              const statusText = error.statusText || $localize`:@@httpErrorUnknown:Error desconocido`;
              errorMessage = $localize`:@@httpErrorDefault:Error ${error.status}:status:: ${statusText}:statusText:`;
            }
        }
      }

      // Log to console for debugging
      console.error('HTTP Error:', errorMessage);

      // Return error with user-friendly message
      return throwError(() => new Error(errorMessage));
    })
  );
};

import { Observable, of, timer } from 'rxjs';
import { map, catchError, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { AbstractControl, AsyncValidatorFn, ValidationErrors } from '@angular/forms';

import { ProductService } from '../services/product.service';

export function productIdValidator(productService: ProductService, currentId?: string): AsyncValidatorFn {
  return (control: AbstractControl): Observable<ValidationErrors | null> => {
    if (!control.value) {
      return of(null);
    }
    if (currentId && control.value === currentId) {
      return of(null);
    }

    return timer(400).pipe(
      distinctUntilChanged(),
      switchMap(() => productService.verifyId(control.value)),
      map((exists: boolean) => exists ? { idExists: true } : null),
      catchError(() => of(null))
    );
  };
}

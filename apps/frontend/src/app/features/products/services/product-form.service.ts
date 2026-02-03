import { Router } from '@angular/router';
import { Observable, Subject } from 'rxjs';
import { FormGroup } from '@angular/forms';
import { takeUntil } from 'rxjs/operators';
import { Injectable, inject } from '@angular/core';

import { Product } from '../../../core/models/product.model';
import { StateService } from '../../../core/services/state.service';
import { ProductService } from '../../../core/services/product.service';
import { parseDate, formatDateForInput, addYears } from '../../../core/utils/date.utils';


@Injectable({
  providedIn: 'any'
})
export class ProductFormService {
  private readonly router = inject(Router);
  private readonly stateService = inject(StateService);
  private readonly productService = inject(ProductService);


  setupDateAutoCalculation(productForm: FormGroup, destroy$: Subject<void>): void {
    productForm.get('date_release')?.valueChanges
      .pipe(takeUntil(destroy$))
      .subscribe(releaseDate => {
        if (releaseDate) {
          const date = parseDate(releaseDate);
          if (date) {
            const dateWithYear = addYears(date, 1);
            const revisionDate = formatDateForInput(dateWithYear);
            productForm.patchValue({
              date_revision: revisionDate
            }, { emitEvent: false });
          }
        }
      });
  }

  loadProductForEdit(
    productForm: FormGroup,
    currentProductId: string,
    destroy$: Subject<void>
  ): Observable<string> {
    return new Observable(observer => {
      const selectedProduct = this.stateService.getSelectedProduct();

      if (selectedProduct) {
        this.populateForm(productForm, selectedProduct);
        observer.next('');
        observer.complete();
      } else if (currentProductId) {
        this.productService.getById(currentProductId)
          .pipe(takeUntil(destroy$))
          .subscribe({
            next: (product) => {
              this.populateForm(productForm, product);
              observer.next('');
              observer.complete();
            },
            error: () => {
              observer.next('Error al cargar producto');
              observer.complete();
              setTimeout(() => this.router.navigate(['/products']), 2000);
            }
          });
      }
    });
  }

  submit(
    productForm: FormGroup,
    isEditMode: boolean,
    currentProductId: string | undefined,
    destroy$: Subject<void>
  ): Observable<{ success: boolean; error?: string }> {
    return new Observable(observer => {
      if (productForm.invalid) {
        productForm.markAllAsTouched();
        observer.next({ success: false, error: 'Formulario inválido' });
        observer.complete();
        return;
      }

      const formValue = productForm.getRawValue();

      const productDTO: Product = {
        id: formValue.id || '',
        name: formValue.name || '',
        description: formValue.description || '',
        logo: formValue.logo || '',
        date_release: formValue.date_release || '',
        date_revision: formValue.date_revision || ''
      };

      const request$ = isEditMode && currentProductId
        ? this.productService.update(currentProductId, productDTO)
        : this.productService.create(productDTO);

      request$.pipe(takeUntil(destroy$)).subscribe({
        next: () => {
          observer.next({ success: true });
          observer.complete();
          this.router.navigate(['/products']);
        },
        error: (error) => {
          observer.next({
            success: false,
            error: error.message || 'Error al guardar producto'
          });
          observer.complete();
        }
      });
    });
  }


  getErrorMessage(productForm: FormGroup, fieldName: string): string {
    const field = productForm.get(fieldName);
    if (!field || !field.errors) return '';

    const errors = field.errors;

    if (errors['required']) return 'Este campo es obligatorio';
    if (errors['minlength']) return `La longitud mínima es ${errors['minlength'].requiredLength}`;
    if (errors['maxlength']) return `La longitud máxima es ${errors['maxlength'].requiredLength}`;
    if (errors['pattern']) return 'Por favor ingrese una URL válida (http:// o https://)';
    if (errors['minDate']) return `La fecha debe ser hoy o posterior`;
    if (errors['idExists']) return 'Este ID ya existe';

    return 'Valor inválido';
  }

  private populateForm(productForm: FormGroup, product: Product): void {
    productForm.patchValue({
      id: product.id,
      name: product.name,
      description: product.description,
      logo: product.logo,
      date_release: formatDateForInput(product.date_release),
      date_revision: formatDateForInput(product.date_revision)
    });
    productForm.get('id')?.disable();
  }
}

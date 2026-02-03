import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';

import { ProductService } from '../../../../core/services/product.service';
import { StateService } from '../../../../core/services/state.service';
import { productIdValidator } from '../../../../core/validators/product-id.validator';
import { ProductFormService } from '../../services/product-form.service';

/**
 * Product Form Component
 * Handles both create and edit modes for products
 */
@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './product-form.component.html',
  styleUrls: ['./product-form.component.scss']
})
export class ProductFormComponent implements OnInit, OnDestroy {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly stateService = inject(StateService);
  private readonly productService = inject(ProductService);
  private readonly productFormService = inject(ProductFormService);

  private readonly destroy$ = new Subject<void>();

  isEditMode = false;
  isSubmitting = false;
  errorMessage = '';
  currentProductId?: string;

  // Reactive Form
  productForm = new FormGroup({
    id: new FormControl('', {
      validators: [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(10)
      ],
      updateOn: 'change'
    }),
    name: new FormControl('', [
      Validators.required,
      Validators.minLength(5),
      Validators.maxLength(100)
    ]),
    description: new FormControl('', [
      Validators.required,
      Validators.minLength(10),
      Validators.maxLength(200)
    ]),
    logo: new FormControl('', [
      Validators.required,
      Validators.pattern(/^https?:\/\/.+/)
    ]),
    date_release: new FormControl('', [
      Validators.required
    ]),
    date_revision: new FormControl({ value: '', disabled: true }, [
      Validators.required
    ])
  });

  ngOnInit(): void {
    const productId = this.route.snapshot.paramMap.get('id');

    if (productId) {
      this.isEditMode = true;
      this.currentProductId = productId;
      this.loadProductForEdit();
    } else {
      const idControl = this.productForm.get('id');
      idControl?.setAsyncValidators(productIdValidator(this.productService));
      idControl?.updateValueAndValidity();
    }
    this.productFormService.setupDateAutoCalculation(this.productForm, this.destroy$);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.stateService.clearSelectedProduct();
  }

  private loadProductForEdit(): void {
    if (this.currentProductId) {
      this.productFormService.loadProductForEdit(
        this.productForm,
        this.currentProductId,
        this.destroy$
      ).subscribe(errorMsg => {
        if (errorMsg) {
          this.errorMessage = errorMsg;
        }
      });
    }
  }

  onSubmit(): void {
    if (this.isSubmitting) {
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    this.productFormService.submit(
      this.productForm,
      this.isEditMode,
      this.currentProductId,
      this.destroy$
    ).subscribe(result => {
      if (!result.success) {
        this.errorMessage = result.error || 'Error al guardar producto';
        this.isSubmitting = false;
      }
    });
  }

  onReset(): void {
    if (this.isEditMode && this.currentProductId) {
      this.loadProductForEdit();
    } else {
      this.productForm.reset();
      this.errorMessage = '';
    }
  }

  onCancel(): void {
    this.router.navigate(['/products']);
  }

  hasError(fieldName: string, errorType?: string): boolean {
    const field = this.productForm.get(fieldName);
    if (!field) return false;

    if (errorType) {
      return !!(field.hasError(errorType) && (field.dirty || field.touched));
    }

    return !!(field.invalid && (field.dirty || field.touched));
  }

  getErrorMessage(fieldName: string): string {
    return this.productFormService.getErrorMessage(this.productForm, fieldName);
  }
}

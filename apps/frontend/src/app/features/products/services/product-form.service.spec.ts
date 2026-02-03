import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { of, throwError, Subject } from 'rxjs';

import { ProductFormService } from './product-form.service';
import { ProductService } from '../../../core/services/product.service';
import { StateService } from '../../../core/services/state.service';
import { Product } from '../../../core/models/product.model';

describe('ProductFormService', () => {
  let service: ProductFormService;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockStateService: jasmine.SpyObj<StateService>;
  let mockProductService: jasmine.SpyObj<ProductService>;
  
  let productForm: FormGroup;
  let destroy$: Subject<void>;

  const mockProduct: Product = {
    id: 'test-id',
    name: 'Test Product',
    description: 'Test Description for product',
    logo: 'https://example.com/logo.png',
    date_release: '2024-01-15',
    date_revision: '2025-01-15'
  };

  beforeEach(() => {
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    mockProductService = jasmine.createSpyObj('ProductService', ['create', 'update', 'getById']);
    mockStateService = jasmine.createSpyObj('StateService', ['getSelectedProduct']);

    TestBed.configureTestingModule({
      providers: [
        ProductFormService,
        { provide: Router, useValue: mockRouter },
        { provide: ProductService, useValue: mockProductService },
        { provide: StateService, useValue: mockStateService }
      ]
    });

    service = TestBed.inject(ProductFormService);
    destroy$ = new Subject<void>();

    productForm = new FormGroup({
      id: new FormControl('', [Validators.required]),
      name: new FormControl('', [Validators.required, Validators.minLength(5)]),
      description: new FormControl('', [Validators.required, Validators.minLength(10)]),
      logo: new FormControl('', [Validators.required]),
      date_release: new FormControl('', [Validators.required]),
      date_revision: new FormControl({ value: '', disabled: true }, [Validators.required])
    });
  });

  afterEach(() => {
    destroy$.next();
    destroy$.complete();
  });

  describe('setupDateAutoCalculation', () => {
    it('should calculate revision date as 1 year after release date', (done) => {
      service.setupDateAutoCalculation(productForm, destroy$);

      productForm.patchValue({ date_release: '2024-01-15' });

      setTimeout(() => {
        expect(productForm.get('date_revision')?.value).toBe('2025-01-15');
        done();
      }, 100);
    });

    it('should handle date changes correctly', (done) => {
      service.setupDateAutoCalculation(productForm, destroy$);

      productForm.patchValue({ date_release: '2024-06-20' });

      setTimeout(() => {
        expect(productForm.get('date_revision')?.value).toBe('2025-06-20');
        done();
      }, 100);
    });

    it('should not calculate revision date when release date is empty', (done) => {
      service.setupDateAutoCalculation(productForm, destroy$);

      productForm.patchValue({ date_release: '' });

      setTimeout(() => {
        expect(productForm.get('date_revision')?.value).toBe('');
        done();
      }, 100);
    });

    it('should unsubscribe when destroy$ emits', () => {
      service.setupDateAutoCalculation(productForm, destroy$);

      destroy$.next();
      destroy$.complete();

      productForm.patchValue({ date_release: '2024-01-15' });

      // Should not update after destroy
      expect(productForm.get('date_revision')?.value).toBe('');
    });
  });

  describe('loadProductForEdit', () => {
    it('should populate form with product from state service', (done) => {
      mockStateService.getSelectedProduct.and.returnValue(mockProduct);

      service.loadProductForEdit(productForm, 'test-id', destroy$).subscribe(errorMsg => {
        expect(errorMsg).toBe('');
        expect(productForm.get('id')?.value).toBe(mockProduct.id);
        expect(productForm.get('name')?.value).toBe(mockProduct.name);
        expect(productForm.get('id')?.disabled).toBeTrue();
        done();
      });
    });

    it('should fetch product from API when not in state', (done) => {
      mockStateService.getSelectedProduct.and.returnValue(null);
      mockProductService.getById.and.returnValue(of(mockProduct));

      service.loadProductForEdit(productForm, 'test-id', destroy$).subscribe(errorMsg => {
        expect(errorMsg).toBe('');
        expect(mockProductService.getById).toHaveBeenCalledWith('test-id');
        expect(productForm.get('id')?.value).toBe(mockProduct.id);
        expect(productForm.get('name')?.value).toBe(mockProduct.name);
        done();
      });
    });

    it('should handle API error and navigate to products', (done) => {
      mockStateService.getSelectedProduct.and.returnValue(null);
      mockProductService.getById.and.returnValue(throwError(() => new Error('Not found')));

      service.loadProductForEdit(productForm, 'test-id', destroy$).subscribe(errorMsg => {
        expect(errorMsg).toBe('Error al cargar producto');
        expect(mockProductService.getById).toHaveBeenCalledWith('test-id');
        done();
      });

      // Verify navigation happens after delay
      setTimeout(() => {
        expect(mockRouter.navigate).toHaveBeenCalledWith(['/products']);
      }, 2100);
    });

    it('should format dates correctly for input fields', (done) => {
      const productWithDateObjects: Product = {
        ...mockProduct,
        date_release: new Date(2024, 0, 15) as any,
        date_revision: new Date(2025, 0, 15) as any
      };

      mockStateService.getSelectedProduct.and.returnValue(productWithDateObjects);

      service.loadProductForEdit(productForm, 'test-id', destroy$).subscribe(() => {
        expect(productForm.get('date_release')?.value).toBe('2024-01-15');
        expect(productForm.get('date_revision')?.value).toBe('2025-01-15');
        done();
      });
    });
  });

  describe('submit', () => {
    beforeEach(() => {
      productForm.patchValue({
        id: mockProduct.id,
        name: mockProduct.name,
        description: mockProduct.description,
        logo: mockProduct.logo,
        date_release: mockProduct.date_release,
        date_revision: mockProduct.date_revision
      });
    });

    it('should create product when not in edit mode', (done) => {
      mockProductService.create.and.returnValue(of(mockProduct));

      service.submit(productForm, false, undefined, destroy$).subscribe(result => {
        expect(result.success).toBeTrue();
        expect(mockProductService.create).toHaveBeenCalled();
        expect(mockProductService.update).not.toHaveBeenCalled();

        setTimeout(() => {
          expect(mockRouter.navigate).toHaveBeenCalledWith(['/products']);
          done();
        }, 10);
      });
    });

    it('should update product when in edit mode', (done) => {
      mockProductService.update.and.returnValue(of(mockProduct));

      service.submit(productForm, true, 'test-id', destroy$).subscribe(result => {
        expect(result.success).toBeTrue();
        expect(mockProductService.update).toHaveBeenCalledWith('test-id', jasmine.any(Object));
        expect(mockProductService.create).not.toHaveBeenCalled();

        setTimeout(() => {
          expect(mockRouter.navigate).toHaveBeenCalledWith(['/products']);
          done();
        }, 10);
      });
    });

    it('should return error when form is invalid', (done) => {
      productForm.patchValue({ name: '' }); // Make form invalid

      service.submit(productForm, false, undefined, destroy$).subscribe(result => {
        expect(result.success).toBeFalse();
        expect(result.error).toBe('Formulario inválido');
        expect(mockProductService.create).not.toHaveBeenCalled();
        done();
      });
    });

    it('should handle create error', (done) => {
      const error = { message: 'Create failed' };
      mockProductService.create.and.returnValue(throwError(() => error));

      service.submit(productForm, false, undefined, destroy$).subscribe(result => {
        expect(result.success).toBeFalse();
        expect(result.error).toBe('Create failed');
        done();
      });
    });

    it('should handle update error', (done) => {
      const error = { message: 'Update failed' };
      mockProductService.update.and.returnValue(throwError(() => error));

      service.submit(productForm, true, 'test-id', destroy$).subscribe(result => {
        expect(result.success).toBeFalse();
        expect(result.error).toBe('Update failed');
        done();
      });
    });

    it('should use default error message when error has no message', (done) => {
      mockProductService.create.and.returnValue(throwError(() => ({})));

      service.submit(productForm, false, undefined, destroy$).subscribe(result => {
        expect(result.success).toBeFalse();
        expect(result.error).toBe('Error al guardar producto');
        done();
      });
    });

    it('should include disabled form values in submission', (done) => {
      productForm.get('id')?.disable();
      mockProductService.create.and.returnValue(of(mockProduct));

      service.submit(productForm, false, undefined, destroy$).subscribe(() => {
        const createCall = mockProductService.create.calls.mostRecent();
        const submittedProduct = createCall.args[0];
        expect(submittedProduct.id).toBe(mockProduct.id);
        done();
      });
    });
  });

  describe('getErrorMessage', () => {
    it('should return required error message', () => {
      const control = new FormControl('', [Validators.required]);
      control.markAsTouched();
      productForm.addControl('testField', control);

      const message = service.getErrorMessage(productForm, 'testField');
      expect(message).toBe('Este campo es obligatorio');
    });

    it('should return minlength error message', () => {
      const control = new FormControl('abc', [Validators.minLength(5)]);
      control.markAsTouched();
      productForm.addControl('testField', control);

      const message = service.getErrorMessage(productForm, 'testField');
      expect(message).toBe('La longitud mínima es 5');
    });

    it('should return maxlength error message', () => {
      const control = new FormControl('a'.repeat(101), [Validators.maxLength(100)]);
      control.markAsTouched();
      productForm.addControl('testField', control);

      const message = service.getErrorMessage(productForm, 'testField');
      expect(message).toBe('La longitud máxima es 100');
    });

    it('should return pattern error message', () => {
      const control = new FormControl('invalid-url', [Validators.pattern(/^https?:\/\/.+/)]);
      control.markAsTouched();
      productForm.addControl('testField', control);

      const message = service.getErrorMessage(productForm, 'testField');
      expect(message).toBe('Por favor ingrese una URL válida (http:// o https://)');
    });

    it('should return minDate error message', () => {
      const control = new FormControl('2020-01-01');
      control.setErrors({ minDate: true });
      control.markAsTouched();
      productForm.addControl('testField', control);

      const message = service.getErrorMessage(productForm, 'testField');
      expect(message).toBe('La fecha debe ser hoy o posterior');
    });

    it('should return idExists error message', () => {
      const control = new FormControl('existing-id');
      control.setErrors({ idExists: true });
      control.markAsTouched();
      productForm.addControl('testField', control);

      const message = service.getErrorMessage(productForm, 'testField');
      expect(message).toBe('Este ID ya existe');
    });

    it('should return generic error message for unknown error', () => {
      const control = new FormControl('test');
      control.setErrors({ customError: true });
      control.markAsTouched();
      productForm.addControl('testField', control);

      const message = service.getErrorMessage(productForm, 'testField');
      expect(message).toBe('Valor inválido');
    });

    it('should return empty string when field has no errors', () => {
      const control = new FormControl('valid');
      productForm.addControl('testField', control);

      const message = service.getErrorMessage(productForm, 'testField');
      expect(message).toBe('');
    });

    it('should return empty string when field does not exist', () => {
      const message = service.getErrorMessage(productForm, 'nonExistentField');
      expect(message).toBe('');
    });
  });

  describe('edge cases', () => {
    it('should handle leap year dates correctly', (done) => {
      service.setupDateAutoCalculation(productForm, destroy$);

      productForm.patchValue({ date_release: '2024-02-29' });

      setTimeout(() => {
        // 2025 is not a leap year, so it should be Feb 28
        expect(productForm.get('date_revision')?.value).toBe('2025-03-01');
        done();
      }, 100);
    });

    it('should handle year boundary correctly', (done) => {
      service.setupDateAutoCalculation(productForm, destroy$);

      productForm.patchValue({ date_release: '2024-12-31' });

      setTimeout(() => {
        expect(productForm.get('date_revision')?.value).toBe('2025-12-31');
        done();
      }, 100);
    });

    it('should handle form submission with empty strings', (done) => {
      productForm.patchValue({
        id: '',
        name: '',
        description: '',
        logo: '',
        date_release: '',
        date_revision: ''
      });

      mockProductService.create.and.returnValue(of(mockProduct));

      service.submit(productForm, false, undefined, destroy$).subscribe(result => {
        expect(result.success).toBeFalse();
        expect(result.error).toBe('Formulario inválido');
        done();
      });
    });
  });
});

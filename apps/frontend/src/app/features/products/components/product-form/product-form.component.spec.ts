import { of, throwError } from 'rxjs';
import { ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';

import { ProductFormComponent } from './product-form.component';
import { Product } from '../../../../core/models/product.model';
import { StateService } from '../../../../core/services/state.service';
import { ProductFormService } from '../../services/product-form.service';
import { ProductService } from '../../../../core/services/product.service';

describe('ProductFormComponent', () => {
  let component: ProductFormComponent;
  let fixture: ComponentFixture<ProductFormComponent>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockActivatedRoute: any;
  let mockProductService: jasmine.SpyObj<ProductService>;
  let mockStateService: jasmine.SpyObj<StateService>;
  let mockProductFormService: jasmine.SpyObj<ProductFormService>;

  const mockProduct: Product = {
    id: 'test-123',
    name: 'Test Product Name',
    description: 'Test product description here',
    logo: 'https://example.com/logo.png',
    date_release: '2024-01-15',
    date_revision: '2025-01-15'
  };

  beforeEach(async () => {
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    mockProductService = jasmine.createSpyObj('ProductService', ['create', 'update', 'getById', 'verifyId']);
    mockStateService = jasmine.createSpyObj('StateService', ['getSelectedProduct', 'clearSelectedProduct']);
    mockProductFormService = jasmine.createSpyObj('ProductFormService', [
      'setupDateAutoCalculation',
      'loadProductForEdit',
      'submit',
      'getErrorMessage'
    ]);

    // Set default return values for spy methods
    mockProductService.getById.and.returnValue(of(mockProduct));
    mockProductService.create.and.returnValue(of(mockProduct));
    mockProductService.update.and.returnValue(of(mockProduct));
    mockProductService.verifyId.and.returnValue(of(false));
    mockStateService.getSelectedProduct.and.returnValue(null);

    mockProductFormService.loadProductForEdit.and.returnValue(of(''));
    mockProductFormService.submit.and.returnValue(of({ success: true }));
    mockProductFormService.getErrorMessage.and.returnValue('');

    mockActivatedRoute = {
      snapshot: {
        paramMap: {
          get: jasmine.createSpy('get').and.returnValue(null)
        }
      }
    };

    await TestBed.configureTestingModule({
      imports: [ProductFormComponent, ReactiveFormsModule],
      providers: [
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: ProductService, useValue: mockProductService },
        { provide: StateService, useValue: mockStateService }
      ]
    })
    .overrideComponent(ProductFormComponent, {
      set: {
        providers: [
          { provide: ProductFormService, useValue: mockProductFormService }
        ]
      }
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProductFormComponent);
    component = fixture.componentInstance;
  });

  describe('Component Initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize in create mode when no id parameter', () => {
      fixture.detectChanges();

      expect(component.isEditMode).toBeFalse();
      expect(component.currentProductId).toBeUndefined();
      expect(mockProductFormService.setupDateAutoCalculation).toHaveBeenCalled();
    });

    it('should initialize in edit mode when id parameter exists', () => {
      mockActivatedRoute.snapshot.paramMap.get.and.returnValue('test-123');

      fixture.detectChanges();

      expect(component.isEditMode).toBeTrue();
      expect(component.currentProductId).toBe('test-123');
      expect(mockProductFormService.loadProductForEdit).toHaveBeenCalled();
    });

    it('should set async validator on id field in create mode', () => {
      mockProductService.verifyId.and.returnValue(of(false));

      fixture.detectChanges();

      const idControl = component.productForm.get('id');
      expect(idControl?.asyncValidator).toBeDefined();
    });

    it('should not set async validator on id field in edit mode', () => {
      mockActivatedRoute.snapshot.paramMap.get.and.returnValue('test-123');

      fixture.detectChanges();

      const idControl = component.productForm.get('id');
      expect(idControl?.asyncValidator).toBeNull();
    });
  });

  describe('Form Validation', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should have all required form controls', () => {
      expect(component.productForm.get('id')).toBeTruthy();
      expect(component.productForm.get('name')).toBeTruthy();
      expect(component.productForm.get('description')).toBeTruthy();
      expect(component.productForm.get('logo')).toBeTruthy();
      expect(component.productForm.get('date_release')).toBeTruthy();
      expect(component.productForm.get('date_revision')).toBeTruthy();
    });

    it('should mark form as invalid when empty', () => {
      expect(component.productForm.valid).toBeFalse();
    });

    it('should validate id field requirements', fakeAsync(() => {
      const idControl = component.productForm.get('id');

      idControl?.setValue('');
      expect(idControl?.hasError('required')).toBeTrue();

      idControl?.setValue('ab');
      expect(idControl?.hasError('minlength')).toBeTrue();

      idControl?.setValue('a'.repeat(11));
      expect(idControl?.hasError('maxlength')).toBeTrue();

      idControl?.setValue('valid-id');
      tick(500);
      expect(idControl?.valid).toBeTrue();
    }));

    it('should validate name field requirements', () => {
      const nameControl = component.productForm.get('name');

      nameControl?.setValue('');
      expect(nameControl?.hasError('required')).toBeTrue();

      nameControl?.setValue('abcd');
      expect(nameControl?.hasError('minlength')).toBeTrue();

      nameControl?.setValue('Valid Product Name');
      expect(nameControl?.valid).toBeTrue();
    });

    it('should validate logo field as URL', () => {
      const logoControl = component.productForm.get('logo');

      logoControl?.setValue('not-a-url');
      expect(logoControl?.hasError('pattern')).toBeTrue();

      logoControl?.setValue('https://example.com/logo.png');
      expect(logoControl?.valid).toBeTrue();
    });

    it('should have date_revision field disabled by default', () => {
      const dateRevisionControl = component.productForm.get('date_revision');
      expect(dateRevisionControl?.disabled).toBeTrue();
    });
  });

  describe('loadProductForEdit', () => {
    it('should load product data when currentProductId exists', () => {
      mockActivatedRoute.snapshot.paramMap.get.and.returnValue('test-123');

      fixture.detectChanges();

      expect(mockProductFormService.loadProductForEdit).toHaveBeenCalledWith(
        component.productForm,
        'test-123',
        jasmine.any(Object)
      );
    });

    it('should set error message when load fails', (done) => {
      mockActivatedRoute.snapshot.paramMap.get.and.returnValue('test-123');
      (mockProductFormService.loadProductForEdit as jasmine.Spy).and.returnValue(of('Error loading product'));

      fixture.detectChanges();

      setTimeout(() => {
        expect(component.errorMessage).toBe('Error loading product');
        done();
      }, 100);
    });
  });

  describe('onSubmit', () => {
    beforeEach(() => {
      fixture.detectChanges();
      component.productForm.patchValue({
        id: mockProduct.id,
        name: mockProduct.name,
        description: mockProduct.description,
        logo: mockProduct.logo,
        date_release: mockProduct.date_release as string,
        date_revision: mockProduct.date_revision as string
      });
    });

    it('should prevent submission when already submitting', () => {
      component.isSubmitting = true;

      component.onSubmit();

      expect(mockProductFormService.submit).not.toHaveBeenCalled();
    });

    it('should call service submit with correct parameters in create mode', () => {
      component.onSubmit();

      expect(mockProductFormService.submit).toHaveBeenCalledWith(
        component.productForm,
        false,
        undefined,
        jasmine.any(Object)
      );
    });

    it('should call service submit with correct parameters in edit mode', () => {
      component.isEditMode = true;
      component.currentProductId = 'test-123';

      component.onSubmit();

      expect(mockProductFormService.submit).toHaveBeenCalledWith(
        component.productForm,
        true,
        'test-123',
        jasmine.any(Object)
      );
    });

    it('should set isSubmitting to true when submitting', () => {
      component.onSubmit();

      expect(component.isSubmitting).toBeTrue();
    });

    it('should clear error message when submitting', () => {
      component.errorMessage = 'Previous error';

      component.onSubmit();

      expect(component.errorMessage).toBe('');
    });

    it('should handle submission error', (done) => {
      (mockProductFormService.submit as jasmine.Spy).and.returnValue(
        of({ success: false, error: 'Submission failed' })
      );

      component.onSubmit();

      setTimeout(() => {
        expect(component.errorMessage).toBe('Submission failed');
        expect(component.isSubmitting).toBeFalse();
        done();
      }, 100);
    });

    it('should use default error message when error is undefined', (done) => {
      (mockProductFormService.submit as jasmine.Spy).and.returnValue(
        of({ success: false, error: undefined })
      );

      component.onSubmit();

      setTimeout(() => {
        expect(component.errorMessage).toBe('Error al guardar producto');
        done();
      }, 100);
    });
  });

  describe('onReset', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should reset form in create mode', () => {
      component.productForm.patchValue({
        id: 'test',
        name: 'test name',
        description: 'test description',
        logo: 'https://test.com/logo.png',
        date_release: '2024-01-01',
        date_revision: '2025-01-01'
      });

      component.onReset();

      expect(component.productForm.get('id')?.value).toBeNull();
      expect(component.productForm.get('name')?.value).toBeNull();
    });

    it('should reload product data in edit mode', () => {
      component.isEditMode = true;
      component.currentProductId = 'test-123';

      component.onReset();

      expect(mockProductFormService.loadProductForEdit).toHaveBeenCalled();
    });

    it('should clear error message on reset', () => {
      component.errorMessage = 'Some error';

      component.onReset();

      expect(component.errorMessage).toBe('');
    });
  });

  describe('onCancel', () => {
    it('should navigate to products list', () => {
      fixture.detectChanges();

      component.onCancel();

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/products']);
    });
  });

  describe('hasError', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should return false when field does not exist', () => {
      expect(component.hasError('nonexistent')).toBeFalse();
    });

    it('should return false for untouched invalid field', () => {
      const nameControl = component.productForm.get('name');
      nameControl?.setValue('');
      nameControl?.markAsUntouched();

      expect(component.hasError('name')).toBeFalse();
    });

    it('should return true for touched invalid field', () => {
      const nameControl = component.productForm.get('name');
      nameControl?.setValue('');
      nameControl?.markAsTouched();

      expect(component.hasError('name')).toBeTrue();
    });

    it('should return true for dirty invalid field', () => {
      const nameControl = component.productForm.get('name');
      nameControl?.setValue('');
      nameControl?.markAsDirty();

      expect(component.hasError('name')).toBeTrue();
    });

    it('should check for specific error type', () => {
      const nameControl = component.productForm.get('name');
      nameControl?.setValue('abc');
      nameControl?.markAsTouched();

      expect(component.hasError('name', 'minlength')).toBeTrue();
      expect(component.hasError('name', 'required')).toBeFalse();
    });
  });

  describe('getErrorMessage', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should delegate to ProductFormService', () => {
      (mockProductFormService.getErrorMessage as jasmine.Spy).and.returnValue('Test error message');

      const result = component.getErrorMessage('name');

      expect(mockProductFormService.getErrorMessage).toHaveBeenCalledWith(
        component.productForm,
        'name'
      );
      expect(result).toBe('Test error message');
    });
  });

  describe('Component Cleanup', () => {
    it('should clear selected product on destroy', () => {
      fixture.detectChanges();

      fixture.destroy();

      expect(mockStateService.clearSelectedProduct).toHaveBeenCalled();
    });

    it('should complete destroy$ subject on destroy', () => {
      fixture.detectChanges();
      spyOn(component['destroy$'], 'next');
      spyOn(component['destroy$'], 'complete');

      fixture.destroy();

      expect(component['destroy$'].next).toHaveBeenCalled();
      expect(component['destroy$'].complete).toHaveBeenCalled();
    });
  });

  describe('Form Update Modes', () => {
    it('should have updateOn: change for id field', () => {
      fixture.detectChanges();

      const idControl = component.productForm.get('id');
      expect(idControl?.updateOn).toBe('change');
    });
  });

  describe('Integration Tests', () => {
    it('should setup date auto-calculation on init', () => {
      fixture.detectChanges();

      expect(mockProductFormService.setupDateAutoCalculation).toHaveBeenCalledWith(
        component.productForm,
        jasmine.any(Object)
      );
    });

    it('should handle complete create workflow', () => {
      fixture.detectChanges();

      // Fill form
      component.productForm.patchValue({
        id: 'new-prod',
        name: 'New Product',
        description: 'New product description here',
        logo: 'https://example.com/new.png',
        date_release: '2024-01-01',
        date_revision: '2025-01-01'
      });

      // Submit
      component.onSubmit();

      expect(component.isSubmitting).toBeTrue();
      expect(mockProductFormService.submit).toHaveBeenCalled();
    });

    it('should handle complete edit workflow', () => {
      mockActivatedRoute.snapshot.paramMap.get.and.returnValue('edit-123');

      fixture.detectChanges();

      expect(component.isEditMode).toBeTrue();
      expect(mockProductFormService.loadProductForEdit).toHaveBeenCalled();

      // Update and submit
      component.productForm.patchValue({ name: 'Updated Name' });
      component.onSubmit();

      expect(mockProductFormService.submit).toHaveBeenCalledWith(
        component.productForm,
        true,
        'edit-123',
        jasmine.any(Object)
      );
    });
  });
});

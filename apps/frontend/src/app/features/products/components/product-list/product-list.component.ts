import { Router } from '@angular/router';
import { map, takeUntil } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { BehaviorSubject, Subject } from 'rxjs';
import { Component, OnInit, OnDestroy, inject } from '@angular/core';

import { Product } from '../../../../core/models/product.model';
import { StateService } from '../../../../core/services/state.service';
import { ProductService } from '../../../../core/services/product.service';
import { PaginationService } from '../../services/pagination.service';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination.component';
import { DropdownMenuComponent } from '../../../../shared/components/dropdown-menu/dropdown-menu.component';
import { ConfirmationModalComponent } from '../../../../shared/components/confirmation-modal/confirmation-modal.component';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [
    CommonModule,
    ConfirmationModalComponent,
    DropdownMenuComponent,
    PaginationComponent
  ],
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.scss']
})
export class ProductListComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();

  private readonly router = inject(Router);
  private readonly stateService = inject(StateService);
  private readonly productService = inject(ProductService);
  private readonly paginationService = inject(PaginationService);

  // State management with BehaviorSubject
  private readonly errorSubject = new BehaviorSubject<string>('');
  private readonly loadingSubject = new BehaviorSubject<boolean>(false);
  private readonly productsSubject = new BehaviorSubject<Product[]>([]);

  // Observables for template
  readonly loading$ = this.loadingSubject.asObservable();
  readonly error$ = this.errorSubject.asObservable();

  // Paginated products stream managed by PaginationService
  readonly filteredAndPaginatedProducts$ = this.paginationService.createPaginatedStream(
    this.productsSubject.asObservable()
  );

  isDeleteModalVisible = false;
  productToDelete: Product | null = null;

  ngOnInit(): void {
    this.loadProducts();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadProducts(): void {
    this.loadingSubject.next(true);
    this.errorSubject.next('');

    this.productService.getAll()
      .pipe(
        map(response => response.data),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (products) => {
          this.productsSubject.next(products);
          this.loadingSubject.next(false);
        },
        error: (error) => {
          this.errorSubject.next(error.message || 'Error al cargar productos');
          this.loadingSubject.next(false);
        }
      });
  }

  onSearch(event: Event): void {
    const searchTerm = (event.target as HTMLInputElement).value;
    this.paginationService.setSearchTerm(searchTerm);
  }

  onPageChange(page: number): void {
    this.paginationService.setPage(page);
  }

  onPageSizeChange(pageSize: number): void {
    this.paginationService.setPageSize(pageSize);
  }

  onCreateProduct(): void {
    this.stateService.clearSelectedProduct();
    this.router.navigate(['/products/new']);
  }

  onEditProduct(product: Product): void {
    this.stateService.setSelectedProduct(product);
    this.router.navigate(['/products', product.id, 'edit']);
  }

  onDeleteProduct(product: Product): void {
    this.productToDelete = product;
    this.isDeleteModalVisible = true;
  }

  confirmDelete(): void {
    if (!this.productToDelete) return;

    const productId = this.productToDelete.id;
    this.isDeleteModalVisible = false;

    this.loadingSubject.next(true);

    this.productService.delete(productId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          // Remove product from local state
          const currentProducts = this.productsSubject.value;
          const updatedProducts = currentProducts.filter(p => p.id !== productId);
          this.productsSubject.next(updatedProducts);

          this.loadingSubject.next(false);
          this.productToDelete = null;

          // Adjust current page if necessary
          this.paginationService.adjustPageAfterDeletion(updatedProducts.length);
        },
        error: (error) => {
          this.errorSubject.next(error.message || 'Error al eliminar producto');
          this.loadingSubject.next(false);
          this.productToDelete = null;
        }
      });
  }

  cancelDelete(): void {
    this.isDeleteModalVisible = false;
    this.productToDelete = null;
  }

  clearError(): void {
    this.errorSubject.next('');
  }
}

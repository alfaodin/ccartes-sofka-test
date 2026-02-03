import { Injectable } from '@angular/core';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { Product } from '../../../core/models/product.model';

export interface PaginatedResult<T> {
  products: T[];
  total: number;
  pageSize: number;
  currentPage: number;
}

@Injectable({
  providedIn: 'any'
})
export class PaginationService {
  private readonly pageSizeSubject = new BehaviorSubject<number>(5);
  private readonly currentPageSubject = new BehaviorSubject<number>(0);
  private readonly searchTermSubject = new BehaviorSubject<string>('');

  readonly pageSize$ = this.pageSizeSubject.asObservable();
  readonly currentPage$ = this.currentPageSubject.asObservable();
  readonly searchTerm$ = this.searchTermSubject.asObservable();

  createPaginatedStream(products$: Observable<Product[]>): Observable<PaginatedResult<Product>> {
    return combineLatest([
      products$,
      this.searchTermSubject,
      this.pageSizeSubject,
      this.currentPageSubject
    ]).pipe(
      map(([products, searchTerm, pageSize, currentPage]) => {
        // Filter products
        const filtered = this.filterProducts(products, searchTerm);

        // Paginate
        const start = currentPage * pageSize;
        const paginated = filtered.slice(start, start + pageSize);

        return {
          products: paginated,
          total: filtered.length,
          pageSize,
          currentPage
        };
      })
    );
  }

  private filterProducts(products: Product[], searchTerm: string): Product[] {
    if (!searchTerm) {
      return products;
    }

    const lowerSearchTerm = searchTerm.toLowerCase();
    return products.filter(p =>
      p.name.toLowerCase().includes(lowerSearchTerm) ||
      p.description.toLowerCase().includes(lowerSearchTerm) ||
      p.id.toLowerCase().includes(lowerSearchTerm)
    );
  }

  setPage(page: number): void {
    this.currentPageSubject.next(page);
  }

  setPageSize(pageSize: number): void {
    this.pageSizeSubject.next(pageSize);
    this.currentPageSubject.next(0);
  }

  setSearchTerm(searchTerm: string): void {
    this.searchTermSubject.next(searchTerm);
    this.currentPageSubject.next(0);
  }

  adjustPageAfterDeletion(totalItems: number): void {
    const pageSize = this.pageSizeSubject.value;
    const currentPage = this.currentPageSubject.value;

    const totalPages = Math.ceil(totalItems / pageSize);

    if (currentPage >= totalPages && totalPages > 0) {
      this.currentPageSubject.next(totalPages - 1);
    }
  }

  reset(): void {
    this.pageSizeSubject.next(5);
    this.currentPageSubject.next(0);
    this.searchTermSubject.next('');
  }

  getCurrentPage(): number {
    return this.currentPageSubject.value;
  }

  getPageSize(): number {
    return this.pageSizeSubject.value;
  }

  getSearchTerm(): string {
    return this.searchTermSubject.value;
  }
}

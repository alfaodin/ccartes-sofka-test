import { TestBed } from '@angular/core/testing';
import { BehaviorSubject } from 'rxjs';

import { PaginationService, PaginatedResult } from './pagination.service';
import { Product } from '../../../core/models/product.model';

describe('PaginationService', () => {
  let service: PaginationService;
  let mockProducts: Product[];

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [PaginationService]
    });
    service = TestBed.inject(PaginationService);

    // Create mock products for testing
    mockProducts = [
      {
        id: 'prod-1',
        name: 'Credit Card Gold',
        description: 'Premium credit card with rewards',
        logo: 'https://example.com/logo1.png',
        date_release: new Date('2024-01-15'),
        date_revision: new Date('2025-01-15')
      },
      {
        id: 'prod-2',
        name: 'Savings Account',
        description: 'High interest savings account',
        logo: 'https://example.com/logo2.png',
        date_release: new Date('2024-02-20'),
        date_revision: new Date('2025-02-20')
      },
      {
        id: 'prod-3',
        name: 'Personal Loan',
        description: 'Flexible personal loan options',
        logo: 'https://example.com/logo3.png',
        date_release: new Date('2024-03-10'),
        date_revision: new Date('2025-03-10')
      },
      {
        id: 'prod-4',
        name: 'Business Account',
        description: 'Complete business banking solution',
        logo: 'https://example.com/logo4.png',
        date_release: new Date('2024-04-05'),
        date_revision: new Date('2025-04-05')
      },
      {
        id: 'prod-5',
        name: 'Mortgage Loan',
        description: 'Home mortgage with competitive rates',
        logo: 'https://example.com/logo5.png',
        date_release: new Date('2024-05-12'),
        date_revision: new Date('2025-05-12')
      },
      {
        id: 'prod-6',
        name: 'Investment Portfolio',
        description: 'Managed investment portfolio service',
        logo: 'https://example.com/logo6.png',
        date_release: new Date('2024-06-18'),
        date_revision: new Date('2025-06-18')
      },
      {
        id: 'prod-7',
        name: 'Auto Loan',
        description: 'Car financing with low interest',
        logo: 'https://example.com/logo7.png',
        date_release: new Date('2024-07-22'),
        date_revision: new Date('2025-07-22')
      }
    ];
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('Initial State', () => {
    it('should have default page size of 5', () => {
      expect(service.getPageSize()).toBe(5);
    });

    it('should have default current page of 0', () => {
      expect(service.getCurrentPage()).toBe(0);
    });

    it('should have empty search term by default', () => {
      expect(service.getSearchTerm()).toBe('');
    });

    it('should expose pageSize$ observable', (done) => {
      service.pageSize$.subscribe(pageSize => {
        expect(pageSize).toBe(5);
        done();
      });
    });

    it('should expose currentPage$ observable', (done) => {
      service.currentPage$.subscribe(currentPage => {
        expect(currentPage).toBe(0);
        done();
      });
    });

    it('should expose searchTerm$ observable', (done) => {
      service.searchTerm$.subscribe(searchTerm => {
        expect(searchTerm).toBe('');
        done();
      });
    });
  });

  describe('createPaginatedStream', () => {
    it('should return paginated products with correct structure', (done) => {
      const products$ = new BehaviorSubject<Product[]>(mockProducts);

      service.createPaginatedStream(products$).subscribe(result => {
        expect(result).toEqual(jasmine.objectContaining({
          products: jasmine.any(Array),
          total: jasmine.any(Number),
          pageSize: jasmine.any(Number),
          currentPage: jasmine.any(Number)
        }));
        done();
      });
    });

    it('should paginate products correctly with default page size (5)', (done) => {
      const products$ = new BehaviorSubject<Product[]>(mockProducts);

      service.createPaginatedStream(products$).subscribe(result => {
        expect(result.products.length).toBe(5);
        expect(result.total).toBe(7);
        expect(result.pageSize).toBe(5);
        expect(result.currentPage).toBe(0);
        expect(result.products[0].id).toBe('prod-1');
        expect(result.products[4].id).toBe('prod-5');
        done();
      });
    });

    it('should return second page when current page is set to 1', (done) => {
      const products$ = new BehaviorSubject<Product[]>(mockProducts);
      service.setPage(1);

      service.createPaginatedStream(products$).subscribe(result => {
        expect(result.products.length).toBe(2);
        expect(result.currentPage).toBe(1);
        expect(result.products[0].id).toBe('prod-6');
        expect(result.products[1].id).toBe('prod-7');
        done();
      });
    });

    it('should filter products by name', (done) => {
      const products$ = new BehaviorSubject<Product[]>(mockProducts);
      service.setSearchTerm('credit');

      service.createPaginatedStream(products$).subscribe(result => {
        expect(result.products.length).toBe(1);
        expect(result.total).toBe(1);
        expect(result.products[0].name).toBe('Credit Card Gold');
        done();
      });
    });

    it('should filter products by description', (done) => {
      const products$ = new BehaviorSubject<Product[]>(mockProducts);
      service.setSearchTerm('loan');

      service.createPaginatedStream(products$).subscribe(result => {
        expect(result.products.length).toBe(3);
        expect(result.total).toBe(3);
        expect(result.products.some(p => p.name === 'Personal Loan')).toBe(true);
        expect(result.products.some(p => p.name === 'Mortgage Loan')).toBe(true);
        expect(result.products.some(p => p.name === 'Auto Loan')).toBe(true);
        done();
      });
    });

    it('should filter products by id', (done) => {
      const products$ = new BehaviorSubject<Product[]>(mockProducts);
      service.setSearchTerm('prod-3');

      service.createPaginatedStream(products$).subscribe(result => {
        expect(result.products.length).toBe(1);
        expect(result.total).toBe(1);
        expect(result.products[0].id).toBe('prod-3');
        done();
      });
    });

    it('should be case insensitive when filtering', (done) => {
      const products$ = new BehaviorSubject<Product[]>(mockProducts);
      service.setSearchTerm('CREDIT');

      service.createPaginatedStream(products$).subscribe(result => {
        expect(result.products.length).toBe(1);
        expect(result.products[0].name).toBe('Credit Card Gold');
        done();
      });
    });

    it('should return all products when search term is empty', (done) => {
      const products$ = new BehaviorSubject<Product[]>(mockProducts);
      service.setSearchTerm('');

      service.createPaginatedStream(products$).subscribe(result => {
        expect(result.total).toBe(7);
        done();
      });
    });

    it('should return empty array when no products match search', (done) => {
      const products$ = new BehaviorSubject<Product[]>(mockProducts);
      service.setSearchTerm('nonexistent product');

      service.createPaginatedStream(products$).subscribe(result => {
        expect(result.products.length).toBe(0);
        expect(result.total).toBe(0);
        done();
      });
    });

    it('should react to changes in products stream', (done) => {
      const products$ = new BehaviorSubject<Product[]>(mockProducts.slice(0, 3));
      let emissionCount = 0;

      service.createPaginatedStream(products$).subscribe(result => {
        emissionCount++;

        if (emissionCount === 1) {
          expect(result.total).toBe(3);
          // Update the products stream
          products$.next(mockProducts);
        } else if (emissionCount === 2) {
          expect(result.total).toBe(7);
          done();
        }
      });
    });

    it('should apply both filter and pagination', (done) => {
      const products$ = new BehaviorSubject<Product[]>(mockProducts);
      service.setSearchTerm('account');
      service.setPageSize(1);

      service.createPaginatedStream(products$).subscribe(result => {
        expect(result.products.length).toBe(1);
        expect(result.total).toBe(2); // Savings Account and Business Account
        expect(result.currentPage).toBe(0);
        done();
      });
    });
  });

  describe('setPage', () => {
    it('should update current page', () => {
      service.setPage(2);
      expect(service.getCurrentPage()).toBe(2);
    });

    it('should emit new value through currentPage$ observable', (done) => {
      let emissionCount = 0;

      service.currentPage$.subscribe(page => {
        emissionCount++;
        if (emissionCount === 1) {
          expect(page).toBe(0); // Initial value
        } else if (emissionCount === 2) {
          expect(page).toBe(3);
          done();
        }
      });

      service.setPage(3);
    });
  });

  describe('setPageSize', () => {
    it('should update page size', () => {
      service.setPageSize(10);
      expect(service.getPageSize()).toBe(10);
    });

    it('should reset current page to 0', () => {
      service.setPage(3);
      service.setPageSize(10);
      expect(service.getCurrentPage()).toBe(0);
    });

    it('should emit new values through observables', (done) => {
      let pageSizeEmissions = 0;
      let currentPageEmissions = 0;

      service.pageSize$.subscribe(size => {
        pageSizeEmissions++;
        if (pageSizeEmissions === 2) {
          expect(size).toBe(20);
        }
      });

      service.currentPage$.subscribe(page => {
        currentPageEmissions++;
        if (currentPageEmissions === 3) {
          expect(page).toBe(0); // Reset to 0
          done();
        }
      });

      service.setPage(2); // currentPageEmissions = 2
      service.setPageSize(20); // pageSizeEmissions = 2, currentPageEmissions = 3
    });
  });

  describe('setSearchTerm', () => {
    it('should update search term', () => {
      service.setSearchTerm('test');
      expect(service.getSearchTerm()).toBe('test');
    });

    it('should reset current page to 0', () => {
      service.setPage(3);
      service.setSearchTerm('new search');
      expect(service.getCurrentPage()).toBe(0);
    });

    it('should emit new values through observables', (done) => {
      let searchTermEmissions = 0;
      let currentPageEmissions = 0;

      service.searchTerm$.subscribe(term => {
        searchTermEmissions++;
        if (searchTermEmissions === 2) {
          expect(term).toBe('search query');
        }
      });

      service.currentPage$.subscribe(page => {
        currentPageEmissions++;
        if (currentPageEmissions === 3) {
          expect(page).toBe(0); // Reset to 0
          done();
        }
      });

      service.setPage(2); // currentPageEmissions = 2
      service.setSearchTerm('search query'); // searchTermEmissions = 2, currentPageEmissions = 3
    });
  });

  describe('adjustPageAfterDeletion', () => {
    it('should not change page when current page is valid', () => {
      service.setPageSize(5);
      service.setPage(0);
      service.adjustPageAfterDeletion(10); // 10 items, 5 per page = 2 pages

      expect(service.getCurrentPage()).toBe(0);
    });

    it('should adjust page when current page exceeds total pages', () => {
      service.setPageSize(5);
      service.setPage(2);
      service.adjustPageAfterDeletion(6); // 6 items, 5 per page = 2 pages (0 and 1)

      expect(service.getCurrentPage()).toBe(1);
    });

    it('should handle deletion of last item on last page', () => {
      service.setPageSize(5);
      service.setPage(2);
      service.adjustPageAfterDeletion(10); // Still on page 2 (10 items = pages 0,1,2)

      expect(service.getCurrentPage()).toBe(1); // Should move to page 1
    });

    it('should handle deletion leaving exactly one page', () => {
      service.setPageSize(5);
      service.setPage(1);
      service.adjustPageAfterDeletion(5); // 5 items = exactly 1 page (page 0)

      expect(service.getCurrentPage()).toBe(0);
    });

    it('should handle deletion of all items except one page', () => {
      service.setPageSize(10);
      service.setPage(5);
      service.adjustPageAfterDeletion(3); // 3 items with page size 10 = 1 page

      expect(service.getCurrentPage()).toBe(0);
    });

    it('should not adjust when total items is 0', () => {
      service.setPageSize(5);
      service.setPage(2);
      service.adjustPageAfterDeletion(0);

      // Should not change when totalItems is 0
      expect(service.getCurrentPage()).toBe(2);
    });

    it('should calculate total pages correctly with various page sizes', () => {
      service.setPageSize(3);
      service.setPage(3);
      service.adjustPageAfterDeletion(7); // 7 items, 3 per page = 3 pages (0,1,2)

      expect(service.getCurrentPage()).toBe(2);
    });
  });

  describe('reset', () => {
    it('should reset page size to default (5)', () => {
      service.setPageSize(20);
      service.reset();
      expect(service.getPageSize()).toBe(5);
    });

    it('should reset current page to 0', () => {
      service.setPage(5);
      service.reset();
      expect(service.getCurrentPage()).toBe(0);
    });

    it('should reset search term to empty string', () => {
      service.setSearchTerm('test search');
      service.reset();
      expect(service.getSearchTerm()).toBe('');
    });

    it('should reset all state properties at once', () => {
      service.setPageSize(20);
      service.setPage(5);
      service.setSearchTerm('test search');

      service.reset();

      expect(service.getPageSize()).toBe(5);
      expect(service.getCurrentPage()).toBe(0);
      expect(service.getSearchTerm()).toBe('');
    });

    it('should emit reset values through observables', (done) => {
      service.setPageSize(15);
      service.setPage(3);
      service.setSearchTerm('query');

      service.reset();

      // Verify all values after reset
      expect(service.getPageSize()).toBe(5);
      expect(service.getCurrentPage()).toBe(0);
      expect(service.getSearchTerm()).toBe('');

      // Verify observables emit the reset values
      service.pageSize$.subscribe(size => {
        expect(size).toBe(5);
      });

      service.currentPage$.subscribe(page => {
        expect(page).toBe(0);
      });

      service.searchTerm$.subscribe(term => {
        expect(term).toBe('');
        done();
      });
    });
  });

  describe('Getter Methods', () => {
    describe('getCurrentPage', () => {
      it('should return current page value', () => {
        service.setPage(4);
        expect(service.getCurrentPage()).toBe(4);
      });

      it('should return initial value before any changes', () => {
        expect(service.getCurrentPage()).toBe(0);
      });
    });

    describe('getPageSize', () => {
      it('should return current page size value', () => {
        service.setPageSize(15);
        expect(service.getPageSize()).toBe(15);
      });

      it('should return initial value before any changes', () => {
        expect(service.getPageSize()).toBe(5);
      });
    });

    describe('getSearchTerm', () => {
      it('should return current search term value', () => {
        service.setSearchTerm('test query');
        expect(service.getSearchTerm()).toBe('test query');
      });

      it('should return initial value before any changes', () => {
        expect(service.getSearchTerm()).toBe('');
      });
    });
  });

  describe('Integration Tests', () => {
    it('should handle complex scenario: filter, paginate, delete, adjust', () => {
      const products$ = new BehaviorSubject<Product[]>(mockProducts);

      // Set page size to 2
      service.setPageSize(2);
      expect(service.getPageSize()).toBe(2);
      expect(service.getCurrentPage()).toBe(0); // Reset by setPageSize

      // Search for "account" (should find 2 products: Savings Account and Business Account)
      service.setSearchTerm('account');
      expect(service.getSearchTerm()).toBe('account');
      expect(service.getCurrentPage()).toBe(0); // Reset by setSearchTerm

      // Go to page 1 (should show 0 items since only 2 items match and page size is 2)
      service.setPage(1);
      expect(service.getCurrentPage()).toBe(1);

      // Adjust after deletion (simulate deleting 1 item, leaving only 1 item)
      // With 1 item and page size 2, we should only have 1 page (page 0)
      service.adjustPageAfterDeletion(1);
      expect(service.getCurrentPage()).toBe(0);
    });

    it('should maintain state consistency across multiple operations', () => {
      service.setPageSize(10);
      service.setPage(2);
      service.setSearchTerm('test');

      expect(service.getPageSize()).toBe(10);
      expect(service.getCurrentPage()).toBe(0); // Reset by setSearchTerm
      expect(service.getSearchTerm()).toBe('test');

      service.setPage(5);
      expect(service.getCurrentPage()).toBe(5);

      service.reset();
      expect(service.getPageSize()).toBe(5);
      expect(service.getCurrentPage()).toBe(0);
      expect(service.getSearchTerm()).toBe('');
    });

    it('should handle empty products array', (done) => {
      const products$ = new BehaviorSubject<Product[]>([]);

      service.createPaginatedStream(products$).subscribe(result => {
        expect(result.products.length).toBe(0);
        expect(result.total).toBe(0);
        expect(result.pageSize).toBe(5);
        expect(result.currentPage).toBe(0);
        done();
      });
    });

    it('should handle products array with less items than page size', (done) => {
      const products$ = new BehaviorSubject<Product[]>(mockProducts.slice(0, 3));

      service.createPaginatedStream(products$).subscribe(result => {
        expect(result.products.length).toBe(3);
        expect(result.total).toBe(3);
        done();
      });
    });
  });
});

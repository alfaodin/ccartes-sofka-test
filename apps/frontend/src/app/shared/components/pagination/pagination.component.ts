import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

/**
 * Pagination Component
 * Reusable pagination with page size selector
 */
@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pagination.component.html',
  styleUrls: ['./pagination.component.scss']
})
export class PaginationComponent {
  /**
   * Total number of items
   */
  @Input() totalItems = 0;

  /**
   * Current page size
   */
  @Input() pageSize = 5;

  /**
   * Current page index (0-based)
   */
  @Input() currentPage = 0;

  /**
   * Available page size options
   */
  @Input() pageSizeOptions: number[] = [5, 10, 20];

  /**
   * Emits when page changes
   */
  @Output() pageChange = new EventEmitter<number>();

  /**
   * Emits when page size changes
   */
  @Output() pageSizeChange = new EventEmitter<number>();

  /**
   * Get total number of pages
   */
  get totalPages(): number {
    return Math.ceil(this.totalItems / this.pageSize);
  }

  /**
   * Get page numbers to display
   */
  get pageNumbers(): number[] {
    const pages: number[] = [];
    for (let i = 0; i < this.totalPages; i++) {
      pages.push(i);
    }
    return pages;
  }

  /**
   * Check if on first page
   */
  get isFirstPage(): boolean {
    return this.currentPage === 0;
  }

  /**
   * Check if on last page
   */
  get isLastPage(): boolean {
    return this.currentPage >= this.totalPages - 1;
  }

  /**
   * Get display range (e.g., "1-5 of 50")
   */
  get displayRange(): string {
    if (this.totalItems === 0) {
      return '0-0 de 0';
    }
    const start = this.currentPage * this.pageSize + 1;
    const end = Math.min((this.currentPage + 1) * this.pageSize, this.totalItems);
    return `${start}-${end} de ${this.totalItems}`;
  }

  /**
   * Go to specific page
   */
  goToPage(page: number): void {
    if (page >= 0 && page < this.totalPages && page !== this.currentPage) {
      this.pageChange.emit(page);
    }
  }

  /**
   * Go to previous page
   */
  previousPage(): void {
    if (!this.isFirstPage) {
      this.goToPage(this.currentPage - 1);
    }
  }

  /**
   * Go to next page
   */
  nextPage(): void {
    if (!this.isLastPage) {
      this.goToPage(this.currentPage + 1);
    }
  }

  /**
   * Handle page size change
   */
  onPageSizeChange(newSize: number): void {
    this.pageSizeChange.emit(newSize);
    // Reset to first page when page size changes
    this.pageChange.emit(0);
  }
}

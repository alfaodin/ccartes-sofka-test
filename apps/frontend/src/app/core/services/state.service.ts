import { BehaviorSubject } from 'rxjs';
import { Injectable } from '@angular/core';

import { Product } from '../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class StateService {
  private readonly selectedProductSubject = new BehaviorSubject<Product | null>(null);
  
  setSelectedProduct(product: Product | null): void {
    this.selectedProductSubject.next(product);
  }
  getSelectedProduct(): Product | null {
    return this.selectedProductSubject.value;
  }
  clearSelectedProduct(): void {
    this.selectedProductSubject.next(null);
  }
}

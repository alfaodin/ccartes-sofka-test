import { Routes } from '@angular/router';
import { ProductListComponent } from './components/product-list/product-list.component';
import { ProductFormComponent } from './components/product-form/product-form.component';

/**
 * Product feature routes
 * Defines routes for listing, creating, and editing products
 */
export const PRODUCT_ROUTES: Routes = [
  {
    path: '',
    component: ProductListComponent,
    title: 'Products - Financial Management'
  },
  {
    path: 'new',
    component: ProductFormComponent,
    title: 'Create Product - Financial Management'
  },
  {
    path: ':id/edit',
    component: ProductFormComponent,
    title: 'Edit Product - Financial Management'
  }
];

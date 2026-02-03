export interface Product {
  id: string;
  name: string;
  logo: string;
  description: string;
  date_release: string | Date;
  date_revision: string | Date;
}
export interface ProductList {
  data: Product[];
}

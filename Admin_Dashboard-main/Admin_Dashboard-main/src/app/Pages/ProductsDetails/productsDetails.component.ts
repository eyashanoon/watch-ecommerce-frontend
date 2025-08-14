import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../Service/product.service';
import{ProductWithImages} from "../products/products.component"

@Component({
  selector: 'app-productsDetails',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './productsDetails.component.html',
  styleUrls: ['./productsDetails.component.css']
})
export class ProductsDetailsComponent {
  products: ProductWithImages & {selectedQty: number} | null = null;

  constructor(private router: Router, private productService: ProductService) {
    const nav = this.router.getCurrentNavigation();
    this.products = nav?.extras?.state?.['product'] ?? null;
    console.log(this.products)

    if (!this.products) {
      this.router.navigate(['/']);
      return;
    }

    if (this.products.selectedQty === undefined || this.products.selectedQty < 1) {
      this.products.selectedQty = 1;
    }
  }

  editProduct() {
    if (this.products) {
      const encoded = encodeURIComponent(this.products.name);
      this.router.navigate(['/edit-product', encoded]);
    }
  }

  deleteProduct() {
    if (!this.products) return;

    const confirmDelete = confirm('Are you sure you want to delete this product?');
    if (!confirmDelete) return;

    const allProducts = this.productService.getProducts();
    const index = allProducts.findIndex(p => p.name === this.products?.name);

    if (index !== -1) {
      allProducts.splice(index, 1);
      this.productService.saveProducts(allProducts);
      alert('Product deleted successfully!');
      this.router.navigate(['/product']);
    } else {
      alert('Product not found.');
    }
  }
    goToHomePage() {
    this.router.navigate(['/product']);
  }

  scrollRight(product:ProductWithImages & {selectedQty: number} ){
    if(product.currentImageIndex>=product.images.length-1)product.currentImageIndex=0;
    else product.currentImageIndex++;
  }
}

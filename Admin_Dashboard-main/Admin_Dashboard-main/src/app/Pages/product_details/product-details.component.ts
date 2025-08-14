import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../Service/product.service';
import { ProductWithImages } from '../products/products.component';

@Component({
  selector: 'app-product-details',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './product-details.component.html',
  styleUrls: ['./product-details.component.css']
})
export class ProductDetailsComponent {
  product: (ProductWithImages & { selectedQty: number }) | null = null;

  constructor(private router: Router, private productService: ProductService) {
    const nav = this.router.getCurrentNavigation();
    this.product = nav?.extras?.state?.['product'] ?? null;

    if (!this.product) {
      this.router.navigate(['/product']); // fallback to product listing
      return;
    }

    if (this.product.selectedQty === undefined || this.product.selectedQty < 1) {
      this.product.selectedQty = 1;
    }
  }

  // Add to Cart
  addToCart(product: ProductWithImages & { selectedQty: number }) {
    if (!product.selectedQty || product.selectedQty < 1) {
      alert('Please select a quantity of at least 1.');
      return;
    }

    let cart = JSON.parse(localStorage.getItem('cart') || '[]');

    const existingIndex = cart.findIndex((item: any) => item.name === product.name);

    if (existingIndex !== -1) {
      cart[existingIndex].selectedQty = (cart[existingIndex].selectedQty ?? 0) + product.selectedQty;
    } else {
      cart.push({ ...product });
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    alert(`${product.name} added to cart (Qty: ${product.selectedQty})`);
    product.selectedQty = 1;
  }

  // Add/Remove from Wishlist
  toggleWishlist(product: ProductWithImages & { selectedQty: number }) {
    let wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
    const index = wishlist.findIndex((item: any) => item.name === product.name);

    if (index === -1) {
      wishlist.push(product);
      alert(`${product.name} added to wishlist!`);
    } else {
      wishlist.splice(index, 1);
      alert(`${product.name} removed from wishlist.`);
    }
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
  }

  isInWishlist(product: ProductWithImages & { selectedQty: number }): boolean {
    const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
    return wishlist.some((item: any) => item.name === product.name);
  }

  scrollRight(product: ProductWithImages & { selectedQty: number }) {
    if (product.currentImageIndex >= product.images.length - 1) product.currentImageIndex = 0;
    else product.currentImageIndex++;
  }
}

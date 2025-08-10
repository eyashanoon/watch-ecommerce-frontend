import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

interface Product {
  name: string;
  image: string;
  description: string;
  price: number;
  brand: string;
  waterProof: boolean;
  includesDate: boolean;
  numberingType: string;
  hasFullNumerals: boolean;
  hasTickingSound: boolean;
  size: number;
  wieght: number;
  bandColor: string;
  handsColor: string;
  backgroundColor: string;
  bandMaterial: string;
  caseMaterial: string;
  displayType: string;
  shape: string;
  changeableBand: boolean;
  quantity: number;
  selectedQty?: number;
}


@Component({
  selector: 'app-product-details',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './product-details.component.html',
  styleUrls: ['./product-details.component.css']
})
export class ProductDetailsComponent {
  product: Product | null = null;

  constructor(private router: Router) {
    const nav = this.router.getCurrentNavigation();
    this.product = nav?.extras?.state?.['product'] ?? null;

    if (!this.product) {
      this.router.navigate(['/']);
      return;
    }

    if (this.product.selectedQty === undefined || this.product.selectedQty < 1) {
      this.product.selectedQty = 1;
    }
  }

  addToCart(product: Product) {
    if (!product.selectedQty || product.selectedQty < 1) {
      alert('Please select a quantity of at least 1.');
      return;
    }

    let cart: Product[] = JSON.parse(localStorage.getItem('cart') || '[]');

    const existingIndex = cart.findIndex(item => item.name === product.name);

    if (existingIndex !== -1) {
      // Update existing quantity
      cart[existingIndex].selectedQty = (cart[existingIndex].selectedQty ?? 0) + product.selectedQty;
    } else {
      // Add new product with selectedQty
      cart.push({ ...product });
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    alert(`${product.name} added to cart (Qty: ${product.selectedQty})`);

    // Reset selectedQty after adding to cart (optional)
    product.selectedQty = 1;
  }

  toggleWishlist(product: Product) {
    let wishlist: Product[] = JSON.parse(localStorage.getItem('wishlist') || '[]');
    const index = wishlist.findIndex(item => item.name === product.name);

    if (index === -1) {
      wishlist.push(product);
      alert(`${product.name} added to wishlist!`);
    } else {
      wishlist.splice(index, 1);
      alert(`${product.name} removed from wishlist.`);
    }
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
  }

  isInWishlist(product: Product): boolean {
    const wishlist: Product[] = JSON.parse(localStorage.getItem('wishlist') || '[]');
    return wishlist.some(item => item.name === product.name);
  }

  isDarkColor(color: string): boolean {
    if (!color) return false;
    const ctx = document.createElement('canvas').getContext('2d');
    if (!ctx) return false;
    ctx.fillStyle = color;
    const computed = ctx.fillStyle;
    const rgb = computed.match(/\d+/g);
    if (!rgb || rgb.length < 3) return false;
    const r = parseInt(rgb[0], 10);
    const g = parseInt(rgb[1], 10);
    const b = parseInt(rgb[2], 10);
    const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
    return luminance < 128;
  }

  getContrastingColor(hexColor: string): string {
    if (!hexColor) return 'black';
    hexColor = hexColor.replace('#', '');
    const r = parseInt(hexColor.substr(0, 2), 16);
    const g = parseInt(hexColor.substr(2, 2), 16);
    const b = parseInt(hexColor.substr(4, 2), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.6 ? 'black' : 'white';
  }
}

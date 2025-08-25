import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
 import { RouterModule } from '@angular/router';
 import { ProductService1} from '../../Service/product1.service';
import { Product,ProductService} from '../../Service/product.service';
@Component({
  selector: 'app-customer-products',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './customer-products.component.html',
  styleUrls: ['./customer-products.component.css']
})
export class CustomerProductsComponent implements OnInit {
   
  
  ngOnInit(): void {
    
  }

    
 
 
}

/*
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
 import { RouterModule } from '@angular/router';
 import { ProductService1} from '../../Service/product1.service';
import { Product,ProductService} from '../../Service/product.service';
@Component({
  selector: 'app-customer-products',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './customer-products.component.html',
  styleUrls: ['./customer-products.component.css']
})
export class CustomerProductsComponent implements OnInit {
  searchText = '';
  cart: { product: Product; qty: number }[] = [];
  source = 'home';
  products: Product[] = [];

  filters = {
    maxPrice: 1000,
    maxSize: 45,
    maxWeight: 60,
    waterProof: false,
    includesDate: false,
    hasFullNumerals: false,
    hasTickingSound: false,
    displayType: '',
    bandColor: '',
    handsColor: '',
    backgroundColor: '',
    bandMaterial: '',
    caseMaterial: '',
    brand: '',
    numberingType: '',
    shape: '',
    changeableBand: ''
  };

  availableColors = [
    'Black', 'White', 'Gold', 'Silver', 'Rose Gold', 'Brown', 'Blue', 'Green',
    'Red', 'Navy', 'Beige', 'Grey', 'Gunmetal', 'Bronze', 'Copper',
    'Rust', 'Yellow', 'Orange', 'Purple', 'Pink', 'Turquoise', 'Cream'
  ];

  availableBrands = ['Dryden', 'Rolex', 'iPhone', 'Samsung', 'Casio', 'Seiko', 'Citizen', 'Fossil', 'Timex', 'Bulova'];
  bandColors = ['black', 'brown', 'silver', 'gold', 'blue', 'red', 'orange', 'white'];
  handsColors = ['black', 'white', 'gold', 'silver', 'blue', 'red'];
  backgroundColors = ['black', 'white', 'blue', 'red', 'green', 'silver', 'gold'];
  bandMaterials = ['leather', 'metal', 'rubber', 'fabric'];
  caseMaterials = ['crystal', 'stainless steel', 'plastic', 'ceramic'];
  displayTypes = ['dial', 'digital', 'analog-digital'];
  numberingTypes = ['Latino', 'English', 'Arabic', 'Roman'];
  shapes = ['round', 'square', 'rectangular', 'oval'];

  @ViewChild('backgroundVideo') backgroundVideo!: ElementRef<HTMLVideoElement>;

  constructor(private router: Router, private productService: ProductService) {
    const nav = this.router.getCurrentNavigation();
    const incomingSource = nav?.extras?.state?.['source'];

    if (incomingSource) {
      this.source = incomingSource;
      localStorage.setItem('customerProductsSource', this.source);
    } else {
      const saved = localStorage.getItem('customerProductsSource');
      if (saved) this.source = saved;
    }
  }

  ngOnInit(): void {
    const video: HTMLVideoElement | null = document.querySelector('.video-background');
    if (video) {
      video.muted = true;
      video.play().catch(() => {});
    }

    this.products = this.productService.getProducts();
    this.products.forEach(p => {
      if (p.selectedQty === undefined) {
        p.selectedQty = 1;
      }
    });
  }

  get filteredProducts() {
    const search = this.searchText?.toLowerCase() || '';

    return this.products.filter(p => {
      const matchesSearch = (p.name + p.description + p.brand).toLowerCase().includes(search);

      return (
        matchesSearch &&
        p.price <= this.filters.maxPrice &&
        p.wieght <= this.filters.maxWeight &&
        p.size <= this.filters.maxSize &&
                (!this.filters.waterProof || p.waterProof) &&
        (!this.filters.includesDate || p.includesDate) &&
        (!this.filters.hasFullNumerals || p.hasFullNumerals) &&
        (!this.filters.hasTickingSound || !p.hasTickingSound) &&
        (!this.filters.displayType || p.displayType === this.filters.displayType) &&
        (!this.filters.numberingType || p.numberingType === this.filters.numberingType) &&
        (!this.filters.brand || p.brand === this.filters.brand) &&
        (!this.filters.bandColor || p.bandColor === this.filters.bandColor) &&
        (!this.filters.backgroundColor || p.backgroundColor === this.filters.backgroundColor) &&
        (!this.filters.bandMaterial || p.bandMaterial === this.filters.bandMaterial) &&
        (!this.filters.caseMaterial || p.caseMaterial === this.filters.caseMaterial) &&
        (!this.filters.handsColor || p.handsColor === this.filters.handsColor) &&
        (!this.filters.shape || p.shape === this.filters.shape) &&
        (this.filters.changeableBand ? p.changeableBand : true)
      );
    });
  }

  addToCart(product: Product) {
    if (!product.selectedQty || product.selectedQty < 1) {
      this.showToastMessage('Please select a quantity of at least 1.');
      return;
    }

    const existing = this.cart.find(item => item.product === product);
    if (existing) {
      existing.qty += product.selectedQty;
    } else {
      this.cart.push({ product, qty: product.selectedQty });
    }

    this.showToastMessage(`${product.name} added to cart (Qty: ${product.selectedQty})`);
    product.selectedQty = 1;
  }

  toggleDetails(product: Product) {
    product.showDetails = !product.showDetails;
  }

 goToProductDetails(product: Product): void {
  const encodedName = encodeURIComponent(product.name);
  this.router.navigate(['/product', encodedName], {
    state: { product }
  });
}


  addToWishlist(product: Product) {
    let wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
    const alreadyExists = wishlist.find((item: any) => item.name === product.name);

    if (!alreadyExists) {
      wishlist.push(product);
      localStorage.setItem('wishlist', JSON.stringify(wishlist));
      this.showToastMessage(`${product.name} added to wishlist`);
    } else {
      this.showToastMessage(`${product.name} is already in your wishlist`);
    }
  }

  goToSignInPage() {
    this.router.navigate(['/sign-in']);
  }

  goToSignUpPage() {
    this.router.navigate(['/sign-up']);
  }

  goHome() {
    const source = localStorage.getItem('customerProductsSource');
    if (source === 'dashboard') {
      this.router.navigate(['/customer-dash-board']);
    } else {
      this.router.navigate(['/']);
    }
  }
}
*/
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ProductService, Product } from '../../Service/product.service';
import { NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.css']
})
export class ProductsComponent implements OnInit {
  product: any[] = [];
  searchText: string = '';
  originalProduct: any = null;
  showAddForm = false;
  sidebarVisible = false;
 
  filters = {
    maxPrice: 1000,
    maxQuantity: 100,
    maxWeight: 60,
    maxSize: 45,
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
    changeableBand: true,
  };

  availableColors = [
    'Black', 'White', 'Gold', 'Silver', 'Rose Gold', 'Brown', 'Blue', 'Green',
    'Red', 'Navy', 'Beige', 'Grey', 'Gunmetal', 'Bronze', 'Copper',
    'Rust', 'Yellow', 'Orange', 'Purple', 'Pink', 'Turquoise', 'Cream'
  ];

  availableBrands = [
    'Dryden', 'Rolex', 'iPhone', 'Samsung', 'Casio', 'Seiko', 'Citizen',
    'Fossil', 'Timex', 'Bulova'
  ];

  bandColors = ['black', 'brown', 'silver', 'gold', 'blue', 'red', 'orange', 'white'];

  handsColors = ['black', 'white', 'gold', 'silver', 'blue', 'red'];

  backgroundColors = ['black', 'white', 'blue', 'red', 'green', 'silver', 'gold'];

  bandMaterials = ['leather', 'metal', 'rubber', 'fabric'];

  caseMaterials = ['crystal', 'stainless steel', 'plastic', 'ceramic'];

  displayTypes = ['dial', 'digital', 'analog-digital'];

  numberingTypes = ['Latino', 'English', 'Arabic', 'Roman'];

  shapes = ['round', 'square', 'rectangular', 'oval'];

  constructor(private router: Router, private productService: ProductService) {}

ngOnInit(): void {
  this.loadProducts();

  this.router.events
    .pipe(filter(event => event instanceof NavigationEnd))
    .subscribe(() => {
      this.loadProducts();
    });
}

loadProducts() {
  this.product = this.productService.getProducts();

  this.product.forEach(product => {
    if (!product.images) {
      product.images = product.image ? [product.image] : [];
    }
         console.log(product.currentImageIndex);

    if (product.currentImageIndex === undefined || product.currentImageIndex === null) {
      product.currentImageIndex = 0;
    }
  });
}

  get filteredProducts() {
    const search = this.searchText.toLowerCase();

    return this.product.filter(p => {
      const matchesSearch = (p.name + p.description + p.brand + (p.color || ''))
        .toLowerCase()
        .includes(search);

      return (
        matchesSearch &&
        p.price <= this.filters.maxPrice &&
        p.quantity <= this.filters.maxQuantity &&
        p.wieght <= this.filters.maxWeight &&
        p.size <= this.filters.maxSize &&
        (!this.filters.waterProof || p.waterProof) &&
        (!this.filters.displayType || p.displayType === this.filters.displayType) &&
        (!this.filters.brand || p.brand === this.filters.brand) &&
        (!this.filters.includesDate || p.includesDate) &&
        (!this.filters.numberingType || p.numberingType === this.filters.numberingType) &&
        (!this.filters.hasFullNumerals || p.hasFullNumerals) &&
        (!this.filters.hasTickingSound || !p.hasTickingSound) &&
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

  toggleDetails(product: any) {
    product.showDetails = !product.showDetails;
  }

  toggleEdit(product: any) {
    if (!product.editMode) {
      this.originalProduct = { ...product };
    }
    product.editMode = !product.editMode;
  }

  saveEdit(product: any) {
    if (!Number.isInteger(product.quantity)) {
      alert("Quantity must be a whole number.");
      return;
    }

    const nameExists = this.product.some(p =>
      p !== product && p.name.trim().toLowerCase() === product.name.trim().toLowerCase()
    );
    if (nameExists) {
      alert("Another product already has this name.");
      return;
    }

    const imageExists = this.product.some(p =>
      p !== product && p.image.trim() === product.image.trim()
    );
    if (imageExists) {
      alert("Another product already has this image URL.");
      return;
    }

    product.editMode = false;
    this.productService.saveProducts(this.product);
  }

  cancelEdit(product: any) {
    Object.assign(product, this.originalProduct);
    product.editMode = false;
  }

  deleteProduct(index: number) {
    this.product.splice(index, 1);
    this.productService.saveProducts(this.product);
  }

  scrollToAddWatch() {
    this.showAddForm = true;
    setTimeout(() => {
      const formSection = document.querySelector('.add-watch-card');
      if (formSection) {
        formSection.scrollIntoView({ behavior: 'smooth' });
      }
    }, 0);
  }

  confirmDeleteProduct(index: number, event: Event) {
    event.stopPropagation(); // Prevent the parent click handler

    if (confirm('Are you sure you want to delete this product?')) {
      this.deleteProduct(index);
    }
  }

  goToHomePage() {
    this.router.navigate(['/home']);
  }

  toggleSidebar() {
    this.sidebarVisible = !this.sidebarVisible;
  }

  goToAddProductPage() {
    this.router.navigate(['/add-product']);
  }

  goToEdit(productName: string) {
    const encoded = encodeURIComponent(productName);
    this.router.navigate(['/edit-product', encoded]);
  }

  startCarousel(product: any) {
    if (product.carouselInterval) return;

    product.carouselInterval = setInterval(() => {
      this.nextImage(product, new Event('click'));
    }, 3000);
  }

  stopCarousel(product: any) {
    if (product.carouselInterval) {
      clearInterval(product.carouselInterval);
      product.carouselInterval = null;
    }
  }

prevImage(product: any, event: Event) {
  event.stopPropagation(); // prevent click from opening details
  if (product.images && product.images.length > 0) {
    product.currentImageIndex =
      (product.currentImageIndex - 1 + product.images.length) % product.images.length;
  }
}

nextImage(product: any, event: Event) {
  event.stopPropagation();
  if (product.images && product.images.length > 0) {
    product.currentImageIndex =
      (product.currentImageIndex + 1) % product.images.length;
      console.log(product.currentImageIndex)
  }
}

  // New method called by arrow buttons that do nothing
  doNothing(event: Event) {
    event.stopPropagation();
  }
goToProductDetails(product: any): void {
  const encodedName = encodeURIComponent(product.name);
  this.router.navigate(['/admin-product', encodedName], {
    state: { product }
  });
}



}

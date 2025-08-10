import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ProductService, Product } from '../../Service/product.service';

@Component({
  selector: 'app-add-product',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-product.component.html',
  styleUrls: ['./add-product.component.css']
})
export class AddProductComponent implements OnInit {
  products: Product[] = [];

  // New: images is an array of 5 strings (empty initially)
  newProduct: Product = {
    name: '',
    price: 0,
    quantity: 0,
    images: ['', '', '', '', ''],    // <-- updated here
    description: '',
    brand: '',
    waterProof: false,
    includesDate: false,
    numberingType: '',
    hasFullNumerals: false,
    hasTickingSound: false,
    size: 0,
    wieght: 0,
    bandColor: '',
    handsColor: '',
    backgroundColor: '',
    bandMaterial: '',
    caseMaterial: '',
    displayType: '',
    shape: '',
    changeableBand: true,
    editMode: false,
    showDetails: false
  };

  availableBrands = ['Dryden', 'Rolex', 'iPhone', 'Samsung', 'Casio', 'Seiko', 'Citizen', 'Fossil', 'Timex', 'Bulova'];
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
  }

  loadProducts() {
    this.products = this.productService.getProducts();
  }

  saveProductsToLocalStorage() {
    this.productService.saveProducts(this.products);
  }

  addProduct() {
    this.loadProducts();

    const name = this.newProduct.name.trim().toLowerCase();
    // Validate that all images are non-empty and trimmed
    const images = this.newProduct.images.map(img => img.trim());

    if (!name) {
      alert('Product name is required.');
      return;
    }

    // Check if any image is empty
    if (images.some(img => img === '')) {
      alert('All 5 image URLs are required.');
      return;
    }

    const priceValid = /^\d+(\.\d+)?$/.test(this.newProduct.price.toString());
    if (!priceValid || this.newProduct.price <= 0) {
      alert('Price must be a valid positive number.');
      return;
    }

    if (!Number.isInteger(this.newProduct.quantity) || this.newProduct.quantity <= 0) {
      alert('Quantity must be a valid positive integer.');
      return;
    }

    const sizeValid = /^\d+(\.\d+)?$/.test(this.newProduct.size.toString());
    if (!sizeValid || this.newProduct.size <= 0) {
      alert('Size must be a valid positive number.');
      return;
    }

    const weightValid = /^\d+(\.\d+)?$/.test(this.newProduct.wieght.toString());
    if (!weightValid || this.newProduct.wieght <= 0) {
      alert('Weight must be a valid positive number.');
      return;
    }

    const isDuplicateName = this.products.some(
      (p) => (p.name?.trim().toLowerCase() || '') === name
    );
    if (isDuplicateName) {
      alert('A product with this name already exists.');
      return;
    }

    // Check if any existing product has any of the new product's images
    const isDuplicateImage = this.products.some(p =>
      p.images.some(img => images.includes(img.trim()))
    );
    if (isDuplicateImage) {
      alert('One or more of these images already exist in another product.');
      return;
    }

    // Assign trimmed images array back
    this.newProduct.images = images;

    this.products.push({ ...this.newProduct });
    this.saveProductsToLocalStorage();
    this.resetNewProduct();
    this.router.navigate(['/product']);
  }

  resetNewProduct() {
    this.newProduct = {
      name: '',
      price: 0,
      quantity: 0,
      images: ['', '', '', '', ''],    // reset images array
      description: '',
      brand: '',
      waterProof: false,
      includesDate: false,
      numberingType: '',
      hasFullNumerals: false,
      hasTickingSound: false,
      size: 0,
      wieght: 0,
      bandColor: '',
      handsColor: '',
      backgroundColor: '',
      bandMaterial: '',
      caseMaterial: '',
      displayType: '',
      shape: '',
      changeableBand: true,
      editMode: false,
      showDetails: false
    };
  }

  cancelAndReset(watchForm: any): void {
    if (watchForm) {
      watchForm.reset();
    }
    this.resetNewProduct();
    this.router.navigate(['/product']);
  }

  goToProductPage(): void {
    this.router.navigate(['/product']);
  }
}

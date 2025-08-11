import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ProductService1 } from '../../Service/product1.service';  // Update path as needed
import { Product } from '../../Service/product.service'; // Assuming your Product interface is here
import { ProductDTO } from '../../models/createproduct.model'; // Assuming your Product interface is here

@Component({
  selector: 'app-add-product',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-product.component.html',
  styleUrls: ['./add-product.component.css']
})
export class AddProductComponent {
  newProduct: Product = {
    name: '',
    price: 0,
    quantity: 0,
    images: ['', '', '', '', ''], 
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
    showDetails: false,
    currentImageIndex: 0
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

  constructor(private router: Router, private productService: ProductService1) {}

  addProduct() {
    // Trim and validate inputs
    const name = this.newProduct.name.trim();
    const images = this.newProduct.images.map(img => img.trim());

    if (!name) {
      alert('Product name is required.');
      return;
    }

/*    if (images.some(img => img === '')) {
      alert('All 5 image URLs are required.');
      return;
    }*/

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

    // Prepare payload for backend
    
    const productPayload: ProductDTO = {
      name: this.newProduct.name.trim(),
      description: this.newProduct.description?.trim() || '',
      brand: this.newProduct.brand,
      size: Number(this.newProduct.size),
      weight: Number(this.newProduct.wieght), // note the spelling fix to match backend 'weight'
      handsColor: this.newProduct.handsColor,
      backgroundColor: this.newProduct.backgroundColor,
      bandColor: this.newProduct.bandColor,
      numberingFormat: this.newProduct.numberingType, // mapping 'numberingType' to 'numberingFormat'
      bandMaterial: this.newProduct.bandMaterial,
      caseMaterial: this.newProduct.caseMaterial,
      displayType: this.newProduct.displayType,
      shape: this.newProduct.shape,
      includesDate: this.newProduct.includesDate ,
      hasFullNumerals: this.newProduct.hasFullNumerals ,
      hasTickingSound: this.newProduct.hasTickingSound ,
      waterProof: this.newProduct.waterProof,
      changeableBand: this.newProduct.changeableBand ?? true,
      price: Number(this.newProduct.price),
      quantity: Number(this.newProduct.quantity),
    };

    this.productService.addProduct(productPayload).subscribe({
      next: (response) => {
        alert('Product added successfully!');
        this.resetNewProduct();
        this.router.navigate(['/product']);
      },
      error: (err) => {
        console.error('Error adding product:', err);
        alert('Failed to add product. Please try again later.');
      }
    });
  }

  resetNewProduct() {
    this.newProduct = {
      name: '',
      price: 0,
      quantity: 0,
      images: ['', '', '', '', ''], 
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
      showDetails: false,
      currentImageIndex: 0
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

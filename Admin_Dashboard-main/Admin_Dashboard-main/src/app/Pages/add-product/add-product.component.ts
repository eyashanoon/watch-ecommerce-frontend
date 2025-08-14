import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ProductService1 } from '../../Service/product1.service';
import { Product } from '../../Service/product.service';
import { ProductDTO } from '../../models/createproduct.model';

@Component({
  selector: 'app-add-product',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-product.component.html',
  styleUrls: ['./add-product.component.css']
})
export class AddProductComponent implements OnInit {
imageFiles: File[] = [];

  mode: 'add' | 'edit' = 'add';
  productId?: string;

  newProduct: Product = {
    name: '',
    price: 0,
    quantity: 0,
    images: ['', '', '', '', ''],
    description: '',
    brand: '',
    waterProof: undefined,
    includesDate: undefined,
    numberingType: '',
    hasFullNumerals: undefined,
    hasTickingSound: undefined,
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

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private productService: ProductService1
  ) {}

  ngOnInit(): void {
    this.productId = this.route.snapshot.paramMap.get('id') ?? undefined;
    if (this.productId) {
      this.mode = 'edit';
      this.loadProductForEdit(this.productId);
    }
  }
// Remove a file from the list
removeImage(index: number): void {
  this.imageFiles.splice(index, 1);
}

onFileSelected(event: Event): void {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files.length > 0) {
    const file = input.files[0];
    this.imageFiles.push(file);
    input.value = ''; // Clear the input so user can select the next file
  }
}

  loadProductForEdit(id: string): void {
    this.productService.getProductById(id).subscribe({
      next: (product: any) => {
        this.newProduct = {
          ...product,
          wieght: product.weight, // Map backend's "weight" to form field
          images: product.images && product.images.length ? product.images : ['', '', '', '', '']
        };
      },
      error: (err) => {
        console.error('Failed to load product', err);
        alert('Could not load product for editing.');
        this.router.navigate(['/product']);
      }
    });
  }

  onSubmit(): void {
    if (this.mode === 'add') {
      this.addProduct();
    } else {
      this.updateProduct();
    }
  }

private validateForm(): boolean {
  // Name
  if (!this.newProduct.name.trim()) {
    alert('Product name is required.');
    return false;
  }

  // Price
  const priceValid = /^\d+(\.\d+)?$/.test(this.newProduct.price.toString());
  if (!priceValid || this.newProduct.price <= 0) {
    alert('Price must be a valid positive number.');
    return false;
  }

  // Quantity
  const quantity = Number(this.newProduct.quantity);
  if (!Number.isInteger(quantity) || quantity <= 0) {
    alert('Quantity must be a valid positive integer.');
    return false;
  }
  this.newProduct.quantity = quantity;

  // Size
  if (!/^\d+(\.\d+)?$/.test(this.newProduct.size.toString()) || this.newProduct.size <= 0) {
    alert('Size must be a valid positive number.');
    return false;
  }

  // Weight
  if (!/^\d+(\.\d+)?$/.test(this.newProduct.wieght.toString()) || this.newProduct.wieght <= 0) {
    alert('Weight must be a valid positive number.');
    return false;
  }

  // Images
  if (!this.imageFiles || this.imageFiles.length === 0) {
    alert('Please upload at least one image.');
    return false;
  }

  // Yes/No Radio Groups
  if (this.newProduct.waterProof === undefined) {
    alert('Please select Waterproof: Yes or No.');
    return false;
  }
  if (this.newProduct.includesDate === undefined) {
    alert('Please select Includes Date: Yes or No.');
    return false;
  }
  if (this.newProduct.hasFullNumerals === undefined) {
    alert('Please select Has Full Numerals: Yes or No.');
    return false;
  }
  if (this.newProduct.hasTickingSound === undefined) {
    alert('Please select Ticking Sound: Yes or No.');
    return false;
  }

  // Dropdowns / Select Fields
  if (!this.newProduct.brand) {
    alert('Please select a brand.');
    return false;
  }
  if (!this.newProduct.bandColor) {
    alert('Please select a band color.');
    return false;
  }
  if (!this.newProduct.handsColor) {
    alert('Please select a hands color.');
    return false;
  }
  if (!this.newProduct.backgroundColor) {
    alert('Please select a background color.');
    return false;
  }
  if (!this.newProduct.bandMaterial) {
    alert('Please select a band material.');
    return false;
  }
  if (!this.newProduct.caseMaterial) {
    alert('Please select a case material.');
    return false;
  }
  if (!this.newProduct.displayType) {
    alert('Please select a display type.');
    return false;
  }
  if (!this.newProduct.shape) {
    alert('Please select a shape.');
    return false;
  }
  if (!this.newProduct.numberingType) {
    alert('Please select a numbering type.');
    return false;
  }

  // Description
  if (!this.newProduct.description.trim()) {
    alert('Please enter a description.');
    return false;
  }

  return true;
}


  addProduct(): void {
    if (!this.validateForm()) return;
    const formData = this.prepareFormData();

    this.productService.addProduct(formData).subscribe({
      next: () => {
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

  updateProduct(): void {
    if (!this.validateForm()) return;

    const formData = this.prepareFormData();
    this.productService.updateProduct(this.productId!, formData).subscribe({
      next: () => {
        alert('Product updated successfully!');
        this.router.navigate(['/product']);
      },
      error: (err) => {
        console.error('Error updating product:', err);
        alert('Failed to update product. Please try again later.');
      }
    });
  }

  private preparePayload(): ProductDTO {
    return {
      name: this.newProduct.name.trim(),
      description: this.newProduct.description?.trim() || '',
      brand: this.newProduct.brand,
      size: Number(this.newProduct.size),
      weight: Number(this.newProduct.wieght),
      handsColor: this.newProduct.handsColor,
      backgroundColor: this.newProduct.backgroundColor,
      bandColor: this.newProduct.bandColor,
      numberingFormat: this.newProduct.numberingType,
      bandMaterial: this.newProduct.bandMaterial,
      caseMaterial: this.newProduct.caseMaterial,
      displayType: this.newProduct.displayType,
      shape: this.newProduct.shape,
     includesDate: this.newProduct.includesDate ?? false,
hasFullNumerals: this.newProduct.hasFullNumerals ?? false,
hasTickingSound: this.newProduct.hasTickingSound ?? false,
waterProof: this.newProduct.waterProof ?? false,

      changeableBand: this.newProduct.changeableBand ?? true,
      price: Number(this.newProduct.price),
      quantity: Number(this.newProduct.quantity),
    };
  }
prepareFormData(): FormData {
  const formData = new FormData();

  formData.append('name', this.newProduct.name.trim());
  formData.append('description', this.newProduct.description?.trim() || '');
  formData.append('brand', this.newProduct.brand);
  formData.append('size', this.newProduct.size.toString());
  formData.append('weight', this.newProduct.wieght.toString());
  formData.append('price', this.newProduct.price.toString());
  formData.append('quantity', this.newProduct.quantity.toString());
  formData.append('handsColor', this.newProduct.handsColor);
  formData.append('backgroundColor', this.newProduct.backgroundColor);
  formData.append('bandColor', this.newProduct.bandColor);
  formData.append('numberingFormat', this.newProduct.numberingType);
  formData.append('bandMaterial', this.newProduct.bandMaterial);
  formData.append('caseMaterial', this.newProduct.caseMaterial);
  formData.append('displayType', this.newProduct.displayType);
  formData.append('shape', this.newProduct.shape);
  formData.append('changeableBand', this.newProduct.changeableBand ? 'true' : 'false');
  formData.append('includesDate', this.newProduct.includesDate ? 'true' : 'false');
  formData.append('hasFullNumerals', this.newProduct.hasFullNumerals ? 'true' : 'false');
  formData.append('hasTickingSound', this.newProduct.hasTickingSound ? 'true' : 'false');
  formData.append('waterProof', this.newProduct.waterProof ? 'true' : 'false');

  // Append files
  this.imageFiles.forEach(file => {
    if (file) {
      formData.append('images', file);
    }
  });

  return formData;
}


  resetNewProduct(): void {
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
  // Allow numbers and at most one dot
allowNumbersAndDot(event: KeyboardEvent, currentValue: any) {
  const char = event.key;
  // Allow control keys
  if (['Backspace', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(char)) return;
  
  // Only one dot allowed
  if (char === '.' && String(currentValue).includes('.')) {
    event.preventDefault();
    return;
  }

  // Allow digits
  if (!/\d/.test(char) && char !== '.') {
    event.preventDefault();
  }
}

// Allow only digits (for quantity)
allowOnlyNumbers(event: KeyboardEvent) {
  const char = event.key;
  if (['Backspace', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(char)) return;
  if (!/\d/.test(char)) {
    event.preventDefault();
  }
}
}

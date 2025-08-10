import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-edit-product',
  templateUrl: './edit-product.component.html',
  styleUrls: ['./edit-product.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule]
})
export class EditProductComponent implements OnInit {
  editedProduct: any = {
    name: '',
    price: 0,
    quantity: 0,
    images: ['', '', '', '', ''],  // Always 5 images
    description: '',
    brand: '',
    waterProof: 'No',
    includesDate: 'No',
    numberingType: '',
    hasFullNumerals: 'No',
    hasTickingSound: 'No',
    size: '',
    wieght: '',
    bandColor: '',
    handsColor: '',
    backgroundColor: '',
    bandMaterial: '',
    caseMaterial: '',
    displayType: '',
    shape: ''
  };

  originalProductName: string = '';

  constructor(private route: ActivatedRoute, private router: Router) {}

  ngOnInit(): void {
    const productName = decodeURIComponent(this.route.snapshot.paramMap.get('name') || '');
    const storedProducts = JSON.parse(localStorage.getItem('products') || '[]');
    const found = storedProducts.find((p: any) => (p.name || '').toLowerCase() === productName.toLowerCase());

    if (found) {
      this.originalProductName = found.name;
      // Deep clone so form edits don't mutate original array directly
      this.editedProduct = JSON.parse(JSON.stringify(found));

      // Ensure images array exists and length is 5 (pad with empty strings)
      if (!Array.isArray(this.editedProduct.images)) {
        this.editedProduct.images = ['', '', '', '', ''];
      } else {
        while (this.editedProduct.images.length < 5) {
          this.editedProduct.images.push('');
        }
      }

      // Normalize radio button fields to 'Yes'/'No' strings for binding
      this.normalizeRadioFields();

    } else {
      alert('Product not found.');
      this.router.navigate(['/product']);
    }
  }

  normalizeRadioFields() {
    const radios = ['waterProof', 'includesDate', 'hasFullNumerals', 'hasTickingSound'];
    radios.forEach(field => {
      if (typeof this.editedProduct[field] === 'boolean') {
        this.editedProduct[field] = this.editedProduct[field] ? 'Yes' : 'No';
      } else if (this.editedProduct[field] !== 'Yes' && this.editedProduct[field] !== 'No') {
        this.editedProduct[field] = 'No'; // Default fallback
      }
    });
  }

  updateProduct() {
    // Validate required fields
    if (!this.editedProduct.name?.trim()) {
      alert('Product name is required.');
      return;
    }

    if (this.editedProduct.images.some((img: string) => !img.trim())) {
      alert('All 5 image URLs are required.');
      return;
    }

    if (!(this.editedProduct.price > 0)) {
      alert('Price must be a positive number.');
      return;
    }

    if (!Number.isInteger(this.editedProduct.quantity) || this.editedProduct.quantity < 0) {
      alert('Quantity must be a non-negative integer.');
      return;
    }

    const sizeNum = parseFloat(this.editedProduct.size);
    if (!(sizeNum > 0)) {
      alert('Size must be a positive number.');
      return;
    }
    const weightNum = parseFloat(this.editedProduct.wieght);
    if (!(weightNum > 0)) {
      alert('Weight must be a positive number.');
      return;
    }

    // Load all products
    const storedProducts = JSON.parse(localStorage.getItem('products') || '[]');

    // Check if new name duplicates another product's name (case-insensitive), except current
    const nameExists = storedProducts.some((p: any) =>
      p.name.toLowerCase() === this.editedProduct.name.trim().toLowerCase() &&
      p.name !== this.originalProductName
    );

    if (nameExists) {
      alert('A product with this name already exists.');
      return;
    }

    // Check if any image URL duplicates another product's images (excluding current product)
    const imagesTrimmed = this.editedProduct.images.map((img: string) => img.trim());
    const imageExists = storedProducts.some((p: any) =>
      p.name !== this.originalProductName &&
      p.images.some((img: string) => imagesTrimmed.includes(img.trim()))
    );

    if (imageExists) {
      alert('One or more image URLs are already used in another product.');
      return;
    }

    // Find index of product to update
    const index = storedProducts.findIndex((p: any) => p.name === this.originalProductName);
    if (index === -1) {
      alert('Original product not found in storage.');
      return;
    }

    // Assign trimmed images back
    this.editedProduct.images = imagesTrimmed;

    // Save updated product
    storedProducts[index] = this.editedProduct;
    localStorage.setItem('products', JSON.stringify(storedProducts));

    alert('Product updated successfully!');
    this.router.navigate(['/product']);
  }

  cancelEdit() {
    if (confirm('Discard changes?')) {
      this.router.navigate(['/product']);
    }
  }

  deleteProduct() {
    if (confirm('Are you sure you want to delete this product?')) {
      const storedProducts = JSON.parse(localStorage.getItem('products') || '[]');
      const filtered = storedProducts.filter((p: any) => p.name !== this.originalProductName);
      localStorage.setItem('products', JSON.stringify(filtered));
      alert('Product deleted.');
      this.router.navigate(['/product']);
    }
  }

  goToProductPage() {
    this.router.navigate(['/product']);
  }
}

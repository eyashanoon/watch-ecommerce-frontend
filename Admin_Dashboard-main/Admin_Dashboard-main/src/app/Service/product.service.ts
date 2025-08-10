import { Injectable } from '@angular/core';

export interface Product {
  name: string;
  price: number;
  quantity: number;
  images: string[]; // Multiple images supported
  description: string;
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
  editMode: boolean;
  showDetails: boolean;
  currentImageIndex?: number; // For carousel tracking
  selectedQty?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private localStorageKey = 'products';

  constructor() {
    // Fix old data before adding defaults
    this.migrateOldData();
    this.initializeProducts();
  }

  /** 🔹 One-time migration to fix old single-image products */
  private migrateOldData() {
    const data = localStorage.getItem(this.localStorageKey);
    if (!data) return;

    let products: Product[] = JSON.parse(data);
    let updated = false;

    products = products.map(product => {
      // Convert old "image" field to "images" array
      if (!Array.isArray(product.images)) {
        product.images = (product as any).image ? [(product as any).image] : [];
        delete (product as any).image;
        updated = true;
      }
      // Always ensure currentImageIndex exists
      if (product.currentImageIndex == null) {
        product.currentImageIndex = 0;
        updated = true;
      }
      return product;
    });

    if (updated) {
      localStorage.setItem(this.localStorageKey, JSON.stringify(products));
    }
  }

  /** 🔹 Initialize default products if localStorage is empty */
  private initializeProducts() {
    const existing = localStorage.getItem(this.localStorageKey);
    if (!existing) {
      const defaultProducts: Product[] = [
        {
          name: 'Heartlander – Prairie Green',
          description: '38 mm automatic field watch.',
          images: [
            'assets/green.png',
            'assets/black_gold.png',
            'assets/black.png',
            'assets/blue_crimson.png',
            'assets/chrono-diver-black-modern-rp.jpg'
          ],
          price: 575,
          displayType: 'dial',
          quantity: 20,
          brand: 'Rolex',
          size: 38,
          waterProof: true,
          includesDate: true,
          numberingType: 'English',
          hasFullNumerals: true,
          hasTickingSound: true,
          wieght: 32,
          bandColor: 'black',
          handsColor: 'white',
          backgroundColor: 'black',
          bandMaterial: 'leather',
          caseMaterial: 'crystal',
          shape: 'round',
          changeableBand: true,
          editMode: false,
          showDetails: false,
          currentImageIndex: 0
        },
        {
          name: 'Heartlander – Autumn Rust',
          description: 'Warm rust-tone dial.',
          images: [
            'assets/rust.png',
             'assets/black_gold.png',
            'assets/black.png',
            'assets/blue_crimson.png',
            'assets/chrono-diver-black-modern-rp.jpg'
          ],
          price: 575,
          displayType: 'dial',
          quantity: 10,
          brand: 'Dryden',
          size: 38,
          waterProof: true,
          includesDate: true,
          numberingType: 'English',
          hasFullNumerals: true,
          hasTickingSound: true,
          wieght: 32,
          bandColor: 'black',
          handsColor: 'black',
          backgroundColor: 'black',
          bandMaterial: 'leather',
          caseMaterial: 'crystal',
          shape: 'round',
          changeableBand: true,
          editMode: false,
          showDetails: false,
          currentImageIndex: 0
        },
        {
          name: 'Heartlander – Blue Sunburst',
          description: 'Bold sunburst blue dial.',
          images: [
            'assets/blue.png',
            'assets/chrono-diver-black-modern-rp.jpg',
            'assets/chrono-diver-black-vintage.jpg',
            'assets/blue-3.png',
            'assets/blue-4.png'
          ],
          price: 575,
          displayType: 'dial',
          quantity: 15,
          brand: 'Dryden',
          size: 38,
          waterProof: true,
          includesDate: true,
          numberingType: 'English',
          hasFullNumerals: true,
          hasTickingSound: true,
          wieght: 32,
          bandColor: 'black',
          handsColor: 'black',
          backgroundColor: 'black',
          bandMaterial: 'leather',
          caseMaterial: 'crystal',
          shape: 'round',
          changeableBand: true,
          editMode: false,
          showDetails: false,
          currentImageIndex: 0
        }
      ];

      localStorage.setItem(this.localStorageKey, JSON.stringify(defaultProducts));
    }
  }

  /** 🔹 Get all products */
  getProducts(): Product[] {
    const data = localStorage.getItem(this.localStorageKey);
    return data ? JSON.parse(data) : [];
  }

  /** 🔹 Save products back to localStorage */
  saveProducts(products: Product[]) {
    localStorage.setItem(this.localStorageKey, JSON.stringify(products));
  }
}

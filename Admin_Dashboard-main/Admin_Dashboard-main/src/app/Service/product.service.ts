import { Injectable } from '@angular/core';

export interface Product {
  name: string;
  price: number;
  quantity: number;
  images: string[]; // Changed from single image to array
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
  selectedQty?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private localStorageKey = 'products';

  constructor() {
    this.initializeProducts();
  }

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
          showDetails: false
        },
        {
          name: 'Heartlander – Autumn Rust',
          description: 'Warm rust-tone dial.',
          images: [
            'assets/rust.png',
            'assets/rust-1.png',
            'assets/rust-2.png',
            'assets/rust-3.png',
            'assets/rust-4.png'
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
          showDetails: false
        },
        {
          name: 'Heartlander – Blue Sunburst',
          description: 'Bold sunburst blue dial.',
          images: [
            'assets/blue.png',
            'assets/blue-1.png',
            'assets/blue-2.png',
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
          showDetails: false
        }
        // Add more updated products similarly...
      ];

      localStorage.setItem(this.localStorageKey, JSON.stringify(defaultProducts));
    }
  }

  getProducts(): Product[] {
    const data = localStorage.getItem(this.localStorageKey);
    return data ? JSON.parse(data) : [];
  }

  saveProducts(products: Product[]) {
    localStorage.setItem(this.localStorageKey, JSON.stringify(products));
  }
}

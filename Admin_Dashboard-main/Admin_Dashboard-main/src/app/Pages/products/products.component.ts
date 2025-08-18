import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
 import { ProductService1} from '../../Service/product1.service';
import { ProductService} from '../../Service/product.service';
import { AuthService } from '../../Service/auth.service';


import { NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import {ImageService } from '../../Service/image.service';
import {FeaturesService , ColorsResponse} from '../../Service/features.service';

import {Image } from '../../models/Image.model';
import {Product , ProductWithImages } from '../../models/product.model';
import {forkJoin, map, switchMap, Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

 

type Filters = {
  maxPrice: number;
  maxQuantity: number;
  maxWeight: number;
  maxSize: number;
  waterProof: boolean;
  includesDate: boolean;
  hasFullNumerals: boolean;
  hasTickingSound: boolean;
  displayType: string;
  bandColor: string;
  handsColor: string;
  backgroundColor: string;
  bandMaterial: string;
  caseMaterial: string;
  brand: string;
  numberingType: string;
  shape: string;
  changeableBand: boolean;
    minPrice?: number;
  minWeight?: number;
  minSize?: number;
  name: string;
};


@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.css']
})



export class ProductsComponent implements OnInit {
   constructor(private router: Router,
     private productService: ProductService,
     private productService1: ProductService1,
     private imageService:ImageService,
      private featuresService:FeaturesService,
     private authService: AuthService
    ) {}
 


  product: any[] = [];

  productMap = new Map<number, { product: Product, images: Image[],currentImageIndex:number }>();

  searchText: string = '';
  originalProduct: any = null;
  showAddForm = false;
  sidebarVisible = false;
 

  filters: Filters = {
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
    name:'',

  };

 defaultFilters: Filters = {
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
  name:'',
};
    private filterChange$ = new Subject<Filters>();

  onFiltersChanged() {
    this.filterChange$.next({ ...this.filters }); // emit new filters
  }

  // maps frontend Filters → backend ProductQueryObject
 mapFiltersToBackend(filters: Filters) {
  return {
    maxPrice: filters.maxPrice,
    minPrice: filters['minPrice'] ?? 1, // optional min
    maxWeight: filters.maxWeight,
    minWeight: filters['minWeight'] ?? 1,
    maxSize: filters.maxSize,
    minSize: filters['minSize'] ?? 1,
    waterProof: filters.waterProof,
    includesDate: filters.includesDate,
    hasFullNumerals: filters.hasFullNumerals,
    hasTickingSound: filters.hasTickingSound,
    displayType: filters.displayType,
    bandMaterial: filters.bandMaterial,
    caseMaterial: filters.caseMaterial,
    brand: filters.brand,
    shape: filters.shape,
    changeableBand: filters.changeableBand,
    numberingFormat: filters.numberingType // rename here
  };
}

 mapFiltersToBackend1(filters: Filters) {
  const backendFilters: any = {};

  // Map frontend -> backend
  const fieldMap: Record<string, string> = {
    maxPrice: 'maxPrice',
    maxWeight: 'maxWeight',
    maxSize: 'maxSize',
    waterProof: 'waterProof',
    includesDate: 'includesDate',
    hasFullNumerals: 'hasFullNumerals',
    hasTickingSound: 'hasTickingSound',
    displayType: 'displayType',
    bandMaterial: 'bandMaterial',
    caseMaterial: 'caseMaterial',
    brand: 'brand',
    numberingType: 'numberingFormat', // frontend -> backend
    shape: 'shape',
    changeableBand: 'changeableBand',
    // min values: only include if max value changed
    minPrice: 'minPrice',
    minWeight: 'minWeight',
    minSize: 'minSize',
  };

  for (const key in filters) {
    if (filters[key as keyof Filters] !== this.defaultFilters[key as keyof Filters]) {
      const backendKey = fieldMap[key] || key;
      backendFilters[backendKey] = filters[key as keyof Filters];
    }
  }

  // Set min values if max is customized
  if (filters.maxPrice !== this.defaultFilters.maxPrice) backendFilters.minPrice = 0;
  if (filters.maxWeight !== this.defaultFilters.maxWeight) backendFilters.minWeight = 0;
  if (filters.maxSize !== this.defaultFilters.maxSize) backendFilters.minSize = 0;

  return backendFilters;
}

  getFilteredProducts(filters: Filters) {
    this.loadProducts();

}

 

  availableColors: string[] = [];
   bandColors: string[] = [];

  handsColors: string[] = [];

  backgroundColors  : string[] = [];

 
  availableBrands  : string[] = [];

  bandMaterials: string[] = [];

  caseMaterials: string[] = [];
  displayTypes: string[] = [];
  numberingTypes: string[] = [];
  shapes: string[] = [];
  canAddProduct = false;

 
ngOnInit(): void {
this.filterChange$
      .pipe(debounceTime(300)) // waits 300ms after last change
      .subscribe(filters => {
        this.getFilteredProducts(filters);
      });

this.featuresService.getAllColors().subscribe((colorsObj : ColorsResponse) => {


  this.handsColors = colorsObj.Hands.map(c => c.trim());
  this.backgroundColors = colorsObj.Background.map(c => c.trim());
  this.bandColors = colorsObj.Band.map(c => c.trim());
  this.availableColors = Array.from(
    new Set(
      Object.values(colorsObj)   // Get the arrays from hands, background, band
        .flat()                  // Flatten into one array
        .map(c => c.trim())      // Remove extra spaces
    )
  );
});

  this.featuresService.getAllBrands().subscribe(brands =>{
   this.availableBrands=brands;
  });
  this.featuresService.getAllBands().subscribe(band=>{
    this.bandMaterials=band;
   });
  this.featuresService.getAllCases().subscribe(cases=>{
    this.caseMaterials=cases;
  });
  this.featuresService.getAllDisplay_types().subscribe(DisplayTypes=>{
    this.displayTypes=DisplayTypes;
   });
  this.featuresService.getAllNumbering_formats().subscribe(numberingTypes=>{
    this.numberingTypes=numberingTypes;
   });
  this.featuresService.getAllShapes().subscribe(shapes=>{
    this.shapes=shapes;
    console.log(shapes);
  });



  this.loadProducts();

  this.router.events
    .pipe(filter(event => event instanceof NavigationEnd))
    .subscribe(() => {
      this.loadProducts();
    });
  const roles = this.authService.getUserRoles(); // Example: ['ADMIN'] or ['CUSTOMER']
  this.canAddProduct = roles.includes('ADMIN'); // Only admins can add products

}


loadProducts() {
 
  const backendFilters = this.mapFiltersToBackend1(this.filters);
  console.log(backendFilters)
  this.productMap.clear();
console.log(this.filters);
  this.productService1.getAllProducts(backendFilters).pipe(
     switchMap(page => {   // page is the Page<Product> object
      const products = page.content;   // <-- extract the array
 
      const requests = products.map(product =>
        this.imageService.getAllImagesByProductID(product.id).pipe(
          map(images => ({
            product,
            images,
            currentImageIndex: 0
          }))
        )
      );
      return forkJoin(requests);
    })
  ).subscribe(results => {
     results.forEach(({ product, images, currentImageIndex }) => {
      this.productMap.set(product.id, { product, images, currentImageIndex });
    });
 
  });
}



get productsWithImages() {
  return Array.from(this.productMap.values()).map(item => ({
    ...item.product,
    images: item.images.map(img => 'data:image/jpeg;base64,' + img.data),
    currentImageIndex: item.currentImageIndex
  }));
}
positions: { [productId: number]: number } = {};



scrollLeft(product: ProductWithImages , event?: MouseEvent) {
    if (event) {
    event.stopPropagation();
    console.log(this.availableColors);

  }

   if (!this.positions[product.id] ) {
    this.positions[product.id] = 0;
  }

  if (this.positions[product.id] >=0 ) {
    // If already at the last image, wrap to the start
    this.positions[product.id] = -(product.images.length - 1) * 100;
  } else {
    this.positions[product.id] += 100;
  }
}


// Called when right arrow clicked
scrollRight(product: ProductWithImages, event?: MouseEvent) {
    if (event) {
    event.stopPropagation();
  }
  if (!this.positions[product.id] ) {
    this.positions[product.id] = 0;
   }
   if(this.positions[product.id] <= -((product.images.length - 1) * 100)){
        this.positions[product.id] = 0;
   }
  else this.positions[product.id] -= 100;
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
goToProductDetails(product: any): void {
  const encodedName = encodeURIComponent(product.name);
  const roles = this.authService.getUserRoles();
  const isLoggedIn = this.authService.isLoggedIn();

  if (isLoggedIn && roles.includes('ADMIN')) {
    // Admin goes to admin product details
    this.router.navigate(['/admin-product', encodedName], { state: { product } });
  } else {
    // Customer or guest goes to normal product details
    this.router.navigate(['/product', encodedName], { state: { product } });
  }
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


  stopCarousel(product: any) {
    if (product.carouselInterval) {
      clearInterval(product.carouselInterval);
      product.carouselInterval = null;
    }
  }
 
doNothing(event: Event) {
  event.stopPropagation();
}








}

 

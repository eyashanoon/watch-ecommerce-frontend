import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
 import { ProductService1} from '../../Service/product1.service';
import { ProductService} from '../../Service/product.service';
import { AuthService } from '../../Service/auth.service';
import { CartService } from '../../Service/cart.service';
import { WishlistService } from '../../Service/wishlist.service';
import { CartDto } from '../../models/cart.model';
import { WishlistDto } from '../../models/wishlist.model';


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
cartProductIds: Set<number> = new Set();

toastMessage: string = '';
showToast: boolean = false;
private toastTimeout: any; // prevents duplicate toasts

// inside the class:
myWishlistIds: Set<number> = new Set();
wishlistLoaded = false;
flag: boolean = false;
selectedQuantity: number = 1; // for cart

constructor(
  private router: Router,
  private productService: ProductService,
  private productService1: ProductService1,
  private imageService: ImageService,
  private featuresService: FeaturesService,
public authService: AuthService,
  private cartService: CartService,
  private wishlistService: WishlistService
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
   // this.filterChange$.next({ ...this.filters }); // emit new filters
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

justAddedToCartSet: Set<number> = new Set();
justAddedToWishlistSet: Set<number> = new Set();

showToastMessage(message: string) {
  // Clear previous toast if still active
  if (this.toastTimeout) {
    clearTimeout(this.toastTimeout);
  }

  this.toastMessage = message;
  this.showToast = true;

  // Hide toast after 5 seconds
  this.toastTimeout = setTimeout(() => {
    this.showToast = false;
    this.toastTimeout = null;
  }, 5000);
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

loadCart() {
  if (!this.authService.isLoggedIn()) return;

  this.cartService.getMyCart().subscribe({
    next: (cart: CartDto) => {
      // Correctly use 'items' instead of 'products'
      this.cartProductIds = new Set(cart.items.map(item => item.productId));
    },
    error: err => console.error('Failed to load cart', err)
  });
}

ngOnInit(): void {
  this.filterChange$
      .pipe(debounceTime(300))
      .subscribe(filters => {
        this.getFilteredProducts(filters);
      });

  this.featuresService.getAllColors().subscribe((colorsObj : ColorsResponse) => {
    this.handsColors = colorsObj.Hands.map(c => c.trim());
    this.backgroundColors = colorsObj.Background.map(c => c.trim());
    this.bandColors = colorsObj.Band.map(c => c.trim());
    this.loadWishlist();
    this.availableColors = Array.from(
      new Set(Object.values(colorsObj).flat().map(c => c.trim()))
    );
  });

  // ... your other featureService calls ...

  this.loadProducts();

  this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.loadProducts();
      });

  const roles = this.authService.getUserRoles();
  this.canAddProduct = this.authService.hasAnyRole(['CREATE_PRODUCT', 'OWNER']);

  // ✅ Add this:
  this.loadCart();
}



pageIndex: number = 1;


loadProducts() {
  const backendFilters = {

    ...this.mapFiltersToBackend1(this.filters),
    page: this.pageIndex
  };

  this.productMap.clear();

  this.productService1.getAllProducts(backendFilters).subscribe(page => {
    const products = page.content as any[];

    // Step 1: Put products immediately into map
    products.forEach(product => {
      this.productMap.set(product.id, {
        product,
        images: [],
        currentImageIndex: 0
      });
    });

    // Step 2: Build array of observables for images
    const imageRequests = products.map(product =>
      this.imageService.getAllImagesByProductID(product.id)
    );

    // Step 3: Run all in parallel
    forkJoin(imageRequests).subscribe(imagesArray => {
      imagesArray.forEach((images, index) => {
        const product = products[index];
        const current = this.productMap.get(product.id);
        if (current) {
          this.productMap.set(product.id, {
            ...current,
            images
          });
        }
      });
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
      this.showToastMessage("Quantity must be a whole number.");
      return;
    }

    const nameExists = this.product.some(p =>
      p !== product && p.name.trim().toLowerCase() === product.name.trim().toLowerCase()
    );
    if (nameExists) {
      this.showToastMessage("Another product already has this name.");
      return;
    }

    const imageExists = this.product.some(p =>
      p !== product && p.image.trim() === product.image.trim()
    );
    if (imageExists) {
      this.showToastMessage("Another product already has this image URL.");
      return;
    }

    product.editMode = false;
    this.productService.saveProducts(this.product);
  }
  trackByProduct(index: number, product: ProductWithImages): number {
  return product.id; // make sure each product has a unique ID
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
  //const roles = this.authService.getUserRoles();
  //const isLoggedIn = this.authService.isLoggedIn();

  this.router.navigate(['/admin-product', encodedName], { state: { product } });

}


  toggleSidebar() {
    this.sidebarVisible = !this.sidebarVisible;
  }

  goToAddProductPage() {
     this.router.navigate(['/product/add']);

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


nextPage( ){

this.pageIndex++;
this.loadProducts();
  window.scrollTo({ top: 0, behavior: 'smooth' });

}

prePage( ){

this.pageIndex>0?this.pageIndex--:this.pageIndex=0;
this.loadProducts();
  window.scrollTo({ top: 0, behavior: 'smooth' });

}


  

 

resetFilters(){
   this.filters = { ...this.defaultFilters };
  this.pageIndex = 1;
  this.filterChange$.next({ ...this.filters });
  this.loadProducts();
}

FiltrProducts(){
  this.pageIndex=1;
  this.filterChange$.next({ ...this.filters });

}


loadWishlist() {
  if (!this.authService.isLoggedIn()) return;

  this.wishlistService.getMyWishlist().subscribe({
    next: (res: { products: { id: number }[] }) => {
      this.myWishlistIds = new Set(res.products.map(p => Number(p.id)) || []);
      this.wishlistLoaded = true;
    },
    error: err => console.error('Failed to load wishlist', err)
  });
}





// returns true if icon should be highlighted
isCartIconActive(product: ProductWithImages): boolean {
  return product.id ? this.cartProductIds.has(product.id) || this.justAddedToCartSet.has(product.id) : false;
}


addToCart(product: ProductWithImages) {
  if (product.quantity === 0 || !this.authService.isLoggedIn()) return;

  const quantityToAdd = 1; // default

  this.cartService.addToCart([{ productId: product.id, quantity: quantityToAdd }])
    .subscribe({
      next: (res: CartDto) => {
        this.justAddedToCartSet.add(product.id);
        this.cartProductIds.add(product.id);

        // Show single toast
        this.showToastMessage(`🛒 Added to cart (Qty: ${quantityToAdd})`);

        setTimeout(() => this.justAddedToCartSet.delete(product.id), 1500);
      },
      error: err => {
        console.error('Failed to add to cart:', err);
        this.showToastMessage('❌ Failed to add product to cart.');
      }
    });
}




isInWishlist(product: any): boolean {
  return product.id ? this.myWishlistIds.has(product.id) : false;
}
toggleCart(product: Product) {
  const pid = product.id;
  const inCart = this.cartProductIds.has(pid);

  if (inCart) {
    this.cartProductIds.delete(pid);
    this.cartService.removeFromCart([pid]).subscribe({
      next: () => {
        this.showToastMessage('🛒 Product removed from cart');
      },
      error: err => { 
        console.error(err);
        this.cartProductIds.add(pid);
        this.showToastMessage('Failed to remove from cart');
      }
    });
  } else {
    this.cartProductIds.add(pid);
    this.cartService.addToCart([{ productId: pid, quantity: 1 }]).subscribe({
      next: () => {
        this.showToastMessage('🛒 Product added to cart');
      },
      error: err => {
        console.error(err);
        this.cartProductIds.delete(pid);
        this.showToastMessage('Failed to add to cart');
      }
    });
  }
}

toggleWishlist(product: Product) {
  const pid = product.id;
  const inList = this.myWishlistIds.has(pid);

  if (inList) this.myWishlistIds.delete(pid);
  else this.myWishlistIds.add(pid);

  const obs = inList
    ? this.wishlistService.removeFromWishlist([pid])
    : this.wishlistService.addToWishlist([pid]);

  obs.subscribe({
    next: () => {
      const action = inList ? 'removed from' : 'added to';
      this.showToastMessage(`❤️ Product ${action} wishlist`);
    },
    error: err => {
      console.error(err);
      if (inList) this.myWishlistIds.add(pid);
      else this.myWishlistIds.delete(pid);
      this.showToastMessage('Wishlist operation failed.');
    }
  });
}




}



import { Component, QueryList, ViewChildren, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule, NgIf, NgFor } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { switchMap, map } from 'rxjs/operators';

import { ProductService1 } from '../../Service/product1.service';
import { ProductWithImages } from '../../models/product.model';
import { AuthService } from '../../Service/auth.service';
import { ImageService } from '../../Service/image.service';
import { Image } from '../../models/Image.model';
import { WishlistService } from '../../Service/wishlist.service';
import { CartService } from '../../Service/cart.service';
import { CartDto } from '../../models/cart.model';
import { WishlistDto } from '../../models/wishlist.model';
import { RecommendationComponent } from '../../Pages/recommendation/recommendation.component';
import { ActivatedRoute } from '@angular/router';

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

type ClorCombinations = {
  hands: string;
  background: string;
  band: string;
  id: number;
};

@Component({
  selector: 'app-productsDetails',
  standalone: true,
  imports: [CommonModule, FormsModule, NgIf, NgFor, RecommendationComponent],
  templateUrl: './productsDetails.component.html',
  styleUrls: ['./productsDetails.component.css']
})
export class ProductsDetailsComponent implements AfterViewInit {

  // ------------------ View & Carousel ------------------
  @ViewChildren('carouselImg') carouselImages!: QueryList<ElementRef<HTMLImageElement>>;
  currentIndex = 0;
  is3DViewActive = false;
  loadedImages: any[] = [];

  // ------------------ Product & Color ------------------
  products!: ProductWithImages & { selectedQty: number, colorCombinations: ClorCombinations[] };
  productID: number = 0;
  colorCombinations!: ClorCombinations[];

  // ------------------ User State ------------------
  selectedQuantity: number = 1;
  myWishlistIds: Set<number> = new Set();
  myCartIds: Set<number> = new Set();
  isCustomer?: boolean;

  // ------------------ Toast ------------------
  toastMessage: string = '';
  showToast: boolean = false;
  private toastTimeout: any;

  // ------------------ Wishlist Flag ------------------
  wishlistLoaded = false;
  flag: boolean = false;
  flagCart: boolean = false;

  constructor(
      private route: ActivatedRoute, // <-- add this
    private router: Router,
    private productService: ProductService1,
    public authService: AuthService,
    private imageService: ImageService,
    private wishlistService: WishlistService,
    private cartService: CartService
  ) {
    const nav = this.router.getCurrentNavigation();
    const stateProduct = nav?.extras?.state?.['product'];
    if (!stateProduct) {
      this.router.navigate(['/']);
      return;
    }

    this.productID = stateProduct.id;
    this.loadProduct(this.productID);
    this.loadProductImages(this.productID);
    this.loadWishlist();
    this.loadCart();
    this.isCustomer = this.authService.getUserRoles().includes("CUSTOMER");
  }
ngOnInit(): void {
  this.route.params.subscribe(params => {
    const productName = params['name']; // read the URL param

    // Try to get the product from the navigation state first
    const navProduct = history.state.product;
    if (navProduct && navProduct.name === productName) {
      this.loadCurrentProduct(navProduct);
    } else {
      // Fallback: fetch product by name from your API
      this.productService.getProductByName(productName).subscribe(products => {
        if (products.length > 0) this.loadCurrentProduct(products[0]);
      });
    }
  });
}
loadCurrentProduct(product: ProductWithImages & { selectedQty: number ;colorCombinations: ClorCombinations[] }) {
  // Set the current product
  this.products = product;

  // Update product ID
  this.productID = product.id;

  // Reload images, wishlist, and cart
  this.loadProductImages(this.productID);
  this.loadWishlist();
  this.loadCart();
}

  // ------------------ Product Loading ------------------
  loadProductImages(productId: number): void {
    this.imageService.getAllImagesByProductID(productId).subscribe({
      next: (images: Image[]) => {
        this.loadedImages = images.map(img => 'data:image/jpeg;base64,' + img.data);
        console.log(this.loadedImages);
      },
      error: (err) => console.error('Failed to load images', err)
    });
  }

  loadProduct(productId: number): void {
    this.productService.getProductById(productId).pipe(
      switchMap((pro: ProductWithImages & { selectedQty: number }) =>
        this.productService.getProductByName(pro.name).pipe(
          map((pros: ProductWithImages[]) => {
            const colorCombinations = pros.map(p => ({
              hands: p.handsColor,
              background: p.backgroundColor,
              band: p.bandColor,
              id: p.id
            }));
            return { ...pro, colorCombinations };
          })
        )
      )
    ).subscribe({
      next: (product) => {
        this.products = product;
        console.log(this.products);
        this.loadWishlist();
        this.loadCart();
        console.log('Loaded product:', this.flagCart);
      },
      error: (err) => console.error('Failed to load product', err)
    });
  }

  changeWatchColor(combo: ClorCombinations) {
    this.loadProduct(combo.id);
    this.loadProductImages(combo.id);
    this.productService.getProductById(combo.id).pipe(
      switchMap(product => this.productService.getProductByName(product.name).pipe(
        map(products => {
          const colorCombinations = products.map(p => ({
            hands: p.handsColor,
            background: p.backgroundColor,
            band: p.bandColor,
            id: p.id
          }));
          return { ...product, colorCombinations };
        })
      ))
    ).subscribe({
      next: (product) => {
        this.products = product;
        console.log('Changed watch:', this.products);
      },
      error: err => console.error('Failed to load watch', err)
    });
  }

  // ------------------ 3D Carousel ------------------
  ngAfterViewInit() {
    if (this.is3DViewActive) this.update3DCarousel();
    this.carouselImages.changes.subscribe(() => {
      if (this.is3DViewActive) this.update3DCarousel();
    });
  }

  update3DCarousel() {
    if (!this.loadedImages?.length) return;
    const total = this.loadedImages.length;
    const angle = 360 / total;
    const radius = 400;
    this.carouselImages.forEach((imgRef, i) => {
      const rotation = angle * i - angle * this.currentIndex;
      const el = imgRef.nativeElement;
      el.style.transform = `rotateY(${rotation}deg) translateZ(${radius}px)`;
      el.style.opacity = '1';
    });
  }

  nextImage() {
    this.currentIndex = (this.currentIndex + 1) % this.loadedImages.length;
    if (this.is3DViewActive) this.update3DCarousel();
  }

  prevImage() {
    this.currentIndex = (this.currentIndex - 1 + this.loadedImages.length) % this.loadedImages.length;
    if (this.is3DViewActive) this.update3DCarousel();
  }

  toggle3DView() {
    this.is3DViewActive = !this.is3DViewActive;
    setTimeout(() => this.update3DCarousel(), 50);
  }

  selectImage(index: number) {
    this.currentIndex = index;
  }

  // ------------------ Role & Auth ------------------
  hasRole(role: string): boolean {
    const roles = this.authService.getUserRoles();
    const normalize = (r: string) => r.toUpperCase().replace('-', '_');
    return roles.some(r => normalize(r) === normalize(role));
  }

  signOut() {
    console.log('Sign out');
  }

  goToHomePage() {
    this.router.navigate(['/product']);
  }

  // ------------------ Product Actions ------------------
  editProduct() {
    const encoded = encodeURIComponent(this.products.id);
    this.router.navigate(['/product/edit', encoded]);
  }

  deleteProduct() {
    if (!this.products?.id) return;
    if (!confirm(`Are you sure you want to delete ${this.products.name}?`)) return;
    this.productService.deleteProduct(this.products.id).subscribe({
      next: () => {
        this.showToastMessage('Product deleted successfully.');
        this.router.navigate(['/product']);
      },
      error: err => {
        console.error('Failed to delete product', err);
        this.showToastMessage('Failed to delete product. See console for details.');
      }
    });
  }

  // ------------------ Quantity Selector ------------------
  increaseQty() {
    if (this.selectedQuantity < this.products.quantity) this.selectedQuantity++;
  }

  decreaseQty() {
    if (this.selectedQuantity > 1) this.selectedQuantity--;
  }

  // ------------------ Cart ------------------
  loadCart() {

    if (!this.authService.isLoggedIn()) return;
    this.cartService.getMyCart().subscribe({
      next: (res: any) => {
        console.log('Cart response:', res);
        this.myCartIds = new Set(res.items.map((p: any) => Number(p.productId)));
        console.log('Loaded cart IDs:', this.myCartIds, this.productID);
                console.log("Lo",this.productID);

        this.flagCart = this.products?.id ? this.myCartIds.has(this.products.id) : false;

      },
      error: err => console.error('Failed to load cart', err)

    }

     );
  }

toggleCart(product: ProductWithImages & { selectedQty: number }) {
  if (product.quantity === 0) return;
  const pid = product.id;
  const inCart = this.myCartIds.has(pid);

  // Optimistically update the UI
  if (inCart) {
    this.myCartIds.delete(pid);
  } else {
    const quantity = this.selectedQuantity || 1;
    this.myCartIds.add(pid);
  }

  // Update the flag for the icon immediately
  this.flagCart = this.products?.id ? this.myCartIds.has(this.products.id) : false;

  // Call backend
  const obs = inCart
    ? this.cartService.removeFromCart([pid])
    : this.cartService.addToCart([{ productId: pid, quantity: this.selectedQuantity || 1 }]);

  obs.subscribe({
    next: () => {
      const msg = inCart ? '🛒 Removed from cart' : `🛒 Added to cart (Qty: ${this.selectedQuantity})`;
      this.showToastMessage(msg);
    },
    error: (err) => {
      console.error(err);
      // Revert the optimistic change if backend fails
      if (inCart) {
        this.myCartIds.add(pid);
      } else {
        this.myCartIds.delete(pid);
      }
      this.flagCart = this.products?.id ? this.myCartIds.has(this.products.id) : false;
      this.showToastMessage('❌ Cart operation failed');
    }
  });
}


  // ------------------ Wishlist ------------------
  loadWishlist() {
    if (!this.authService.isLoggedIn()) return;
    this.wishlistService.getMyWishlist().subscribe({
      next: (res: { products: { id: number }[] }) => {
        this.myWishlistIds = new Set(res.products.map(it => Number(it.id)) || []);
        console.log('Loaded wishlist IDs:', this.myWishlistIds);
        this.wishlistLoaded = true;
        this.flag = this.products?.id ? this.myWishlistIds.has(this.products.id) : false;
      },
      error: err => console.error('Failed to load wishlist', err)
    });
  }

  toggleWishlist() {
    if (this.products?.quantity === 0 || !this.products?.id || !this.authService.isLoggedIn()) return;
    const pid = Number(this.products.id);
    const inList = this.myWishlistIds.has(pid);

    if (inList) this.myWishlistIds.delete(pid);
    else this.myWishlistIds.add(pid);

    const obs = inList ? this.wishlistService.removeFromWishlist([pid]) : this.wishlistService.addToWishlist([pid]);
    obs.subscribe({
      next: () => {
        const action = inList ? 'removed from' : 'added to';
        this.showToastMessage(`❤️ Product ${action} wishlist`);
        console.log(`Wishlist updated: ${inList ? 'removed' : 'added'} product ${pid}`);
      },
      error: err => {
        console.error('Wishlist operation failed', err);
        if (inList) this.myWishlistIds.add(pid);
        else this.myWishlistIds.delete(pid);
        this.showToastMessage('❌ Wishlist operation failed.');
      }
    });

    this.flag = this.myWishlistIds.has(pid);

  }

  isInWishlist(): boolean {
    return this.products?.id ? this.myWishlistIds.has(this.products.id) : false;
  }
    isInCart(): boolean {
    return this.products?.id ? this.myCartIds.has(this.products.id) : false;
  }

  // ------------------ Toast ------------------
  showToastMessage(message: string) {
    if (this.toastTimeout) clearTimeout(this.toastTimeout);
    this.toastMessage = message;
    this.showToast = true;
    this.toastTimeout = setTimeout(() => {
      this.showToast = false;
      this.toastTimeout = null;
    }, 5000);
  }

  // ------------------ Helper ------------------
  get productsWithImages(): (ProductWithImages & { selectedQty: number, colorCombinations: ClorCombinations[] })[] {
    if (!this.products || this.products.quantity === 0) return [];
    return [this.products];
  }

}

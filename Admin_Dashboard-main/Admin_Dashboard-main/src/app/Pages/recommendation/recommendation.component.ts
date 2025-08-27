import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { forkJoin } from 'rxjs';

import { RecommendationService, Recommendation } from '../../Service/recommendation.service';
import { ProductService1 } from '../../Service/product1.service';
import { ImageService } from '../../Service/image.service';
import { Product, ProductWithImages } from '../../models/product.model';
import { Image } from '../../models/Image.model';
import { CartService } from '../../Service/cart.service';
import { WishlistService } from '../../Service/wishlist.service';
import { AuthService } from '../../Service/auth.service';
import { CartDto } from '../../models/cart.model';

@Component({
  selector: 'app-recommendation',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './recommendation.component.html',
  styleUrls: ['./recommendation.component.css']
})
export class RecommendationComponent implements OnInit {

  productMap = new Map<number, { product: Product, images: Image[], currentImageIndex: number }>();
  visibleStartIndex = 0;
  loading: boolean = false;

  // ✅ updated to Sets for consistency
  cartProductIds: Set<number> = new Set();
  myWishlistIds: Set<number> = new Set();
  wishlistLoaded = false;

  // ✅ toast system
  toastMessage: string = '';
  showToast: boolean = false;
  private toastTimeout: any;

  justAddedToCartSet: Set<number> = new Set();
  justAddedToWishlistSet: Set<number> = new Set();

  constructor(
    private router: Router,
    private recommendationService: RecommendationService,
    private productService1: ProductService1,
    private imageService: ImageService,
    private cartService: CartService,
    private wishlistService: WishlistService,
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadRecommendedProducts();
    if (this.authService.isLoggedIn()) {
      this.loadCart();
      this.loadWishlist();
    }
  }

  // ✅ Toast message
  showToastMessage(message: string) {
    if (this.toastTimeout) clearTimeout(this.toastTimeout);

    this.toastMessage = message;
    this.showToast = true;

    this.toastTimeout = setTimeout(() => {
      this.showToast = false;
      this.toastTimeout = null;
    }, 5000);
  }

  // ✅ Load cart
  loadCart() {
    this.cartService.getMyCart().subscribe({
      next: (cart: CartDto) => {
        this.cartProductIds = new Set(cart.items.map(item => item.productId));
      },
      error: err => console.error('Failed to load cart', err)
    });
  }

  // ✅ Load wishlist
  loadWishlist() {
    this.wishlistService.getMyWishlist().subscribe({
      next: (res: { products: { id: number }[] }) => {
        this.myWishlistIds = new Set(res.products.map(p => Number(p.id)) || []);
        this.wishlistLoaded = true;
      },
      error: err => console.error('Failed to load wishlist', err)
    });
  }

  // ✅ Cart/Wishlist toggling logic copied from ProductsComponent
  isCartIconActive(product: ProductWithImages): boolean {
    return product.id ? this.cartProductIds.has(product.id) || this.justAddedToCartSet.has(product.id) : false;
  }

  toggleCart(product: Product) {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }

    const pid = product.id;
    const inCart = this.cartProductIds.has(pid);

    if (inCart) {
      this.cartProductIds.delete(pid);
      this.cartService.removeFromCart([pid]).subscribe({
        next: () => this.showToastMessage('🛒 Product removed from cart'),
        error: err => {
          console.error(err);
          this.cartProductIds.add(pid);
          this.showToastMessage('Failed to remove from cart');
        }
      });
    } else {
      this.cartProductIds.add(pid);
      this.cartService.addToCart([{ productId: pid, quantity: 1 }]).subscribe({
        next: () => this.showToastMessage('🛒 Product added to cart'),
        error: err => {
          console.error(err);
          this.cartProductIds.delete(pid);
          this.showToastMessage('Failed to add to cart');
        }
      });
    }
  }

  isInWishlist(product: any): boolean {
    return product.id ? this.myWishlistIds.has(product.id) : false;
  }

  toggleWishlist(product: Product) {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }

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

  // -------------------- Products & Images --------------------
  loadRecommendedProducts() {
    this.productMap.clear();
    this.loading = true;

    this.recommendationService.getRecommendations().subscribe((recs: Recommendation[]) => {
      if (!recs || recs.length === 0) return;

      const recommendedFive = recs.slice(0, 10);
      recommendedFive.forEach(rec => {
        this.productService1.getProductById(rec.id).subscribe((product: Product) => {
          this.productMap.set(product.id, { product, images: [], currentImageIndex: 0 });
          this.imageService.getAllImagesByProductID(product.id).subscribe((images: Image[]) => {
            const current = this.productMap.get(product.id);
            if (current) this.productMap.set(product.id, { ...current, images });
          });
        });
        this.loading = false;
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

  scrollLeft() {
    if (this.visibleStartIndex > 0) this.visibleStartIndex--;
  }

  scrollRight() {
    if (this.visibleStartIndex < Math.max(0, this.productsWithImages.length - 5)) this.visibleStartIndex++;
  }

  scrollImageLeft(product: ProductWithImages, event?: MouseEvent) {
    if (event) event.stopPropagation();
    const pos = this.productMap.get(product.id)?.currentImageIndex || 0;
    this.productMap.get(product.id)!.currentImageIndex = pos <= 0 ? product.images.length - 1 : pos - 1;
  }

  scrollImageRight(product: ProductWithImages, event?: MouseEvent) {
    if (event) event.stopPropagation();
    const pos = this.productMap.get(product.id)?.currentImageIndex || 0;
    this.productMap.get(product.id)!.currentImageIndex = pos >= product.images.length - 1 ? 0 : pos + 1;
  }

goToProductDetails(product: ProductWithImages): void {
  const encodedName = encodeURIComponent(product.name);

  // Navigate to the product details page
  this.router.navigate(['/admin-product', encodedName], { state: { product } }).then(() => {
    // Scroll to top after navigation
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}


  trackByProduct(index: number, product: ProductWithImages): number {
    return product.id;
  }
}

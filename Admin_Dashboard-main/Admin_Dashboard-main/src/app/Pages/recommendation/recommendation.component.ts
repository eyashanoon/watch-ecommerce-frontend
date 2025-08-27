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
import { ActivatedRoute } from '@angular/router';


@Component({
  selector: 'app-recommendation',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './recommendation.component.html',
  styleUrls: ['./recommendation.component.css']
})
export class RecommendationComponent implements OnInit {

  productMap = new Map<number, { product: Product, images: Image[], currentImageIndex: number }>();
  visibleStartIndex = 0; // index for scrolling 5 products
    cartProductIds: number[] = [];
  wishlistProductIds: number[] = [];
  loading:boolean=false;

  constructor(
    private router: Router,
    private recommendationService: RecommendationService,
    private productService1: ProductService1,
    private imageService: ImageService,
    private cartService: CartService,
    private wishlistService: WishlistService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
 this.loadRecommendedProducts();
// Step 2: Later, load images
     if (this.authService.isLoggedIn()) {
      this.cartService.getMyCart().subscribe(cart => {
        this.cartProductIds = cart.items.map((i: any) => i.product.id);
      });
      this.wishlistService.getMyWishlist().subscribe(wl => {
        this.wishlistProductIds = wl.map((i: any) => i.product.id);
      });
    }
  }
  flagWishlist?:boolean;
  isInwishList(product:any){
    this.wishlistService.getMyWishlist().subscribe({
      next:(res:any[])=>{
        this.flagWishlist=new Set(res.map( w=> w.productId)).has(product.id);
      },
      error:err=>{
        console.log(err);
      }
    })

  }
  flagCart?:boolean;
  isInCart(product:any){
    this.cartService.getMyCart().subscribe({
      next:(res:CartDto)=>{
        this.flagWishlist=new Set(res.items.map( item=> item.productId)).has(product.id);
      },
      error:err=>{
        console.log(err);
      }
    })

  }

loadRecommendedProducts() {
  this.productMap.clear();
  this.loading=true;

  this.recommendationService.getRecommendations().subscribe((recs: Recommendation[]) => {
    if (!recs || recs.length === 0) return;

    // Limit to 5 products
    const recommendedFive = recs.slice(0, 10);

    // Fetch all products in parallel
    recommendedFive.forEach(rec => {
      this.productService1.getProductById(rec.id).subscribe((product: Product) => {
        // Add product to the map immediately
        this.productMap.set(product.id, { product, images: [], currentImageIndex: 0 });

        // Fetch images for this product independently
        this.imageService.getAllImagesByProductID(product.id).subscribe((images: Image[]) => {
          const current = this.productMap.get(product.id);
          if (current) {
            this.productMap.set(product.id, { ...current, images });
          }
        });
      });
      this.loading=false;
    });
  });
}

// -------------------- Load products only --------------------
loadProductsOnly(): void {
  this.productMap.clear();

  this.recommendationService.getRecommendations().subscribe((recs: Recommendation[]) => {
    if (!recs || recs.length === 0) return;

    const recommendedFive = recs.slice(0, 5); // limit to 5
    const productRequests = recommendedFive.map(rec => this.productService1.getProductById(rec.id));

    forkJoin(productRequests).subscribe((products: Product[]) => {
      products.forEach(product => {
        this.productMap.set(product.id, { product, images: [], currentImageIndex: 0 });
      });
      console.log('Products loaded without images:', this.productMap);
    });
  });
}

// -------------------- Load images separately --------------------
loadImagesSeparately(): void {
  this.productMap.forEach((value, key) => {
    this.imageService.getAllImagesByProductID(key).subscribe((images: Image[]) => {

      const current = this.productMap.get(key);
      if (current) {
        this.productMap.set(key, { ...current, images });
        console.log(`Images loaded for product ${key}`);
      }
    });
  });
}

// -------------------- Usage example --------------------
// Step 1: Load products


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
  this.router.navigate(['/admin-product', encodedName], { state: { product } });
}

  trackByProduct(index: number, product: ProductWithImages): number {
    return product.id;
  }

   toggleCart(product: Product) {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }

    if (this.cartProductIds.includes(product.id)) {
      this.cartService.removeFromCart([product.id]).subscribe(() => {
        this.cartProductIds = this.cartProductIds.filter(id => id !== product.id);
      });
    } else {
      this.cartService.addToCart([{ productId: product.id, quantity: 1 }]).subscribe(() => {
        this.cartProductIds.push(product.id);
      });
    }
  }

  toggleWishlist(product: Product) {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }

    if (this.wishlistProductIds.includes(product.id)) {
      this.wishlistService.removeFromWishlist([product.id]).subscribe(() => {
        this.wishlistProductIds = this.wishlistProductIds.filter(id => id !== product.id);
      });
    } else {
      this.wishlistService.addToWishlist([product.id]).subscribe(() => {
        this.wishlistProductIds.push(product.id);
      });
    }
  }
}

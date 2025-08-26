import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { WishlistService } from '../../Service/wishlist.service';
import { ProductService1 } from '../../Service/product1.service';
import { ImageService } from '../../Service/image.service';
import { AuthService } from '../../Service/auth.service';
import { WishlistItem } from '../../models/wishlist.model';
import { forkJoin } from 'rxjs';
import { CartService } from '../../Service/cart.service';
import { WishlistDto } from '../../models/wishlist.model';
import { FormsModule } from '@angular/forms';

export interface WishlistItemWithImages extends WishlistItem {
  images: string[];
  currentImageIndex: number;
  selected?: boolean; // optional boolean for selection
    brand?: string; // new field
    discountPrice?: number; // new field for discountPrice
}


@Component({
  selector: 'app-wishlist',
  standalone: true,
  imports: [CommonModule, RouterModule,  FormsModule ],
  templateUrl: './wishlist.component.html',
  styleUrls: ['./wishlist.component.css']
  
})
export class WishlistComponent implements OnInit {
    images: string[] = []; // all images (data URLs or full URLs)
  wishlistItems: WishlistItemWithImages[] = [];
  currentImageIndex: { [productId: number]: number } = {};
  myWishlistIds: Set<number> = new Set(); // track server-side wishlist
    // Add this interface to define the structure of wishlist items with images 

  
  // Toast state
  toastMessage: string = '';
  showToast: boolean = false;

constructor(
  private wishlistService: WishlistService,
  private authService: AuthService,
  private router: Router,
  private productService1: ProductService1,
  private imageService: ImageService,
  private cartService: CartService // ✅ needed for addToCart
) {}

selectAll: boolean = false;

toggleSelectAll() {
  this.wishlistItems.forEach(item => item.selected = this.selectAll);
}

removeSelected() {
  const toRemove = this.wishlistItems.filter(i => i.selected);
  if (!toRemove.length) return this.showToastMessage("No items selected.");

  const ids = toRemove.map(i => i.productId);
  this.wishlistService.removeFromWishlist(ids).subscribe({
    next: () => {
      this.showToastMessage('Selected items removed.');
      this.loadWishlist();
      this.selectAll = false;
    },
    error: err => console.error(err)
  });
}


  /** TOAST UTILITY */
  showToastMessage(message: string) {
    this.toastMessage = message;
    this.showToast = true;
    setTimeout(() => {
      this.showToast = false;
    }, 5000);
  }



addSelectedToCart() {
  const selected = this.wishlistItems.filter(i => i.selected);
  if (!selected.length) return this.showToastMessage("No items selected.");

  const payload = selected
    .map(i => ({ productId: Number(i.productId), quantity: 1 }))
    .filter(p => !isNaN(p.productId));

  if (!payload.length) return this.showToastMessage('No valid product IDs to add.');

  this.cartService.addToCart(payload).subscribe({
    next: () => {
      this.showToastMessage('Selected items added to cart!');
      const ids = selected.map(i => i.productId);

      // ✅ remove from wishlist on server
      this.wishlistService.removeFromWishlist(ids).subscribe({
        next: () => this.loadWishlist(),
        error: err => console.error('Failed to remove after adding to cart', err)
      });

      this.selectAll = false;
    },
    error: err => {
      console.error('Failed to add selected items to cart', err);
      this.showToastMessage('Failed to add selected items to cart.');
    }
  });
}

addToCart(item: WishlistItemWithImages) {
  const pid = Number(item.productId);
  if (isNaN(pid)) {
    this.showToastMessage('Invalid product ID.');
    return;
  }

  const payload = [{ productId: pid, quantity: 1 }];
  this.cartService.addToCart(payload).subscribe({
    next: () => {
      this.showToastMessage(`${item.productName} added to cart!`);

      // ✅ remove from wishlist on server
      this.wishlistService.removeFromWishlist([pid]).subscribe({
        next: () => this.loadWishlist(),
        error: err => console.error('Failed to remove after adding to cart', err)
      });
    },
    error: err => {
      console.error('Failed to add item to cart', err);
      this.showToastMessage('Failed to add item to cart.');
    }
  });
}


  ngOnInit() {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/sign-in']);
      return;
    }
    this.loadWishlist(); // always fetch from server
  }

  ngAfterViewInit() {
    const video: HTMLVideoElement = document.querySelector('.video-background')!;
    video.muted = true;
  }

  /** Load wishlist from backend */
  loadWishlist() {
    console.log('Fetching wishlist from server...');
    this.wishlistService.getMyWishlist().subscribe({
      next: (res: any) => {
        console.log('Wishlist response from server:', res);
        if (res?.products && res.products.length) {
          this.initializeWishlistItems(res.products);
        } else {
          console.log('No items returned from server.');
          this.wishlistItems = [];
          this.myWishlistIds.clear();
        }
      },
      error: (err) => {
        console.error('Failed to fetch wishlist:', err);
        this.wishlistItems = [];
        this.myWishlistIds.clear();
      }
    });
  }



private initializeWishlistItems(items: any[]) {
  // Diagnostic: show a sample raw item to help determine server field names
  if (items && items.length) console.log('[Wishlist] raw item sample:', items[0]);

  // small helper to guess a readable product name from a raw item
  const getProductNameFromRaw = (it: any): string | null => {
    if (!it) return null;
    // common keys
    const candidates = [
      it.name,
      it.productName,
      it.product_name,
      it.title,
      it.name_en,
      it.product?.name,
      it.product?.productName,
      it.product?.title,
      it?.product?.product_name
    ];
    for (const c of candidates) if (typeof c === 'string' && c.trim()) return c;
    // fallback: pick first short string property that doesn't look like a URL or base64
    for (const k of Object.keys(it)) {
      const v = it[k];
      if (typeof v === 'string') {
        const s = v.trim();
        if (!s) continue;
        if (s.startsWith('data:') || s.includes('/')) continue; // skip images/urls
        if (s.length > 2 && s.length < 120) return s;
      }
    }
    return null;
  };
  // Map raw items to WishlistItemWithImages
  this.wishlistItems = items.map(it => ({
    productId: Number(it.productId ?? it.id),
    productPrice: it.productPrice ?? it.discountPrice ?? 0,
    productName: (
      it.name ?? it.productName ?? it.product_name ?? it.title ?? it.name_en ?? (it.product && it.product.name) ?? getProductNameFromRaw(it) ?? 'Unknown Product'
    ),
    productImage: it.image ?? it.productImage ?? '',
    images: [],
    currentImageIndex: 0,
    selected: false,
    brand: '',       // will be filled later
    discountPrice: 0         // will be updated from product table
  }));

  // Sync wishlist IDs
  this.myWishlistIds = new Set(
    this.wishlistItems.map(it => Number(it.productId)).filter(id => !isNaN(id))
  );

  // Load images for each item
  const imageRequests = this.wishlistItems.map(item =>
    this.imageService.getAllImagesByProductID(Number(item.productId))
  );

  forkJoin(imageRequests).subscribe(imagesArray => {
    imagesArray.forEach((images, idx) => {
      const normalized = images
        .map((img: any) =>
          img?.data || img?.url || img?.path || img?.fileName || img?.imageName || img?.filename || img?.link
        )
        .filter(Boolean)
        .map((s: any) =>
          typeof s === 'string' ? (s.startsWith('data:') ? s : `data:image/jpeg;base64,${s}`) : ''
        );

      this.wishlistItems[idx].images = normalized.length ? normalized : ['assets/logo.png'];
      this.wishlistItems[idx].currentImageIndex = 0;
      this.currentImageIndex[this.wishlistItems[idx].productId] = 0;
    });
  });

  // Load brand and price from product table
  this.wishlistItems.forEach(item => {
    this.productService1.getProductById( item.productId).subscribe(prod => {
        console.log('Fetched product:', prod);
      item.brand = prod.brand ?? 'Unknown';
      item.discountPrice = prod.discountPrice ?? 0; // numeric default
    });
  });
}


  /** Carousel navigation */
  nextImage(item: WishlistItemWithImages) {
    if (!item.images?.length) return;
    item.currentImageIndex = (item.currentImageIndex + 1) % item.images.length;
  }

  prevImage(item: WishlistItemWithImages) {
    if (!item.images?.length) return;
    const i = item.currentImageIndex - 1;
    item.currentImageIndex = i >= 0 ? i : item.images.length - 1;
  }

navigateToProduct(item: WishlistItemWithImages) {
  if (!item?.productId) return;

  this.productService1.getProductById( item.productId).subscribe({
    next: fullProduct => {
      if (!fullProduct) {
        console.error('Product not found for ID', item.productId);
        this.showToastMessage('Product details not available.');
        return;
      }

      // Ensure all expected fields exist to avoid template errors
      fullProduct.images = fullProduct.images || [fullProduct.image || 'assets/logo.png'];
      fullProduct.currentImageIndex = 0;
      fullProduct.selectedQty = 1;

      this.router.navigate(['/product', encodeURIComponent(fullProduct.name)], { state: { product: fullProduct } });
    },
    error: err => {
      console.error('Failed to fetch product details', err);
      this.showToastMessage('Cannot load product details.');
    }
  });

}

goToProductDetails(product: any): void {
  const encodedName = encodeURIComponent(product.name);
  const roles = this.authService.getUserRoles();
  const isLoggedIn = this.authService.isLoggedIn();
    this.router.navigate(['/admin-product', encodedName], { state: { product } });

}


  /** Toggle add/remove wishlist */
  toggleWishlist(item: WishlistItemWithImages) {
    if (!item?.productId) return;
    const pid = Number(item.productId);
    const inList = this.myWishlistIds.has(pid);

    const obs = inList
      ? this.wishlistService.removeFromWishlist([pid])
      : this.wishlistService.addToWishlist([pid]);

    obs.subscribe({
      next: () => {
        this.showToastMessage(`${item.productName} ${inList ? 'removed from' : 'added to'} wishlist.`);
        this.loadWishlist(); // ✅ always reload from backend
      },
      error: (err) => {
        console.error('Wishlist operation failed', err);
        this.showToastMessage('Wishlist operation failed.');
      }
    });
  }

  /** Check if product is in wishlist */
  isInWishlist(item: WishlistItemWithImages): boolean {
    if (!item?.productId) return false;
    return this.myWishlistIds.has(Number(item.productId));
  }

  /** Remove from wishlist */
  removeFromWishlist(item: WishlistItemWithImages) {
    if (!item?.productId) return;
    this.wishlistService.removeFromWishlist([item.productId]).subscribe({
      next: () => {
        this.showToastMessage(`${item.productName} removed from wishlist.`);
        this.loadWishlist(); // ✅ reload real server wishlist
      },
      error: () => {
        console.error('Failed to remove wishlist item');
        this.showToastMessage(`${item.productName} could not be removed.`);
      }
    });
  }
}

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
import { CartDto, CartItem } from '../../models/cart.model';
import { HttpHeaders } from '@angular/common/http';
import { throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Observable } from 'rxjs';

export interface CartItemWithImages extends CartItem {
  images: string[];
  currentImageIndex: number;
  selected?: boolean; // optional boolean for selection
  brand?: string; // new field
  discountPrice?: number; // new field for discountPrice
  quantity?: number; // optional quantity field for cart operations
}


@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css']
})
export class CartComponent implements OnInit {
  cartItems: any[] = [];
  images: string[] = [];
  currentImageIndex: { [productId: number]: number } = {};
  mycartIds: Set<number> = new Set(); // track server-side wishlist
  constructor(
    private router: Router,
    private productService1: ProductService1,
    private imageService: ImageService,
    private authService: AuthService,
    private cartService: CartService // ✅ needed for addToCart
  ) {}
selectAll: boolean = false;
toggleSelectAll() {
  this.cartItems.forEach(item => item.selected = this.selectAll);
}


removeSelected() {
  const selectedItems = this.cartItems.filter(i => i.selected);
  if (!selectedItems.length) return alert("No items selected.");

  // Send productId + actual quantity
  const payload = selectedItems.map(i => ({
    productId: i.productId,
    quantity: i.quantity
  }));

  this.cartService.removeFromCart(payload).subscribe({
    next: () => {
      alert('Selected items removed from cart.');
      this.loadCart(); // reload cart
      this.selectAll = false;
    },
    error: (err) => {
      console.error('Failed to remove selected items:', err);
      alert('Failed to remove selected items from cart.');
    }
  });
}


ngOnInit() {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/sign-in']);
      return;
    }
    this.loadCart(); // always fetch from server
  }

  ngAfterViewInit() {
    const video: HTMLVideoElement = document.querySelector('.video-background')!;
    video.muted = true;
  }


loadCart() {
  console.log('Fetching cart from server...');
  this.cartService.getMyCart().subscribe({
    next: (res: CartDto) => {
      console.log('Cart response from server:', res);

      const items = res.items ?? [];
      if (items.length) {
        this.initializecartItems(items);
      } else {
        console.log('No items returned from server.');
        this.cartItems = [];
        this.mycartIds.clear();
      }
    },
    error: (err) => {
      console.error('Failed to fetch cart:', err);
      this.cartItems = [];
      this.mycartIds.clear();
    }
  });
}


private initializecartItems(items: any[]) {
  // Map raw items to CartItemWithImages
  this.cartItems = items.map(it => ({
    productId: Number(it.productId ?? it.product_id ?? it.id),
    productPrice: it.productPrice ?? it.product_price ?? 0,
    productName: '', // we'll fill this later
    productImage: it.productImage ?? it.image ?? it.image_url ?? '',
    images: [],
    currentImageIndex: 0,
    selected: false,
    brand: '',       
    discountPrice: 0,
      quantity: it.quantity ?? 1 // default quantity
  }));

  // Sync wishlist IDs
  this.mycartIds = new Set(this.cartItems.map(it => it.productId));

  // Fetch proper product details for each item
  this.cartItems.forEach(item => {
    this.productService1.getProductById(item.productId).subscribe(prod => {
      if (!prod) {
        item.productName = 'Unknown Product';
        return;
      }
      item.productName = prod.name ?? prod.productName ?? 'Unknown Product';
      item.brand = prod.brand ?? 'Unknown';
      item.discountPrice = prod.discountPrice ?? 0;

      // optionally override image if missing
      if (!item.productImage) {
        item.productImage = prod.image ?? 'assets/logo.png';
      }
    });
  });

  // Load images for each item
  const imageRequests = this.cartItems.map(item =>
    this.imageService.getAllImagesByProductID(item.productId)
  );

  forkJoin(imageRequests).subscribe(imagesArray => {
    imagesArray.forEach((images, idx) => {
      const normalized = images
        .map((img: any) => img?.data || img?.url || img?.path || img?.fileName || img?.imageName || img?.filename || img?.link)
        .filter(Boolean)
        .map((s: any) => typeof s === 'string' ? (s.startsWith('data:') ? s : `data:image/jpeg;base64,${s}`) : '');

      this.cartItems[idx].images = normalized.length ? normalized : ['assets/logo.png'];
      this.cartItems[idx].currentImageIndex = 0;
      this.currentImageIndex[this.cartItems[idx].productId] = 0;
    });
  });
}


getCartTotal(): number {
  return this.cartItems.reduce((acc, i) => {
    const price = i.discountPrice > 0 ? i.discountPrice : i.productPrice;
    const qty = i.quantity ?? 1;
    return acc + price * qty;
  }, 0);
}





  /** Carousel navigation */
  nextImage(item: CartItemWithImages) {
    if (!item.images?.length) return;
    item.currentImageIndex = (item.currentImageIndex + 1) % item.images.length;
  }

  prevImage(item: CartItemWithImages) {
    if (!item.images?.length) return;
    const i = item.currentImageIndex - 1;
    item.currentImageIndex = i >= 0 ? i : item.images.length - 1;
  }

navigateToProduct(item: CartItemWithImages) {
  if (!item?.productId) return;

  this.productService1.getProductById(item.productId).subscribe({
    next: fullProduct => {
      if (!fullProduct) {
        console.error('Product not found for ID', item.productId);
        alert('Product details not available.');
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
      alert('Cannot load product details.');
    }
  });

}




goToProductDetails(product: any): void {
  const encodedName = encodeURIComponent(product.name);
  const roles = this.authService.getUserRoles();
  const isLoggedIn = this.authService.isLoggedIn();
    this.router.navigate(['/admin-product', encodedName], { state: { product } });

}


toggleCart(item: CartItemWithImages) {
  if (!item?.productId) return;
  const inCart = this.mycartIds.has(item.productId);

  const payload = [{ productId: item.productId, quantity: 1 }]; // quantity can be dynamic

  const obs = inCart
    ? this.cartService.removeFromCart([item.productId])
    : this.cartService.addToCart(payload);

  obs.subscribe({
    next: () => {
      console.log(`[Cart Debug] ${item.productName} ${inCart ? 'removed from' : 'added to'} cart.`);
      this.loadCart(); // reload cart from backend
    },
    error: err => {
      console.error('[Cart Debug] Cart operation failed:', err);
      alert('Cart operation failed. See console.');
    }
  });
}




  /** Check if product is in wishlist */
  isInCart(item: CartItemWithImages): boolean {
    if (!item?.productId) return false;
    return this.mycartIds.has(Number(item.productId));
  }

removeItemFromCart(item: any) {
  // item should already have productId and quantity from your cart list
  const payload = [{
    productId: item.productId,
    quantity: item.quantity   // remove the whole quantity assigned in DB
  }];

  this.cartService.removeFromCart(payload).subscribe({
    next: (resp) => {
      console.log('Item removed:', resp);
      this.loadCart(); // refresh cart UI
    },
    error: (err) => {
      console.error('Error removing item:', err);
    }
  });
}

removeAllItemsFromCart() {
  const items = this.cartItems.map(c => ({
    productId: c.productId,
    quantity: c.quantity
  }));

  this.cartService.removeFromCart(items).subscribe({
    next: (resp) => {
      console.log('Removed all items:', resp);
      this.loadCart();
    },
    error: (err) => {
      console.error('Error removing items:', err);
    }
  });
}

}

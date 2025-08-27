import { Component, OnInit } from '@angular/core';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { CartService } from '../../Service/cart.service';
import { ProductService1 } from '../../Service/product1.service';
import { ImageService } from '../../Service/image.service';
import { AuthService } from '../../Service/auth.service';
import { OrderService } from '../../Service/order.service';
import { CartDto, CartItem } from '../../models/cart.model';



export interface CartItemWithImages extends CartItem {
  images: string[];
  currentImageIndex: number;
  selected?: boolean;
  brand?: string;

  /** 🔹 Changed: now guaranteed numbers (not optional) */
  discountPrice: number;
  productPrice: number;
  quantity: number;
    maxQuantity?: number;
}

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css']
})
export class CartComponent implements OnInit {
  cartItems: CartItemWithImages[] = [];
  currentImageIndex: { [productId: number]: number } = {};
  mycartIds: Set<number> = new Set();
  selectAll: boolean = false;
  hasPaymentInfo: boolean = false;
  currentUrl: string = '';

  // Toast state
  toastMessage: string = '';
  showToast: boolean = false;

  // Modal state
  showOrderModal: boolean = false;
  orderConfirmed: boolean = false;
  countdown: number = 20;
  countdownInterval: any;
  selectedItemsForOrder: CartItemWithImages[] = [];
  orderTime: string = '';
  confirmEnabled: boolean = false;
  confirmTimeout: any;
  loading:boolean=false;
  showPaymentInfo: boolean = false; 

  constructor(
      private router: Router,
      private route: ActivatedRoute,
      private productService1: ProductService1,
      private imageService: ImageService,
      private authService: AuthService,
      private cartService: CartService,
      private orderService: OrderService
    ) {}

  ngOnInit() {
      this.currentUrl = this.router.url;
 this.authService.getMyCard().subscribe({
    next: (response: any) => {
      // Use the same logic as profile component
      this.hasPaymentInfo = !!response && !!response.cardNumber;
    },
    error: (err) => {
      console.error('Error fetching card info:', err);
      this.hasPaymentInfo = false;
    }
  });
    // Show payment info if query param is set
  this.route.queryParams.subscribe(params => {
    if (params['showPaymentInfo']) {
      this.showPaymentInfo = true;

      // Optional: scroll to the payment section
      setTimeout(() => {
        const el = document.querySelector('.card-container');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 50);
    }
  });
    this.loadCart();
  }

  /** TOAST UTILITY */
  showToastMessage(message: string) {
    this.toastMessage = message;
    this.showToast = true;
    setTimeout(() => {
      this.showToast = false;
    }, 5000);
  }

  loadCart() {
    this.loading=true;
    this.cartService.getMyCart().subscribe({
      next: (res) => {
        const items = res.items ?? [];
        if (items.length) this.initializecartItems(items);
        else {
          this.cartItems = [];
          this.mycartIds.clear();
        }
        this.loading=false;
      },
      error: (err) => {
        console.error('Failed to fetch cart:', err);
        this.showToastMessage('Failed to load cart.');
        this.cartItems = [];
        this.mycartIds.clear();
      }
    });


  }

private initializecartItems(items: any[]) {
  this.cartItems = items.map(it => ({
    productId: Number(it.productId ?? 0),
    productPrice: it.productPrice ?? 0,
    productName: '',
    productImage: it.productImage ?? '',
    images: [],
    currentImageIndex: 0,
    selected: false,
    brand: '',
    discountPrice: it.discountPrice ?? 0,
    quantity: it.quantity ?? 1,
    maxQuantity: 99 // default, will update from product data
  }));

  this.mycartIds = new Set(this.cartItems.map(it => it.productId));

  this.cartItems.forEach(item => {
    this.productService1.getProductById(item.productId).subscribe(prod => {
      if (!prod) {
        item.productName = 'Unknown Product';
        return;
      }

      item.productName = prod.name ?? prod.productName ?? 'Unknown Product';
      item.brand = prod.brand ?? 'Unknown';
      item.discountPrice = prod.discountPrice ?? 0;
      item.maxQuantity = prod.quantity ?? 99; // <-- set available stock here
      if (!item.productImage) item.productImage = prod.image ?? 'assets/logo.png';
    });
  });

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
      const price = (i.discountPrice && i.discountPrice > 0) ? i.discountPrice : i.productPrice;
      const qty = i.quantity;
      return acc + price * qty;
    }, 0);
  }

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
          this.showToastMessage('❌ Product details not available.');
          return;
        }

        fullProduct.images = fullProduct.images || [fullProduct.image || 'assets/logo.png'];
        fullProduct.currentImageIndex = 0;
        fullProduct.selectedQty = 1;

        this.router.navigate(['/admin-product', encodeURIComponent(fullProduct.name)], { state: { product: fullProduct } });
      },
      error: err => {
        console.error('Failed to fetch product details', err);
        this.showToastMessage('❌ Cannot load product details.');
      }
    });
  }

  removeItemFromCart(item: CartItemWithImages) {
    const payload = [{ productId: item.productId, quantity: item.quantity }];

    this.cartService.removeFromCart(payload).subscribe({
      next: (res: any) => {
        this.loadCart(); // reload cart
        this.showToastMessage('Item removed from cart.');
      },
      error: (err) => {
        console.error('[CartComponent] Error removing item:', err);
        this.showToastMessage('Failed to remove item.');
      }
    });
  }

  removeAllItemsFromCart() {
    const items = this.cartItems.map(c => ({ productId: c.productId, quantity: c.quantity }));
    this.cartService.removeFromCart(items).subscribe({
      next: () => {
        this.loadCart();
        this.showToastMessage('All items removed from cart.');
      },
      error: (err) => {
        console.error('Error removing items:', err);
        this.showToastMessage('Failed to remove items.');
      }
    });
  }

  removeSelected() {
    const selectedItems = this.cartItems.filter(i => i.selected);
    if (!selectedItems.length) {
      this.showToastMessage('No items selected.');
      return;
    }

    const payload = selectedItems.map(i => ({ productId: i.productId, quantity: i.quantity }));
    this.cartService.removeFromCart(payload).subscribe({
      next: () => {
        this.loadCart();
        this.showToastMessage('Selected items removed.');
      },
      error: err => {
        console.error('Error removing selected items', err);
        this.showToastMessage('Failed to remove selected items.');
      }
    });
  }

  /** SELECT ALL HANDLING */
  toggleSelectAll() {
    this.cartItems.forEach(item => (item.selected = this.selectAll));
  }

  toggleItemSelection() {
    this.selectAll = this.cartItems.every(item => item.selected);
  }

  placeOrderSelected() {
    this.selectedItemsForOrder = this.cartItems.filter(i => i.selected);

    if (!this.selectedItemsForOrder.length) {
      this.showToastMessage('⚠️ Please select at least one item.');
      return;
    }

    this.showOrderModal = true;
    this.orderConfirmed = false;
    this.countdown = 20;
    clearInterval(this.countdownInterval);

    const now = new Date();
    this.orderTime = now.toLocaleString();
  }
/** 🔹 Quantity Controls with API update */
increaseQty(item: CartItemWithImages) {
  if (!item) return;
  const max = item.maxQuantity || 99;
  if (item.quantity < max) {
    const newQty = item.quantity + 1;
    this.updateCartItem(item, newQty);
  }
}

decreaseQty(item: CartItemWithImages) {
  if (!item) return;
  if (item.quantity > 1) {
    const newQty = item.quantity - 1;
    this.updateCartItem(item, newQty);
  }
}

/** 🔹 Remove and re-add cart item with new quantity */
private updateCartItem(item: CartItemWithImages, newQuantity: number) {
  const payloadRemove = [{ productId: item.productId, quantity: item.quantity }];
  this.cartService.removeFromCart(payloadRemove).subscribe({
    next: () => {
      const payloadAdd = [{ productId: item.productId, quantity: newQuantity }];
      this.cartService.addToCart(payloadAdd).subscribe({
        next: () => {
          item.quantity = newQuantity; // Update local quantity
          this.showToastMessage(`Quantity updated to ${newQuantity}`);
        },
        error: err => {
          console.error('Failed to add updated quantity', err);
          this.showToastMessage('❌ Failed to update quantity');
          // Re-add original quantity to revert
          this.cartService.addToCart(payloadRemove).subscribe();
        }
      });
    },
    error: err => {
      console.error('Failed to remove item for update', err);
      this.showToastMessage('❌ Failed to update quantity');
    }
  });
}




  confirmPayment() {
    this.orderConfirmed = true;
    this.countdown = 20;
    this.confirmEnabled = false;

    clearTimeout(this.confirmTimeout);
    this.confirmTimeout = setTimeout(() => {
      this.confirmEnabled = true;
    }, 4000); // Enable after 4s

    this.countdownInterval = setInterval(() => {
      this.countdown--;
      if (this.countdown <= 0) {
        clearInterval(this.countdownInterval);
        this.finalizeOrder();
      }
    }, 1000);
  }

  cancelOrder() {
    clearInterval(this.countdownInterval);
    clearTimeout(this.confirmTimeout);
    this.showOrderModal = false;
    this.orderConfirmed = false;
    this.confirmEnabled = false;
  }

  getSelectedItemsTotal(): number {
    return this.selectedItemsForOrder.reduce((acc, i) => {
      const price = (i.discountPrice && i.discountPrice > 0) ? i.discountPrice : i.productPrice;
      return acc + price * i.quantity;
    }, 0);
  }

  finalizeOrder() {
    clearInterval(this.countdownInterval);
    clearTimeout(this.confirmTimeout);

    if (this.selectedItemsForOrder.length > 0) {
      const orderData: { [key: number]: number } = {};
      this.selectedItemsForOrder.forEach(item => orderData[item.productId] = item.quantity);

      this.orderService.createOrder(orderData).subscribe({
        next: () => {
          this.showToastMessage('✅ Order placed successfully!');
          const removePayload = this.selectedItemsForOrder.map(item => ({
            productId: item.productId,
            quantity: item.quantity
          }));

          this.cartService.removeFromCart(removePayload).subscribe({
            next: () => this.loadCart(),
            error: (err) => {
              console.error('Failed to remove ordered items:', err);
              this.loadCart();
            }
          });

          this.showOrderModal = false;
        },
        error: (err) => {
          console.error(err);
          this.showToastMessage('❌ Failed to place order.');
        }
      });
    }
  }
}

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { forkJoin, Observable, map } from 'rxjs';
import { OrderService } from '../../Service/order.service';
import { ProductService1 } from '../../Service/product1.service';
import { ImageService } from '../../Service/image.service';
import { Router } from '@angular/router';

export interface Image {
  id: number;
  filename: string;
  data: string; // Base64 string
  product?: any;
}

export interface OrderItem {
  productId: number;
  productName: string;
  brand?: string;
  images: string[];
  quantity: number;
  unitPrice: number;
  discountPrice?: number;
}

export interface CustomerOrder {
  displayOrderId: number; // sequential ID
  orderId: number;        // real backend ID
  orderTime: string;
  totalAmount: number;
  status: string;
  items: OrderItem[];
}

@Component({
  selector: 'app-customer-orders',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './customer-orders.component.html',
  styleUrls: ['./customer-orders.component.css']
})
export class CustomerOrdersComponent implements OnInit {
  orders: CustomerOrder[] = [];
  expandedOrderId: number | null = null;
  loading: boolean = true;
  // Toast state
  toastMessage: string = '';
  showToast: boolean = false;
  constructor(
    private router: Router,
    private orderService: OrderService,
    private productService: ProductService1,
    private imageService: ImageService
  ) {}

  ngOnInit(): void {
    this.loadOrders();
  }

loadOrders(): void {
      this.loading = true;
    this.orderService.getAllOrderForMe().subscribe({
      next: (res: any[]) => {
        const ordersTemp: CustomerOrder[] = res.map((o, index) => ({
          displayOrderId: index + 1,
          orderId: o.orderId,
          orderTime: o.placedAt,
          totalAmount: o.totalPrice,
          status: o.status,
          items: o.items.map((i: any) => ({
            productId: i.productId,
            quantity: i.quantity,
            unitPrice: i.priceAtPurchase,
            discountPrice: undefined,
            productName: '',
            brand: '',
            images: ['assets/logo.png'] // default placeholder
          }))
        }));

        // Prepare observables for all product details and images
        const allObservables: Observable<void>[] = [];

        ordersTemp.forEach(order => {
          order.items.forEach(item => {
            const obs = this.productService.getProductById(item.productId).pipe(
              map(prod => {
                item.productName = prod.name ?? 'Unknown';
                item.brand = prod.brand ?? 'Unknown';
                this.imageService.getAllImagesByProductID(item.productId).subscribe({
                  next: (imgs: Image[]) => {
                    if (imgs && imgs.length > 0) {
                      item.images = [`data:image/jpeg;base64,${imgs[0].data}`];
                    }
                    this.loading = false;
                  },
                  error: () => {
                    item.images = ['assets/logo.png'];
                  }
                });
              })
            );
            allObservables.push(obs);
          });
        }
        
      );

        // Wait for all product info fetches to finish
        if (allObservables.length > 0) {
          forkJoin(allObservables).subscribe({
            next: () => {
              this.orders = ordersTemp;
              this.orders.sort((a, b) => new Date(b.orderTime).getTime() - new Date(a.orderTime).getTime());

            
            },
            error: () => this.orders = ordersTemp
          });
        } else {
          this.orders = ordersTemp;
        }
      },
      error: err => console.error('Failed to load orders', err)
    });

  }

  toggleOrder(displayOrderId: number): void {
    this.expandedOrderId = this.expandedOrderId === displayOrderId ? null : displayOrderId;
  }

  getItemTotal(item: OrderItem): number {
    const price = (item.discountPrice && item.discountPrice > 0) ? item.discountPrice : item.unitPrice;
    return price * item.quantity;
  }

  getStatusClass(status: string): string {
    switch(status) {
      case 'REQUESTED': return 'status-requested';
      case 'PROCESSING': return 'status-processing';
      case 'READY': return 'status-ready';
      case 'DELIVERED': return 'status-delivered';
      case 'REJECTED': return 'status-rejected';
      case 'CANCELLED': return 'status-cancelled';
      default: return '';
    }
  }
    showToastMessage(message: string) {
    this.toastMessage = message;
    this.showToast = true;
    setTimeout(() => {
      this.showToast = false;
    }, 5000);
  }
  goToProduct(item: OrderItem) {
    const encodedName = encodeURIComponent(item.productName);

    this.productService.getProductById(item.productId).subscribe({
      next: (res) => {
        const product = res;

        // Navigate only after the product is loaded
        this.router.navigate(['/admin-product', encodedName], { state: { product } });
      },
      error: (err) => {
        console.error('Failed to load product', err);
      }
    });
  }
}

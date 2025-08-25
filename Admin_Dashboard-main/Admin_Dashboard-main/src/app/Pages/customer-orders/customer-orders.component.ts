import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { forkJoin, Observable, map } from 'rxjs';
import { OrderService } from '../../Service/order.service';
import { ProductService1 } from '../../Service/product1.service';

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
  orderId: number;
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

  constructor(
    private orderService: OrderService,
    private productService: ProductService1
  ) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.orderService.getAllOrderForMe().subscribe({
      next: (res: any[]) => {
        // Map orders
        const ordersTemp: CustomerOrder[] = res.map(o => ({
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
            images: ['assets/logo.png']
          }))
        }));

        // Fetch product info for each item
        const allProductObservables: Observable<any>[] = [];
        ordersTemp.forEach(order => {
          order.items.forEach(item => {
            allProductObservables.push(
              this.productService.getProductById(item.productId).pipe(
                map(prod => {
                  item.productName = prod.name ?? 'Unknown';
                  item.brand = prod.brand ?? 'Unknown';
                  item.images = prod.images?.length ? prod.images : ['assets/logo.png'];
                })
              )
            );
          });
        });

        // Wait for all product info
        if (allProductObservables.length > 0) {
          forkJoin(allProductObservables).subscribe({
            next: () => this.orders = ordersTemp,
            error: () => this.orders = ordersTemp
          });
        } else {
          this.orders = ordersTemp;
        }
      },
      error: err => console.error('Failed to load orders', err)
    });
  }

  toggleOrder(orderId: number): void {
    this.expandedOrderId = this.expandedOrderId === orderId ? null : orderId;
  }

  getItemTotal(item: OrderItem): number {
    const price = (item.discountPrice && item.discountPrice > 0) ? item.discountPrice : item.unitPrice;
    return price * item.quantity;
  }

  getStatusClass(status: string): string {
    switch(status?.toLowerCase()) {
      case 'pending': return 'status-pending';
      case 'completed': return 'status-completed';
      case 'cancelled': return 'status-cancelled';
      default: return '';
    }
  }
}

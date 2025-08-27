import { Component, OnInit } from '@angular/core';
import { CommonModule, DecimalPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin, Observable, map } from 'rxjs';
import { OrderService } from '../../Service/order.service';
import { ProductService1 } from '../../Service/product1.service';
import { ImageService } from '../../Service/image.service';
import { AuthService } from '../../Service/auth.service';
import { Router } from '@angular/router';

export interface Image { id: number; filename: string; data: string; product?: any; }

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
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  orderTime: string;
  totalAmount: number;
  status: string;
  items: OrderItem[];
  showItems?: boolean;
  editingStatus?: boolean;
}

interface GroupedCustomerOrders {
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  orders: CustomerOrder[];
}

@Component({
  selector: 'app-admin-orders',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe, DecimalPipe],
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.css'],
  providers: [DatePipe, DecimalPipe]
})
export class AdminOrdersComponent implements OnInit {
  orders: CustomerOrder[] = [];
  groupedOrders: GroupedCustomerOrders[] = [];
  canEditStatus = false;
  filterStatus: string = 'ALL';
  statusOptions = ['REQUESTED','PROCESSING','READY','DELIVERED','REJECTED','CANCELLED'];

  constructor(
    private router: Router,
    private orderService: OrderService,
    private productService: ProductService1,
    private imageService: ImageService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.canEditStatus = this.authService.hasAnyRole(['UPDATE_ORDER', 'OWNER']);
    this.loadOrders();
  }

loadOrders(): void {
  this.orderService.getOrders().subscribe({
    next: (res: any[]) => {
      this.orders = res.map(o => ({
        orderId: o.orderId,
        customerName: o.customerName,
        customerEmail: o.customerEmail || 'N/A',
        customerPhone: o.customerPhone || 'N/A',
        orderTime: o.placedAt,
        totalAmount: o.totalPrice,
        status: o.status,
        showItems: false,
        editingStatus: false,

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

      // Sort orders by orderTime (newest first)
      this.orders.sort((a, b) => new Date(b.orderTime).getTime() - new Date(a.orderTime).getTime());
    },
    error: err => console.error('Failed to load orders', err)
  });
}


toggleItems(order: CustomerOrder): void {
  order.showItems = !order.showItems;

  order.items.forEach(item => {
    this.imageService.getAllImagesByProductID(item.productId).subscribe({
      next: (res) => {
        item.images = res.map(img=>'data:image/jpeg;base64,' + img.data);
      },
      error: (err) => {
        console.error('Error fetching images:', err);
      }
    });
  });
}

saveStatus(order: CustomerOrder) {
  if (!order.orderId) return;

  this.orderService.updateOrderStatus(order.orderId, order.status).subscribe({
    next: (updatedOrder) => {
      order.editingStatus = false;
      order.status = updatedOrder.status;
      console.log(`Order #${order.orderId} status updated to ${order.status}`);
    },
    error: (err) => {
      console.error( err);
    }
  });
}


  cancelEdit(order: CustomerOrder) {
    order.editingStatus = false;
    // optionally reload previous status from backend if needed
  }

  getItemTotal(item: OrderItem): number {
    const price = item.discountPrice && item.discountPrice > 0 ? item.discountPrice : item.unitPrice;
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
  isCustomerVisible(customer: GroupedCustomerOrders): boolean {
  if (this.filterStatus === 'ALL') return customer.orders.length > 0;
  return customer.orders.some(order => order.status === this.filterStatus);
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

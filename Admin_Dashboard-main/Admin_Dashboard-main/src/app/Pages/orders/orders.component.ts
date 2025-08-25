import { Component, OnInit } from '@angular/core';
import { CommonModule, DecimalPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin, Observable, map } from 'rxjs';
import { OrderService } from '../../Service/order.service';
import { ProductService1 } from '../../Service/product1.service';
import { ImageService } from '../../Service/image.service';
import { AuthService } from '../../Service/auth.service';

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
  displayOrderId: number;
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
        const ordersTemp: CustomerOrder[] = res.map((o, index) => ({
          displayOrderId: index + 1,
          orderId: o.orderId,
          customerName: o.customerName,
          customerEmail: o.email || 'N/A',
          customerPhone: o.phone || 'N/A',
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

        const allObservables: Observable<void>[] = [];
        ordersTemp.forEach(order => {
          order.items.forEach(item => {
            const obs = this.productService.getProductById(item.productId).pipe(
              map(prod => {
                item.productName = prod.name ?? 'Unknown';
                item.brand = prod.brand ?? 'Unknown';
                this.imageService.getAllImagesByProductID(item.productId).subscribe({
                  next: (imgs: Image[]) => {
                    if (imgs && imgs.length > 0) item.images = [`data:image/jpeg;base64,${imgs[0].data}`];
                  },
                  error: () => { item.images = ['assets/logo.png']; }
                });
              })
            );
            allObservables.push(obs);
          });
        });

        forkJoin(allObservables).subscribe({
          next: () => {
            this.orders = ordersTemp;
            this.groupOrdersByCustomer();
          },
          error: () => {
            this.orders = ordersTemp;
            this.groupOrdersByCustomer();
          }
        });
      },
      error: err => console.error('Failed to load orders', err)
    });
  }

  private groupOrdersByCustomer(): void {
    const grouped: { [key: string]: CustomerOrder[] } = {};
    this.orders.forEach(order => {
      if (!grouped[order.customerName]) grouped[order.customerName] = [];
      grouped[order.customerName].push(order);
    });
    this.groupedOrders = Object.keys(grouped).map(name => {
      const sampleOrder = grouped[name][0];
      return {
        customerName: name,
        customerEmail: sampleOrder.customerEmail,
        customerPhone: sampleOrder.customerPhone,
        orders: grouped[name]
      };
    });
  }

  toggleItems(order: CustomerOrder): void {
    this.groupedOrders.forEach(cust => cust.orders.forEach(o => { if (o !== order) o.showItems = false; }));
    order.showItems = !order.showItems;
  }

saveStatus(order: CustomerOrder) {
  if (!order.orderId) return;

  this.orderService.updateOrderStatus(order.orderId, order.status).subscribe({
    next: (updatedOrder) => {
      order.editingStatus = false;
      order.status = updatedOrder.status; // TypeScript now knows status exists
      console.log(`Order #${order.displayOrderId} status updated to ${order.status}`);
    },
    error: (err) => {
      console.error(`Failed to update Order #${order.displayOrderId} status`, err);
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


}

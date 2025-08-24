import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../Service/auth.service';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.css']
})
export class OrdersComponent {
  statusOptions = ['Pending', 'Shipped', 'Delivered', 'Cancelled'];

  orders = [
    {
      customerName: 'John Doe',
      email: 'john@example.com',
      phone: '1234567890',
      productName: 'Classic Watch',
      quantity: 2,
      date: new Date(),
      status: 'Pending'
    },
    {
      customerName: 'Sara Awayssa',
      email: 'sara@example.com',
      phone: '9876543210',
      productName: 'Smart Watch',
      quantity: 1,
      date: new Date(),
      status: 'Shipped'
    }
  ];

  canViewOrders = false;
  canEditStatus = false;

  constructor(private authService: AuthService) {}

  ngOnInit() {
    // Determine what the logged-in user can do
    this.canViewOrders = this.authService.hasAnyRole(['SEE_ORDER', 'OWNER', 'UPDATE_ORDER']);
    this.canEditStatus = this.authService.hasAnyRole(['UPDATE_ORDER', 'OWNER']);
  }

  updateStatus(order: any) {
    console.log(`Status for ${order.customerName} changed to ${order.status}`);
    // Call backend API to update the order status here
  }
}

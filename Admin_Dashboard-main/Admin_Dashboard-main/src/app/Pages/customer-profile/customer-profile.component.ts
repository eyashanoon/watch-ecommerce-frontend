import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-customer-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './customer-profile.component.html',
  styleUrls: ['./customer-profile.component.css']
})
export class CustomerProfileComponent {
  editingPassword = false; // initialize here
  showPassword = false;
  showConfirmPassword = false;

  constructor(private router: Router) {}

  user: {
    fullName: string;
    email: string;
    phoneNumber: string;
    password: string;
    confirmPassword: string;
    role: string;
  } | null = {
    fullName: 'John Doe',
    email: 'john@example.com',
    phoneNumber: '+970599999999',
    password: 'password123',
    confirmPassword: 'password123',
    role: 'Customer'
  };

  editMode = false;

  editableUser: {
    fullName: string;
    email: string;
    phoneNumber: string;
    password: string;
    confirmPassword: string;
    role: string;
  } = {
    fullName: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
    role: ''
  };

  enterEditMode(): void {
    if (this.user) {
      this.editableUser = { ...this.user };
      this.editMode = true;
      this.editingPassword = false; // reset editing password flag on edit start
      this.showPassword = false;
      this.showConfirmPassword = false;
    }
  }

  saveChanges(): void {
    // Optional: Add validation to check if password and confirmPassword match when editing password
    if (this.editingPassword && this.editableUser.password !== this.editableUser.confirmPassword) {
      alert("Password and Confirm Password do not match.");
      return;
    }

    this.user = { ...this.editableUser };
    this.editMode = false;
    this.editingPassword = false;
    this.showPassword = false;
    this.showConfirmPassword = false;
    // TODO: Send update to backend via API
  }

  cancelEdit(): void {
    this.editMode = false;
    this.editingPassword = false;
    this.showPassword = false;
    this.showConfirmPassword = false;
  }

  deleteAccount(): void {
    if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      this.user = null;
      // TODO: Delete from backend or localStorage
      this.router.navigate(['/home']);
    }
  }
}

import { Component, AfterViewInit, ElementRef, ViewChild, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../Service/auth.service';

@Component({
  selector: 'app-admin-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-profile.component.html',
  styleUrls: ['./admin-profile.component.css']
})
export class AdminProfileComponent implements AfterViewInit, OnInit {
  @ViewChild('videoRef') videoRef!: ElementRef<HTMLVideoElement>;

  editingPassword = false;
  showPassword = false;
  showConfirmPassword = false;

  loading = true;
  errorMsg = '';

  user: any = null; // profile data
  editMode = false;
  editableUser: any = {};

  constructor(private authService: AuthService, private router: Router) {}

  ngAfterViewInit() {
    if (this.videoRef) {
      const video = this.videoRef.nativeElement;
      video.muted = true;
      video.play().catch(err => console.warn('Video play failed:', err));
    }
  }

  ngOnInit() {
    const idStr = localStorage.getItem("id");
    const idNum = idStr ? Number(idStr) : NaN;

    if (!idStr || isNaN(idNum)) {
      this.errorMsg = 'User ID not found. Please log in again.';
      this.loading = false;
      return;
    }

    this.loading = true;

    this.authService.getAdminById(idNum).subscribe({
      next: (profile) => {
        this.user = profile;
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to get user profile:', err);
        this.errorMsg = 'Failed to load user profile. Please log in again.';
        this.loading = false;
      }
    });
  }

  enterEditMode(): void {
    if (this.user) {
      this.editableUser = { ...this.user };
      this.editMode = true;
      this.editingPassword = false;
      this.showPassword = false;
      this.showConfirmPassword = false;
      this.editableUser.password = '';
      this.editableUser.confirmPassword = '';
    }
  }

  // New reusable validators for email and phone number:
  private isValidEmail(email: string): boolean {
    // Simple email regex similar to Validators.email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private isValidPhone(phone: string): boolean {
    // For example: exactly 10 digits, only numbers
    const phoneRegex = /^\d{10}$/;
    return phoneRegex.test(phone);
  }

  private isValidPassword(password: string): boolean {
    // At least 6 chars, at least one letter and one digit
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d).{6,}$/;
    return passwordRegex.test(password);
  }

  saveChanges(): void {
    // Validate required fields first
    if (!this.editableUser.username || this.editableUser.username.trim().length < 3) {
      alert('Full Name is required and must be at least 3 characters.');
      return;
    }

    if (!this.editableUser.email || !this.isValidEmail(this.editableUser.email)) {
      alert('A valid Email is required.');
      return;
    }

    if (!this.editableUser.phone || !this.isValidPhone(this.editableUser.phone)) {
      alert('Phone number is required and must be exactly 10 digits.');
      return;
    }

    if (this.editingPassword) {
      if (!this.editableUser.password || !this.editableUser.confirmPassword) {
        alert('Password and Confirm Password are required.');
        return;
      }
      if (!this.isValidPassword(this.editableUser.password)) {
        alert('Password must be at least 6 characters and contain at least one letter and one digit.');
        return;
      }
      if (this.editableUser.password !== this.editableUser.confirmPassword) {
        alert('Password and Confirm Password do not match.');
        return;
      }
    const idStr = localStorage.getItem("id");
    const idNum = idStr ? Number(idStr) : NaN;





    
    if (!idStr || isNaN(idNum)) {
      this.errorMsg = 'User ID not found. Please log in again.';
      this.loading = false;
      return;
    }

    this.loading = true;

    const data={
      password:this.editableUser.password

    }

    this.authService.updateAdminProfilePassword(idNum, data).subscribe({
      next: () => {
        this.user = { ...this.editableUser };
        this.editMode = false;
        this.editingPassword = false;
        this.showPassword = false;
        this.showConfirmPassword = false;
        alert('Profile updated successfully.');
        this.loading = false;
      },
      error: (err) => {
        console.error('Update failed:', err);
        alert('Failed to update profile. Please try again.');
        this.loading = false;
      }
    });




    } else {
      // If not editing password, keep old password fields (or clear if needed)
      this.editableUser.password = this.user.password || '';
      this.editableUser.confirmPassword = this.user.confirmPassword || '';
    }

    // Proceed with update API call
    const idStr = localStorage.getItem("id");
    const idNum = idStr ? Number(idStr) : NaN;

    if (!idStr || isNaN(idNum)) {
      this.errorMsg = 'User ID not found. Please log in again.';
      this.loading = false;
      return;
    }

    this.loading = true;

    this.authService.updateAdminProfile(idNum, this.editableUser).subscribe({
      next: () => {
        this.user = { ...this.editableUser };
        this.editMode = false;
        this.editingPassword = false;
        this.showPassword = false;
        this.showConfirmPassword = false;
        alert('Profile updated successfully.');
        this.loading = false;
      },
      error: (err) => {
        console.error('Update failed:', err);
        alert('Failed to update profile. Please try again.');
        this.loading = false;
      }
    });
  }

  cancelEdit(): void {
    this.editMode = false;
    this.editingPassword = false;
    this.showPassword = false;
    this.showConfirmPassword = false;
  }

  cancelPasswordEdit(): void {
    this.editingPassword = false;
    this.editableUser.password = '';
    this.editableUser.confirmPassword = '';
    this.showPassword = false;
    this.showConfirmPassword = false;
  }

  deleteAccount(): void {
    if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {

      const idStr = localStorage.getItem("id");
      const idNum = idStr ? Number(idStr) : NaN;

      if (!idStr || isNaN(idNum)) {
        this.errorMsg = 'User ID not found. Please log in again.';
        this.loading = false;
        return;
      }

      this.loading = true;

      this.authService.deleteAdminProfile(idNum).subscribe({
        next: () => {
          alert('Account deleted successfully.');
          this.authService.logout();
          this.router.navigate(['/home']);
        },
        error: (err) => {
          console.error('Delete failed:', err);
          alert('Failed to delete account. Please try again.');
          this.loading = false;
        }
      });
    }
  }

  goToProducts() {
    this.router.navigate(['/product'], { state: { source: 'dashboard' } });
  }

  goToDashBoard() {
    this.router.navigate(['/admin'], { state: { source: 'dashboard' } });
  }
}

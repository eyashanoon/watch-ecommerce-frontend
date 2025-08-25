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
// at the top of AdminProfileComponent
errorMsg: string = '';

  loading = true;
  user: any = null; // profile data
  editMode = false;
  editableUser: any = {};

  // Toast state
  toastMessage: string = '';
  showToast: boolean = false;

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
      this.showToastMessage('⚠️ User ID not found. Please log in again.');
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
        console.error(err);
        this.showToastMessage('❌ Failed to load user profile. Please log in again.');
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

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private isValidPhone(phone: string): boolean {
    const phoneRegex = /^\d{10}$/;
    return phoneRegex.test(phone);
  }

  private isValidPassword(password: string): boolean {
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d).{6,}$/;
    return passwordRegex.test(password);
  }

  saveChanges(): void {
    // Validate required fields
    if (!this.editableUser.username || this.editableUser.username.trim().length < 3) {
      this.showToastMessage('⚠️ Full Name is required and must be at least 3 characters.');
      return;
    }

    if (!this.editableUser.email || !this.isValidEmail(this.editableUser.email)) {
      this.showToastMessage('⚠️ A valid Email is required.');
      return;
    }

    if (!this.editableUser.phone || !this.isValidPhone(this.editableUser.phone)) {
      this.showToastMessage('⚠️ Phone number must be exactly 10 digits.');
      return;
    }

    const idStr = localStorage.getItem("id");
    const idNum = idStr ? Number(idStr) : NaN;

    if (!idStr || isNaN(idNum)) {
      this.showToastMessage('⚠️ User ID not found. Please log in again.');
      this.loading = false;
      return;
    }

    this.loading = true;

    // Update profile
    this.authService.updateAdminProfile(idNum, {...this.editableUser, newPassword: this.editableUser.password}).subscribe({
      next: (admin: any) => {
        this.showToastMessage('✅ Profile updated successfully.');
        this.user = { ...this.editableUser };
        this.editMode = false;
        this.editingPassword = false;
        this.showPassword = false;
        this.showConfirmPassword = false;
        this.loading = false;
      },
      error: (err) => {
        console.error('Update failed:', err);
        this.showToastMessage('❌ Failed to update profile. Please try again.');
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
    if (!confirm('Are you sure you want to delete your account? This action cannot be undone.')) return;

    const idStr = localStorage.getItem("id");
    const idNum = idStr ? Number(idStr) : NaN;

    if (!idStr || isNaN(idNum)) {
      this.showToastMessage('⚠️ User ID not found. Please log in again.');
      this.loading = false;
      return;
    }

    this.loading = true;

    this.authService.deleteAdminProfile(idNum).subscribe({
      next: () => {
        this.showToastMessage('✅ Account deleted successfully.');
        this.authService.logout();
        setTimeout(() => this.router.navigate(['/home']), 1000);
      },
      error: (err) => {
        console.error('Delete failed:', err);
        this.showToastMessage('❌ Failed to delete account. Please try again.');
        this.loading = false;
      }
    });
  }

  /** TOAST UTILITY */
  showToastMessage(message: string, duration: number = 5000) {
    this.toastMessage = message;
    this.showToast = true;
    setTimeout(() => {
      this.showToast = false;
    }, duration);
  }
}

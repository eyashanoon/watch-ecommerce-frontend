import { Component, ViewChild, ElementRef, AfterViewInit, OnInit } from '@angular/core';
import { NgIf } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../Service/auth.service';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css'],
  imports: [RouterModule, NgIf] // combine them in one array
})

export class AdminDashboardComponent implements AfterViewInit, OnInit {
  sidebarVisible = false;

  constructor(private router: Router, private authService: AuthService) {}

  ngOnInit() {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/sign-in']);
      return;
    }

    // Example: restrict access only to users with at least one admin role
    const allowedRoles = [  'OWNER','ADMIN'];
    if (!this.authService.hasAnyRole(allowedRoles)) {
      alert('You do not have permission to access this page.');
      this.router.navigate(['/home']);
    }
  }

  toggleSidebar() {
    this.sidebarVisible = !this.sidebarVisible;
    console.log('Sidebar toggled:', this.sidebarVisible);
  }

  hasRole(role: string): boolean {
    return this.authService.hasRole(role);
  }

  goToProductPage() {
    this.router.navigate(['/product']);
  }

  goToHomePage() {
    this.router.navigate(['/home']);
  }

  goToOrderPage() {
    this.router.navigate(['/orders']);
  }

  goToReportPage() {
    this.router.navigate(['/report']);
  }

  goToManageAdminsPage() {
    this.router.navigate(['/admin/manage']);
  }

  @ViewChild('backgroundVideo') backgroundVideo!: ElementRef<HTMLVideoElement>;

  ngAfterViewInit() {
    if (this.backgroundVideo) {
      const video = this.backgroundVideo.nativeElement;
      video.muted = true;
      video.play().catch(e => console.warn('Video play error:', e));
    }
  }

  signOut(event: Event) {
    event.preventDefault();
    this.authService.logout();
    this.router.navigate(['/sign-in']);
  }
}

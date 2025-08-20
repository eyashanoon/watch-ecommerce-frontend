// manage-admins.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../Service/admin.service';
import { AuthService } from '../../Service/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-manage-admins',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './manage-admins.component.html',
  styleUrls: ['./manage-admins.component.css']
})
export class ManageAdminsComponent implements OnInit {
  admins: any[] = [];

  constructor(
    private adminService: AdminService, 
    private router: Router,
    public authService: AuthService
  ) {}
canSeeAdmins: boolean = false;
  ngOnInit() {
  this.canSeeAdmins = this.authService.hasAnyRole([
    'SEE_ADMIN',
    'UPDATE_ADMIN',
    'REMOVE_ADMIN', 
    'OWNER'
  ]);

  // Load admins only if permitted
  if (this.canSeeAdmins) {
    this.loadAdmins();
  }

  }

  loadAdmins() {
    console.log('Loading admins...');
    this.adminService.getAllAdmins().subscribe({
      next: (data) => {
        this.admins = data.content || [];
        console.log(this.admins);
      },
      error: (err) => {
        alert('Failed to load admins');
        console.error(err);
      }
    });
  }

  editAdmin(admin: any) {
    this.router.navigate(['/control-admins'], { state: { admin } });
  }

  deleteAdmin(adminId: number) {
    if (!confirm('Are you sure you want to delete this admin?')) return;

    this.adminService.deleteAdmin(adminId).subscribe({
      next: () => {
        alert('Admin deleted successfully');
        this.loadAdmins();
      },
      error: (err) => {
        alert('Failed to delete admin');
        console.error(err);
      }
    });
  }

  goToAddAdmin() {
    this.router.navigate(['/control-admins']);
  }
}

// manage-admins.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../Service/admin.service';
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

  constructor(private adminService: AdminService, private router: Router) {}

  ngOnInit() {
    this.loadAdmins();
  }

  loadAdmins() {
    this.adminService.getAllAdmins().subscribe({
      next: (data) => this.admins = data,
      error: (err) => {
        alert('Failed to load admins');
        console.error(err);
      }
    });
  }

  editAdmin(admin: any) {
    // Use query params or state if needed, here redirecting simply
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

  formatRoles(roles: string[]): string {
    const roleMap: { [key: string]: string } = {
      'ADMIN': 'admin',
      'CONTROLADMINS': 'super admin',
      'CONTROLPRODUCTS': 'products admin',
      'CONTROLORDERSADMIN': 'orders admin',
      'CONTROLCUSTOMERS': 'customers admin'
    };
    return roles.map(r => roleMap[r] || r.toLowerCase()).join(', ');
  }

  goToAddAdmin() {
    this.router.navigate(['/control-admins']);
  }
}

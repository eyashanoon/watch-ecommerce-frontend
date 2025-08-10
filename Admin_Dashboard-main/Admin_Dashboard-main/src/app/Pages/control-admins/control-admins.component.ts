import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AdminService } from '../../Service/admin.service';

@Component({
  selector: 'app-control-admins',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './control-admins.component.html',
  styleUrls: ['./control-admins.component.css']
})
export class ControlAdminsComponent implements OnInit {
  @ViewChild('adminFormSection') adminFormSection!: ElementRef;

  admins: any[] = [];
  editIndex: number | null = null;
  modifyPasswordOnly = false;
  originalAdminData: any = null;

  admin = {
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    roles: [] as string[]
  };

  constructor(
    private router: Router,
    private adminService: AdminService
  ) {}

  ngOnInit() {
    this.loadAdmins();
     const nav = history.state?.admin;
  if (nav) {
    this.editAdminFromState(nav);
  }
  }editAdminFromState(adminData: any) {
  this.admin = {
    username: adminData.username,
    email: adminData.email,
    phone: adminData.phone,
    password: '',
    confirmPassword: '',
    roles: adminData.roles
  };
  this.editIndex = null; // or find index if needed
}

  loadAdmins() {
    this.adminService.getAllAdmins().subscribe({
      next: (data) => {
        console.log('Fetched admins:', data);
        this.admins = data;
      },
      error: (error) => {
        alert('Error loading admins');
        console.error(error);
      }
    });
  }

  allowOnlyNumbers(event: KeyboardEvent) {
    const charCode = event.charCode ? event.charCode : event.keyCode;
    if (charCode < 48 || charCode > 57) {
      event.preventDefault();
    }
  }

  passwordsMatch(): boolean {
    return this.admin.password === this.admin.confirmPassword;
  }

  onSubmit() {
    const isDuplicate = this.isEmailDuplicate(this.admin.email, this.editIndex ?? undefined);
  if (isDuplicate) {
    alert('This email is already used by another admin.');
    return;
  }
    console.log("1"+this.modifyPasswordOnly)
        console.log("n"+this.editIndex)

    if (this.modifyPasswordOnly && this.editIndex !== null) {
      console.log("dvddvdvdvd");

      if (!this.passwordsMatch()) {
        alert("Passwords do not match");
        return;
      }
      if (!this.admin.password || this.admin.password.length < 6) {
        alert("Password must be at least 6 characters");
        return;
      }
      else{
        this.adminService.updateAdminPassword(this.admins[this.editIndex].id , { password: this.admin.password }).subscribe({
          next: () => {
            alert('Password updated successfully');
            this.loadAdmins();
            this.resetForm();
          },
          error: (err) => {
            alert('Failed to update password');
            console.error(err);
          }
        });
        return;
      }
    }

    const adminPayload: any = {
      username: this.admin.username,
      email: this.admin.email,
      phone: this.admin.phone,
      roles: this.admin.roles
    };

    if (this.modifyPasswordOnly && this.admin.password) {
      adminPayload.password = this.admin.password;
    }

    if (this.editIndex !== null) {
      const adminToUpdate = this.admins[this.editIndex];
    
      this.adminService.updateAdmin(adminToUpdate.id, adminPayload).subscribe({
        next: () => {
          alert('Admin updated successfully');
          this.loadAdmins();
          this.resetForm();
        },
        error: (err) => {
          alert('Failed to update admin');
          console.error(err);
        }
      });
    } else {
      if (this.admin.password && this.passwordsMatch()) {
        adminPayload.password = this.admin.password;
      }

      this.adminService.addAdmin(adminPayload).subscribe({
        next: () => {
          alert('Admin added successfully');
          this.loadAdmins();
          this.resetForm();
        },
        error: (err) => {
          alert('Failed to add admin');
          console.error(err);
        }
      });
    }
  }

  editAdmin(index: number) {
    const selected = this.admins[index];
    this.admin = {
      username: selected.username,
      email: selected.email,
      password: '',
      confirmPassword: '',
      phone: selected.phone,
      roles: selected.roles || []
    };
    this.editIndex = index;
    this.modifyPasswordOnly = false;
    this.originalAdminData = null;

    setTimeout(() => {
      this.adminFormSection.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 0);
  }

  deleteAdmin(index: number) {
    if (!confirm('Are you sure you want to delete this admin?')) return;
    const adminToDelete = this.admins[index];
    this.adminService.deleteAdmin(adminToDelete.id).subscribe({
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

  resetForm() {
    this.admin = {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      phone: '',
      roles: []
    };
    this.editIndex = null;
    this.modifyPasswordOnly = false;
    this.originalAdminData = null;
  }

  cancelEdit() {
    this.resetForm();
  }

  goToHomePage() {
    this.router.navigate(['/admin']);
  }

  togglePasswordOnly() {
    if (this.modifyPasswordOnly) {
      // Cancel password edit — restore previous state
      this.modifyPasswordOnly = false;
      if (this.originalAdminData) {
        this.admin = { ...this.originalAdminData };
        this.originalAdminData = null;
      }
    } else {
      // Enable password edit — backup state
      this.modifyPasswordOnly = true;
      this.originalAdminData = { ...this.admin };
      this.admin.password = '';
      this.admin.confirmPassword = '';
    }
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
isEmailDuplicate(email: string, excludeIndex?: number): boolean {
  const trimmedEmail = email.trim().toLowerCase();
  return this.admins.some((admin, index) =>
    admin.email.trim().toLowerCase() === trimmedEmail && index !== excludeIndex
  );
}
  goToManagePage() {
    this.router.navigate(['/admin/manage']);
  }

}

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
  originalEmail: string | null = null;
  modifyPasswordOnly = false;
  originalAdminData: any = null;
  roless: string[] = [];
  admin = {
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    roles: [] as string[]
  };

  // 🔥 Toast state (mirrored from SignInComponent)
  toastMessage: string = '';
  showToast = false;

  constructor(
    private router: Router,
    private adminService: AdminService
  ) {}
 // ✅ Show toast method
  showToastMessage(message: string) {
    this.toastMessage = message;
    this.showToast = true;
    setTimeout(() => {
      this.showToast = false;
    }, 5000);
  }
  ngOnInit() {
     this.adminService.getAllRoles().subscribe({
      next: (roles) => { this.roless = roles;
          this.roless= this.roless.filter(role => (role !== 'CUSTOMER' && role !== 'ADMIN' )); // Exclude 'ADMIN' from the list

       },
      error: (err) => {}});
     
    this.loadAdmins().then(() => {
      const nav = history.state?.admin;
      if (nav) {
        this.editAdminFromState(nav);
      }
 
    });

  }

  // Changed loadAdmins to return a Promise for async sequencing
   loadAdmins(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.adminService.getAllAdmins().subscribe({
        next: (data) => {
          this.admins = data.content;
          resolve();
        },
        error: () => {
          this.showToastMessage('Failed to load admins');
          reject();
        }
      });
    });
  }

  editAdminFromState(adminData: any) {
    this.admin = {
      username: adminData.username,
      email: adminData.email,
      phone: adminData.phone,
      password: '',
      confirmPassword: '',
      roles: adminData.roles || []
    };

    // Find index by id or email
    this.editIndex = this.admins.findIndex(a => a.id === adminData.id || a.email === adminData.email);

    // Store original email for duplicate check
    this.originalEmail = adminData.email.toLowerCase();

    // Scroll to form
    setTimeout(() => {
      this.adminFormSection.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 0);
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
  if (this.isEmailDuplicate(this.admin.email)) {
    this.showToastMessage('This email is already used by another admin.');
    return;
  }

  // Always ensure 'ADMIN' role present
  if (!this.admin.roles.includes('ADMIN')) {
    this.admin.roles.push('ADMIN');
  }

  if (this.editIndex !== null) {
    // Editing existing admin
    const adminToUpdate = this.admins[this.editIndex];
    const adminPayload: any = {
      username: this.admin.username,
      email: this.admin.email,
      phone: this.admin.phone,
      roles: this.admin.roles
    };

    this.adminService.updateAdmin(adminToUpdate.id, adminPayload).subscribe({
      next: () => {
        if (this.admin.password) {
          if (!this.passwordsMatch()) {
            this.showToastMessage("Passwords do not match");
            return;
          }
          if (this.admin.password.length < 6) {
            this.showToastMessage("Password must be at least 6 characters");
            return;
          }
          this.adminService.updateAdminPassword(adminToUpdate.id, { password: this.admin.password }).subscribe({
            next: () => {
              this.showToastMessage('Admin and password updated successfully');
              this.loadAdmins();
              this.resetForm();
            },
            error: (err) => {
              this.showToastMessage('Failed to update password');
              console.error(err);
            }
          });
        } else {
          this.showToastMessage('Admin updated successfully');
          this.loadAdmins();
          this.resetForm();
                  this.goToManagePage();

        }
      },
      error: (err) => {
        this.showToastMessage('Failed to update admin');
        console.error(err);
      }
    });
  } else {
    // Adding new admin
    if (!this.passwordsMatch()) {
      this.showToastMessage("Passwords do not match");
      return;
    }
    if (!this.admin.password || this.admin.password.length < 6) {
      this.showToastMessage("Password must be at least 6 characters");
      return;
    }
    const adminPayload: any = {
      username: this.admin.username,
      email: this.admin.email,
      phone: this.admin.phone,
      roles: this.admin.roles,
      password: this.admin.password
    };

    this.adminService.addAdmin(adminPayload).subscribe({
      next: () => {
         this.showToastMessage('Admin added successfully');
        this.loadAdmins();
        this.router.navigate(['/admin/manage']);
        this.resetForm();
        this.goToManagePage();
      },
      error: (err) => {
         this.showToastMessage('Failed to add admin');
        console.log(adminPayload);
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
    this.originalEmail = selected.email.toLowerCase();

    setTimeout(() => {
      this.adminFormSection.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 0);
  }

  deleteAdmin(index: number) {
    if (!confirm('Are you sure you want to delete this admin?')) return;
    const adminToDelete = this.admins[index];
    this.adminService.deleteAdmin(adminToDelete.id).subscribe({
      next: () => {
         this.showToastMessage('Admin deleted successfully');
        this.loadAdmins();
      },
      error: (err) => {
        this.showToastMessage('Failed to delete admin');
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
    this.originalEmail = null;
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

  isEmailDuplicate(email: string): boolean {
    const trimmedEmail = email.trim().toLowerCase();
    // If editing, exclude the original email
    if (this.originalEmail && trimmedEmail === this.originalEmail) {
      return false; // it's the same email, so no duplicate error
    }
    return this.admins.some(admin =>
      admin.email.trim().toLowerCase() === trimmedEmail
    );
  }

  goToManagePage() {
    this.router.navigate(['/admin/manage']);
  }
}

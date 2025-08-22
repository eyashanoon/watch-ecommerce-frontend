import { Component, AfterViewInit, ElementRef, ViewChild, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../Service/auth.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-customer-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './customer-profile.component.html',
  styleUrls: ['./customer-profile.component.css']
})
export class CustomerProfileComponent implements AfterViewInit, OnInit {
  @ViewChild('videoRef') videoRef!: ElementRef<HTMLVideoElement>;

  editingPassword = false;
  showPassword = false;
  showConfirmPassword = false;

  loading = true;
  errorMsg = '';

  user: any = null; // profile data
  editMode = false;
  editableUser: any = {};

  // ------------------- CARD MANAGEMENT -------------------
myCard: any = {
    cardType: '',
    cardHolderName: '',
    cardNumber: '',
    expirationDate: '',
    cvv: '',
    billingAddress: '',
    postalCode: '',
    expiryDate:"",
    isDefault:false,
    defaultCard: false
  };   
  createdCrd=false;
  createNewCard() {
    const newCard = {
      cardType: this.myCard.cardType,            // must match backend enum (CardType)
      cardHolderName: this.myCard.cardHolderName,
      cardNumber: this.myCard.cardNumber,
      expirationDate: this.myCard.expirationDate,
      expiryDate: this.myCard.expirationDate,

      cvv: this.myCard.cvv,
      billingAddress: '??',
      postalCode: '??',
      defaultCard: true
    };
    console.log('Creating new card:', newCard);
    
    this.authService.createCard(newCard).subscribe({
      next: (response) => {

        console.log('Card created successfully:', response);
        this.createdCrd=true;
      },
      error: (error) => {
        console.error('Error creating card:', error);
      }
    });
  }
getCardInfo() {
  this.authService.getMyCard().subscribe({
    next: (response) => {
      if (response) {
        this.myCard = response;
        this.myCard.expirationDate = this.myCard.expiryDate;
        this.createdCrd = true; // card exists
      } else {
        // fallback for no card
        this.myCard = {
          cardType: '',
          cardHolderName: '',
          cardNumber: '',
          expirationDate: '',
          cvv: '',
          billingAddress: '',
          postalCode: '',
          expiryDate: "",
          isDefault: false,
          defaultCard: false
        };
        this.createdCrd = false; // no card
      }
      console.log('My card info:', this.myCard, 'Card exists:', this.createdCrd);
    },
    error: (error) => {
      console.error('Error fetching card info:', error);
      // fallback to empty card
      this.myCard = {
        cardType: '',
        cardHolderName: '',
        cardNumber: '',
        expirationDate: '',
        cvv: '',
        billingAddress: '',
        postalCode: '',
        expiryDate: "",
        isDefault: false,
        defaultCard: false
      };
      this.createdCrd = false; // treat as no card
    }
  });
}

  constructor(private authService: AuthService, private router: Router) {}

ngAfterViewInit() {
  const video = this.videoRef.nativeElement;
  video.muted = true;
  video.setAttribute('muted', ''); // force attribute in DOM
  video.play().catch(err => console.warn('Video play failed:', err));
}


  ngOnInit() {
    this.createdCrd = false
    const idStr = localStorage.getItem("id");
    const idNum = idStr ? Number(idStr) : NaN;

    if (!idStr || isNaN(idNum)) {
      this.errorMsg = 'User ID not found. Please log in again.';
      this.loading = false;
      return;
    }

    this.loading = true;

    // Load user profile
    this.authService.getCustomerById(idNum).subscribe({
      next: (profile) => {
        this.user = profile;
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.errorMsg = 'Failed to load user profile. Please log in again.';
        this.loading = false;
      }
    });

    // Load user's card
    this.getCardInfo();
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

  // ------------------- CARD METHODS -------------------

  /*updateCardInfo() {
    this.authService.updateCard(this.myCard).subscribe({
      next: (response) => {
        console.log('Card updated successfully:', response);
        alert('Card updated successfully.');
        this.getCardInfo();
      },
      error: (error) => {
        console.error('Error updating card:', error);
        alert('Failed to update card. Please try again.');
      }
    });
  }*/

  // ------------------- PROFILE METHODS -------------------
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

    if (false && this.editingPassword) {
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

    this.authService.updateCustomerPassword(idNum, data).subscribe({
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




    } else if(false ) {
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

    this.authService.updateCustomerProfile(idNum, {...this.editableUser,newPassword:this.editableUser.password}).subscribe({
      next: (customer:any) => {
        alert('Profile updated successfully.');
        this.user = { ...this.editableUser };
        this.editMode = false;
        this.editingPassword = false;
        this.showPassword = false;
        this.showConfirmPassword = false;
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

      this.authService.deleteCustomerProfile(idNum).subscribe({
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
    this.router.navigate(['/customer-dash-board'], { state: { source: 'dashboard' } });
  }

  myCard: any = {
    cardType: '',
    cardHolderName: '',
    cardNumber: '',
    expirationDate: '',
     cvv: '',
    billingAddress: '',
    postalCode: '',
    expiryDate:'',
    isDefault:false,
    defaultCard: false
  };   
  createNewCard() {
    const newCard = {
      cardType: this.myCard.cardType,            // must match backend enum (CardType)
      cardHolderName: this.myCard.cardHolderName,
      cardNumber: this.myCard.cardNumber,
      expirationDate: this.myCard.expirationDate,
      expiryDate: this.myCard.expirationDate,

      cvv: this.myCard.cvv,
      billingAddress: ' ',
      postalCode: ' ',
      defaultCard: true
    };
    
    this.authService.createCard(newCard).subscribe({
      next: (response) => {

        console.log('Card created successfully:', response);
      },
      error: (error) => {
        console.error('Error creating card:', error);
      }
    });
  }
     getCardInfo() {
    this.authService.getMyCard().subscribe({
      next: (response) => {
        this.myCard = response;
        this.myCard.expirationDate=this.myCard.expiryDate;
        console.log('My card info:', this.myCard);
      },
      error: (error) => {
        console.error('Error fetching card info:', error);
      }
    });
  }
}

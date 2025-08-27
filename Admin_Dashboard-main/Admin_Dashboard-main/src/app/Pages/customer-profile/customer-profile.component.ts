import { Component, AfterViewInit, ElementRef, ViewChild, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../Service/auth.service';

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
  flag:boolean=false;

  user: any = null; // profile data
  editMode = false;
  editableUser: any = {};

  // ------------------- CARD MANAGEMENT -------------------
  cardTypes: string[] = ['VISA', 'MASTERCARD'];

  myCard: any = {
    cardType: '',
    cardHolderName: '',
    cardNumber: '',
    expirationDate: '',
    cvv: '',
    billingAddress: '',
    postalCode: '',
    expiryDate: '',
  };
  createdCrd = false;
  showPaymentInfo = false;


  // ------------------- CARD VALIDATORS -------------------
  private isValidCardType(type: string): boolean {
    return !!type && this.cardTypes.includes(type);
  }

  private isValidCardHolderName(name: string): boolean {
    const nameRegex = /^[A-Za-z\s]{3,}$/;
    return nameRegex.test(name || '');
  }

private isValidCardNumber(num: string, type: string): boolean {
  if (!num) return false;

  // Remove spaces or other non-digit characters
  const digits = num.replace(/\D/g, '');

  if (type === 'Visa') return /^4\d{15}$/.test(digits);
  if (type === 'MasterCard')
    return /^(5[1-5]\d{14}|2(2[2-9]\d{12}|[3-6]\d{13}|7[01]\d{12}|720\d{12}))$/.test(digits);

  return /^\d{13,19}$/.test(digits);
}


  private isValidExpiryDate(date: string): boolean {
    const expiryRegex = /^(0[1-9]|1[0-2])\/(\d{2}|\d{4})$/;
    if (!expiryRegex.test(date)) return false;

    const [month, year] = date.split('/');
    const expMonth = parseInt(month, 10);
    const expYear = year.length === 2 ? 2000 + parseInt(year, 10) : parseInt(year, 10);

    const now = new Date();
    const thisMonth = now.getMonth() + 1;
    const thisYear = now.getFullYear();

    return expYear > thisYear || (expYear === thisYear && expMonth >= thisMonth);
  }

  private isValidCVV(cvv: string, type: string): boolean {
    if (type === 'American Express') return /^\d{4}$/.test(cvv);
    return /^\d{3}$/.test(cvv);
  }

  private isValidBillingAddress(address: string): boolean {
    return !!address && address.trim().length >= 5;
  }
  formatCardNumber() {
  if (!this.myCard.cardNumber) return;

  // Remove all non-digit characters
  let digits = this.myCard.cardNumber.replace(/\D/g, '');

  // Limit to max 16 digits
  digits = digits.substring(0, 16);

  // Insert a space every 4 digits
  this.myCard.cardNumber = digits.replace(/(\d{4})(?=\d)/g, '$1 ');
  
  const last4 = this.myCard.cardNumber.slice(-4);
  return '**** **** **** ' + last4;

}
formatCardNumberForView(cardNumber: string): string {
  if (!cardNumber) return '';
  const digits = cardNumber.replace(/\D/g, ''); // remove spaces
  const last4 = digits.slice(-4);
  return '**** **** **** ' + last4;
}

formatExpirationDate() {
  if (!this.myCard.expirationDate) return;

  // Remove non-digits
  let digits = this.myCard.expirationDate.replace(/\D/g, '');

  // Limit to max 4 digits (MMYY)
  digits = digits.substring(0, 4);

  // Add slash after 2 digits
  if (digits.length > 2) {
    this.myCard.expirationDate = digits.substring(0, 2) + '/' + digits.substring(2);
  } else {
    this.myCard.expirationDate = digits;
  }
}
formatExpirationForView(date: string): string {
  if (!date) return '';
  const digits = date.replace(/\D/g, '').substring(0, 4);
  if (digits.length < 3) return digits;
  return digits.substring(0, 2) + '/' + digits.substring(2);
}


  private isValidPostalCode(code: string): boolean {
    const postalRegex = /^[A-Za-z0-9]{3,10}$/;
    return postalRegex.test(code || '');
  }

  // ------------------- CARD METHODS -------------------
  createNewCard() {
    if (!this.isValidCardType(this.myCard.cardType)) {
      this.showToastMessage('Please select a valid card type.');
      return;
    }
    if (!this.isValidCardHolderName(this.myCard.cardHolderName)) {
      this.showToastMessage('Card holder name is required (letters only, min 3 characters).');
      return;
    }
    if (!this.isValidCardNumber(this.myCard.cardNumber, this.myCard.cardType)) {
      this.showToastMessage(`Invalid ${this.myCard.cardType} card number.`);
      return;
    }
    if (!this.isValidExpiryDate(this.myCard.expirationDate)) {
      this.showToastMessage('Please enter a valid expiry date (MM/YY or MM/YYYY, not expired).');
      return;
    }
    if (!this.isValidCVV(this.myCard.cvv, this.myCard.cardType)) {
      this.showToastMessage(
        `${this.myCard.cardType} requires a ${
          this.myCard.cardType === 'American Express' ? '4-digit' : '3-digit'
        } CVV.`
      );
      return;
    }
    if (!this.isValidBillingAddress(this.myCard.billingAddress)) {
      this.showToastMessage('Billing address must be at least 5 characters.');
      return;
    }
    if (!this.isValidPostalCode(this.myCard.postalCode)) {
      this.showToastMessage('Postal code must be 3–10 alphanumeric characters.');
      return;
    }

    const newCard = {
      cardType: this.myCard.cardType,
      cardHolderName: this.myCard.cardHolderName,
      cardNumber: this.myCard.cardNumber,
      expirationDate: this.myCard.expirationDate,
      expiryDate: this.myCard.expirationDate,
      cvv: this.myCard.cvv,
      billingAddress: this.myCard.billingAddress,
      postalCode: this.myCard.postalCode,
    };

    console.log('Creating new card:', newCard);

    this.authService.createCard(newCard).subscribe({
      next: (response) => {
        console.log('Card created successfully:', response);
        this.createdCrd = true;
        this.flag=true;
        const returnUrl = this.route.snapshot.queryParams['returnTo'] || '/';
  this.router.navigateByUrl(returnUrl);
      },
      error: (error) => {
        console.error('Error creating card:', error);
      }
    });
  }

  getCardInfo() {
    this.authService.getMyCard().subscribe({
      next: (response) => {
                 console.log("mm",response)

        if (response) {
          this.flag=true;
          this.myCard = response;
          this.myCard.expirationDate = this.myCard.expiryDate;
          this.createdCrd = true;
          this.myCard.billingAddress = 'abcdefg';
          this.myCard.postalCode = '12345';
        } else {
          this.myCard = {
            cardType: '',
            cardHolderName: '',
            cardNumber: '',
            expirationDate: '',
            cvv: '',
            billingAddress: '',
            postalCode: '',
            expiryDate: '',

          };
          this.createdCrd = false;
        }
        console.log('My card info:', this.myCard, 'Card exists:', this.createdCrd);
      },
      error: (error) => {
        console.error('Error fetching card info:', error);
         this.flag=false;
        this.myCard = {
          cardType: '',
          cardHolderName: '',
          cardNumber: '',
          expirationDate: '',
          cvv: '',
          billingAddress: '',
          postalCode: '',
          expiryDate: '',
        };
        this.createdCrd = false;
      }
    });
  }

  constructor(private authService: AuthService, private router: Router, private route: ActivatedRoute) {}
  toastMessage = '';
  showToast = false;
 showToastMessage(message: string) {
    this.toastMessage = message;
    this.showToast = true;
    setTimeout(() => this.showToast = false, 5000);
  }
  ngAfterViewInit() {
    const video = this.videoRef.nativeElement;
    video.muted = true;
    video.setAttribute('muted', '');
    video.play().catch((err) => console.warn('Video play failed:', err));
  }

ngOnInit() {
  this.createdCrd = false;

  // 1️⃣ Get user ID from localStorage
  const idStr = localStorage.getItem('id');
  const idNum = idStr ? Number(idStr) : NaN;

  if (!idStr || isNaN(idNum)) {
    this.errorMsg = 'User ID not found. Please log in again.';
    this.loading = false;
    return;
  }

  this.loading = true;

  // 2️⃣ Load user profile
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

  // 3️⃣ Load card info
  this.getCardInfo();

  // 4️⃣ Check query params for showPaymentInfo
  this.route.queryParams.subscribe(params => {
    if (params['showPaymentInfo']) {
      this.showPaymentInfo = true;

      // Optional: scroll to the payment section
      setTimeout(() => {
        const el = document.querySelector('.card-container');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 50);
    }
  });
}


  // ------------------- PROFILE VALIDATORS -------------------
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
    if (!this.editableUser.username || this.editableUser.username.trim().length < 3) {
      this.showToastMessage('Full Name is required and must be at least 3 characters.');
      return;
    }

    if (!this.editableUser.email || !this.isValidEmail(this.editableUser.email)) {
      this.showToastMessage('A valid Email is required.');
      return;
    }

    if (!this.editableUser.phone || !this.isValidPhone(this.editableUser.phone)) {
      this.showToastMessage('Phone number is required and must be exactly 10 digits.');
      return;
    }

    if (false && this.editingPassword) {
      if (!this.editableUser.password || !this.editableUser.confirmPassword) {
        this.showToastMessage('Password and Confirm Password are required.');
        return;
      }
      if (!this.isValidPassword(this.editableUser.password)) {
        this.showToastMessage('Password must be at least 6 characters and contain at least one letter and one digit.');
        return;
      }
      if (this.editableUser.password !== this.editableUser.confirmPassword) {
        this.showToastMessage('Password and Confirm Password do not match.');
        return;
      }
      const idStr = localStorage.getItem('id');
      const idNum = idStr ? Number(idStr) : NaN;

      if (!idStr || isNaN(idNum)) {
        this.errorMsg = 'User ID not found. Please log in again.';
        this.loading = false;
        return;
      }

      this.loading = true;

      const data = {
        password: this.editableUser.password
      };

      this.authService.updateCustomerPassword(idNum, data).subscribe({
        next: () => {
          this.user = { ...this.editableUser };
          this.editMode = false;
          this.editingPassword = false;
          this.showPassword = false;
          this.showConfirmPassword = false;
          this.showToastMessage('Profile updated successfully.');
          this.loading = false;
        },
        error: (err) => {
          console.error('Update failed:', err);
          this.showToastMessage('Failed to update profile. Please try again.');
          this.loading = false;
        }
      });
    } else if (false) {
      this.editableUser.password = this.user.password || '';
      this.editableUser.confirmPassword = this.user.confirmPassword || '';
    }

    const idStr = localStorage.getItem('id');
    const idNum = idStr ? Number(idStr) : NaN;

    if (!idStr || isNaN(idNum)) {
      this.errorMsg = 'User ID not found. Please log in again.';
      this.loading = false;
      return;
    }

    this.loading = true;

    this.authService.updateCustomerProfile(idNum, {
      ...this.editableUser,
      newPassword: this.editableUser.password
    }).subscribe({
      next: (customer: any) => {
        this.showToastMessage('Profile updated successfully.');
        this.user = { ...this.editableUser };
        this.editMode = false;
        this.editingPassword = false;
        this.showPassword = false;
        this.showConfirmPassword = false;
        this.loading = false;
      },
      error: (err) => {
        console.error('Update failed:', err);
        this.showToastMessage('Failed to update profile. Please try again.');
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
      const idStr = localStorage.getItem('id');
      const idNum = idStr ? Number(idStr) : NaN;

      if (!idStr || isNaN(idNum)) {
        this.errorMsg = 'User ID not found. Please log in again.';
        this.loading = false;
        return;
      }

      this.loading = true;

      this.authService.deleteCustomerProfile(idNum).subscribe({
        next: () => {
          this.showToastMessage('Account deleted successfully.');
          this.authService.logout();
          this.router.navigate(['/home']);
        },
        error: (err) => {
          console.error('Delete failed:', err);
          this.showToastMessage('Failed to delete account. Please try again.');
          this.loading = false;
        }
      });
    }
  }

  goToProducts() {
    this.router.navigate(['/product'], { state: { source: 'dashboard' } });
  }

  goToDashBoard() {
    this.router.navigate(['/home'], { state: { source: 'dashboard' } });
  }
}

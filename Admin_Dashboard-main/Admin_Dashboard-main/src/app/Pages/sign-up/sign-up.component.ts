import { Component, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  AbstractControl,
  ValidationErrors,
  ValidatorFn,
} from '@angular/forms';
import { CommonModule, NgIf } from '@angular/common';

@Component({
  selector: 'app-sign-up',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, NgIf],
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.css'],
})
export class SignUpComponent implements AfterViewInit {
  SignUpForm: FormGroup;
  toastMessage: string = '';
  showToast = false;

  existingUsers = [
    { username: 'john123', email: 'john@example.com' },
    { username: 'alice', email: 'alice@example.com' },
  ];

  @ViewChild('backgroundVideo') backgroundVideo!: ElementRef<HTMLVideoElement>;

  constructor(private fb: FormBuilder, private router: Router) {
    this.SignUpForm = this.fb.group(
  {
    fullName: ['', [Validators.required, Validators.minLength(3)]],

    email: ['', [Validators.required, Validators.email]],

    phoneNumber: ['', [Validators.required, Validators.pattern(/^\+?\d{7,14}$/)]],

    password: ['', [
      Validators.required,
      Validators.minLength(6),
      Validators.pattern(/^(?=.*[A-Za-z])(?=.*\d).{6,}$/)
    ]],

    confirmPassword: ['', Validators.required]
  },
  { validators: this.passwordMatchValidator }
);

  }

  ngAfterViewInit() {
    const video = this.backgroundVideo.nativeElement;
    video.muted = true;
    video.play().catch((e) => console.warn('Video play error:', e));
  }

  selectUserType(type: 'customer' | 'admin') {
    this.SignUpForm.get('userType')?.setValue(type);
  }

  showToastMessage(message: string) {
    this.toastMessage = message;
    this.showToast = true;
    setTimeout(() => {
      this.showToast = false;
    }, 3000);
  }

  passwordMatchValidator: ValidatorFn = (group: AbstractControl): ValidationErrors | null => {
    const password = group.get('password')?.value;
    const confirm = group.get('confirmPassword')?.value;
    return password === confirm ? null : { mismatch: true };
  };

  usernameTakenValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const username = control.value?.toLowerCase();
      if (this.existingUsers.some((u) => u.username.toLowerCase() === username)) {
        return { usernameTaken: true };
      }
      return null;
    };
  }

  emailTakenValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const email = control.value?.toLowerCase();
      if (this.existingUsers.some((u) => u.email.toLowerCase() === email)) {
        return { emailTaken: true };
      }
      return null;
    };
  }
 
 goToHomePage() {
    this.router.navigate(['/home']);
  }
  checkAndShowFieldError() {
    const controls = this.SignUpForm.controls;

    if (controls['username'].invalid) {
      if (controls['username'].errors?.['required']) {
        this.showToastMessage('Username is required.');
      } else if (controls['username'].errors?.['minlength']) {
        this.showToastMessage('Username must be at least 3 characters.');
      } else if (controls['username'].errors?.['usernameTaken']) {
        this.showToastMessage('Username already taken.');
      }
      return;
    }

    if (controls['email'].invalid) {
      if (controls['email'].errors?.['required']) {
        this.showToastMessage('Email is required.');
      } else if (controls['email'].errors?.['email']) {
        this.showToastMessage('Email format is invalid.');
      } else if (controls['email'].errors?.['emailTaken']) {
        this.showToastMessage('Email already registered.');
      }
      return;
    }

    if (controls['phone'].invalid) {
      if (controls['phone'].errors?.['required']) {
        this.showToastMessage('Phone number is required.');
      } else if (controls['phone'].errors?.['pattern']) {
        this.showToastMessage('Phone number format is invalid.');
      }
      return;
    }

    if (controls['password'].invalid) {
      if (controls['password'].errors?.['required']) {
        this.showToastMessage('Password is required.');
      } else if (controls['password'].errors?.['minlength']) {
        this.showToastMessage('Password must be at least 6 characters.');
      } else if (controls['password'].errors?.['pattern']) {
        this.showToastMessage('Password must contain letters and numbers.');
      }
      return;
    }

    if (controls['confirmPassword'].invalid) {
      if (controls['confirmPassword'].errors?.['required']) {
        this.showToastMessage('Confirm Password is required.');
      }
      return;
    }

    if (this.SignUpForm.errors?.['mismatch']) {
      this.showToastMessage('Passwords do not match.');
      return;
    }

    if (controls['userType'].invalid) {
      this.showToastMessage('Please select a user type.');
      return;
    }

    this.showToastMessage('Please fill out all required fields correctly.');
  }

  onSubmit() {
    if (this.SignUpForm.invalid) {
      this.checkAndShowFieldError();
      return;
    }
  }

  goToSignInPage() {
    this.router.navigate(['/sign-in']);
  }
}

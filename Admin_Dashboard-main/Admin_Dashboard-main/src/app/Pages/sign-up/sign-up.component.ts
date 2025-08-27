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
import { AuthService } from '../../Service/auth.service';

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

  @ViewChild('backgroundVideo') backgroundVideo!: ElementRef<HTMLVideoElement>;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService
  ) {
    this.SignUpForm = this.fb.group(
      {
        username: ['', [Validators.required, Validators.minLength(3)]],
        email: ['', [Validators.required, Validators.email]],
        phone: ['', [Validators.required, Validators.pattern(/^\+?\d{7,14}$/)]],
        password: [
          '',
          [
            Validators.required,
            Validators.minLength(6),
            Validators.pattern(/^(?=.*[A-Za-z])(?=.*\d).{6,}$/),
          ],
        ],
        confirmPassword: ['', Validators.required],
      },
      { validators: this.passwordMatchValidator }
    );
  }

  ngAfterViewInit() {
    const video = this.backgroundVideo.nativeElement;
    video.muted = true;
    video.play().catch((e) => console.warn('Video play error:', e));
  }

  showToastMessage(message: string) {
    this.toastMessage = message;
    this.showToast = true;
    setTimeout(() => {
      this.showToast = false;
    }, 3000);
  }

  passwordMatchValidator: ValidatorFn = (
    group: AbstractControl
  ): ValidationErrors | null => {
    const password = group.get('password')?.value;
    const confirm = group.get('confirmPassword')?.value;
    return password === confirm ? null : { mismatch: true };
  };

  checkAndShowFieldError() {
    const controls = this.SignUpForm.controls;

    if (controls['username'].invalid) {
      if (controls['username'].errors?.['required']) {
        this.showToastMessage('Username is required.');
      } else if (controls['username'].errors?.['minlength']) {
        this.showToastMessage('Username must be at least 3 characters.');
      }
      return;
    }

    if (controls['email'].invalid) {
      if (controls['email'].errors?.['required']) {
        this.showToastMessage('Email is required.');
      } else if (controls['email'].errors?.['email']) {
        this.showToastMessage('Email format is invalid.');
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

    this.showToastMessage('Please fill out all required fields correctly.');
  }

  onSubmit() {
    if (this.SignUpForm.invalid) {
      this.checkAndShowFieldError();
      return;
    }

    // Prepare object for backend (matches CreateCustomerDTO)
    const newCustomer = {
      username: this.SignUpForm.value.username,
      email: this.SignUpForm.value.email,
      password: this.SignUpForm.value.password,
      phone: this.SignUpForm.value.phone,
    };

    this.authService.registerCustomer(newCustomer).subscribe({
      next: (response) => {
        console.log('Registration successful:', response);
        localStorage.setItem('token', response.token);
        this.showToastMessage('Account created & logged in!');
        this.router.navigate(['/home']);
      },
      error: (error) => {
        console.error('Registration failed:', error);
        this.showToastMessage('Failed to register.');
      },
    });
  }

  goToSignInPage() {
    this.router.navigate(['/sign-in']);
  }

}

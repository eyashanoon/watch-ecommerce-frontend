import { Component, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { NgIf } from '@angular/common';
import { Router } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { AuthService } from '../../Service/auth.service';


@Component({
  selector: 'app-sign-in',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, HttpClientModule, NgIf],
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.css']
})
export class SignInComponent implements AfterViewInit {

  signInForm: FormGroup;
  toastMessage: string = '';
  showToast = false;

  @ViewChild('backgroundVideo') backgroundVideo!: ElementRef<HTMLVideoElement>;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService // ✅ Correctly inject AuthService
  ) {
    this.signInForm = this.fb.group({
      username: ['', [Validators.required]],
      password: [
        '',
        [
          Validators.required,
          Validators.minLength(6),
        ]
      ],

    });
  }

  ngAfterViewInit() {
    const video = this.backgroundVideo.nativeElement;
    video.muted = true;
    video.play().catch(e => console.warn('Video play error:', e));
  }

  selectUserType(type: 'customer' | 'admin') {
    this.signInForm.get('userType')?.setValue(type);
  }

  showToastMessage(message: string) {
    this.toastMessage = message;
    this.showToast = true;
    setTimeout(() => {
      this.showToast = false;
    }, 3000);
  }

  checkAndShowFieldError() {
    const { username, password, userType } = this.signInForm.controls;

    if (username.hasError('required')) {
      this.showToastMessage('Username is required.');
    } else if (username.hasError('pattern')) {
      this.showToastMessage('Username must only contain letters, numbers, and underscores.');
    } else if (password.hasError('required')) {
      this.showToastMessage('Password is required.');
    } else if (password.hasError('minlength')) {
      this.showToastMessage('Password must be at least 6 characters.');
    } 
    else {
      this.showToastMessage('Please fill out all required fields.');
    }
  }

onSubmit() {
  if (this.signInForm.invalid) {
    this.checkAndShowFieldError();
    return;
  }

  const { username, password, userType } = this.signInForm.value;

  this.authService.login(username, password).subscribe({
    next: (res: { token: string; roles: string[]; id:number }) => {
 
      if (res.token) {
        this.authService.saveToken(res.token,res.roles , res.id);

        const roles = res.roles?.map(r => r.toUpperCase()) ;

        if (roles.includes('ADMIN')) {
          console.log('Admin logged in');
          this.router.navigate(['/admin']);
        } else if (roles.includes('CUSTOMER')) {
          this.router.navigate(['/home']);
        } else {
          this.showToastMessage('Unknown user role.');
        }
      }
    },
    error: (err: any) => {
      console.error('Login error:', err);
      this.showToastMessage('Login failed. Check your credentials.');
    }
  });
}

  goToHomePage() {
    this.router.navigate(['/home']);
  }

  goToSignUpPage() {
    this.router.navigate(['/sign-up']);
  }
}

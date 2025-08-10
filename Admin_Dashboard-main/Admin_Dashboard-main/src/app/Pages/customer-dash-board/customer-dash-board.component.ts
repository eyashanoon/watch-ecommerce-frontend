import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AfterViewInit, ElementRef, ViewChild } from '@angular/core';

@Component({
  selector: 'app-customer-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './customer-dash-board.component.html',
  styleUrls: ['./customer-dash-board.component.css']
})
export class CustomerDashBoardComponent {
  @ViewChild('videoRef') videoRef!: ElementRef<HTMLVideoElement>;
  
    ngAfterViewInit() {
      const video = this.videoRef.nativeElement;
      video.muted = true;
      video.play().catch(err => {
        console.warn('Video play failed:', err);
      });
    }
  constructor(private router: Router) {}

 goToProducts() {
  this.router.navigate(['/customer-product'], { state: { source: 'dashboard' } });
}
}

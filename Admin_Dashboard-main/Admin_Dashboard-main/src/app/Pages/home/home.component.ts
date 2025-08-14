import { Component, ElementRef, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { Router, NavigationStart } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  imports: []
})
export class HomeComponent implements OnInit, AfterViewInit {

  @ViewChild('backgroundVideo') backgroundVideo!: ElementRef<HTMLVideoElement>;

  showScrollTop = false;
  showCenterContent = true;

  // Lines for the typewriter effect
  aboutLines: string[] = [
    "At La Royale, we merge classic sophistication with modern craftsmanship to deliver timepieces that are more than accessories — they’re legacies. Each watch in our collection is designed with precision and built to withstand the test of time,combining luxurious materials with timeless design."
  ];

  constructor(private router: Router) {}

  ngOnInit() {
    const user = JSON.parse(localStorage.getItem('loggedInUser') || 'null');
    const currentUrl = this.router.url;

    if (user && user.role?.includes('controlAdmins') && currentUrl === '/') {
      this.router.navigate(['/admin-dashboard']);
    }

    this.router.events.subscribe(event => {
      if (event instanceof NavigationStart && event.url === '/') {
        if (user && user.role?.includes('controlAdmins')) {
          this.router.navigate(['/admin-dashboard']);
        }
      }
    });
  }

  ngAfterViewInit() {
    const video = this.backgroundVideo.nativeElement;
    video.muted = true;
    video.play().catch(e => console.warn('Video play error:', e));

    // Listen to window scroll
    window.addEventListener('scroll', () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      this.showScrollTop = scrollTop > 200;
      this.showCenterContent = scrollTop < 50;
    });

    // Start typewriter effect on about section
    this.typewriterLineByLine(this.aboutLines, 'typewriter-container', 20, 400);
  }

  // Line-by-line typewriter effect
  typewriterLineByLine(lines: string[], containerId: string, charDelay = 20, lineDelay = 400) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = ''; // Clear container

    let lineIndex = 0;

    const typeLine = () => {
      if (lineIndex >= lines.length) return; // All lines done

      const line = lines[lineIndex];
      let charIndex = 0;

      // Create a paragraph for current line
      const p = document.createElement('p');
      p.style.margin = '0 0 12px 0';
      p.style.fontSize = '1.2rem';
      p.style.lineHeight = '1.9';
      p.style.color = 'white';
      p.style.textShadow = '0 0 5px rgba(255,255,255,0.7), 0 1px 3px rgba(0,0,0,0.5)';
      container.appendChild(p);

      const timer = setInterval(() => {
        if (charIndex < line.length) {
          p.textContent += line.charAt(charIndex);
          charIndex++;
        } else {
          clearInterval(timer);
          lineIndex++;
          setTimeout(typeLine, lineDelay); // Wait before next line
        }
      }, charDelay);
    };

    typeLine(); // start typing first line
  }

goToProductPage() {
  this.router.navigate(['/product'], { state: { source: 'home' } });
}


  goToSignInPage() {
    this.router.navigate(['/sign-in']);
  }

  goToSignUpPage() {
    this.router.navigate(['/sign-up']);
  }

  scrollToAbout(event: Event) {
    event.preventDefault();
    const element = document.getElementById('about');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

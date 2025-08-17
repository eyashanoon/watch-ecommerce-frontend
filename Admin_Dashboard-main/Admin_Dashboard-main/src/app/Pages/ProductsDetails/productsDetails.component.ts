import { Component, QueryList, ViewChildren, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule, NgIf, NgFor } from '@angular/common'; // <-- add NgIf and NgFor
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ProductService1 } from '../../Service/product1.service';
import { ProductWithImages } from '../../models/product.model';

@Component({
  selector: 'app-productsDetails',
  standalone: true,
  imports: [CommonModule, FormsModule, NgIf, NgFor], // <-- include them here
  templateUrl: './productsDetails.component.html',
  styleUrls: ['./productsDetails.component.css']
})


type Filters = {
 
  name: string;
};
export class ProductsDetailsComponent implements AfterViewInit {
  @ViewChildren('carouselImg') carouselImages!: QueryList<ElementRef<HTMLImageElement>>;
  currentIndex = 0;
  is3DViewActive = false;
  products!: ProductWithImages & { selectedQty: number, colorCombinations:any[] };
  
    filters: Filters = {
 
    name:'',
    }
// <-- fix strict property initialization

  constructor(private router: Router, private productService: ProductService1) {
    const nav = this.router.getCurrentNavigation();
    const stateProduct = nav?.extras?.state?.['product'];

    if (!stateProduct) {
      this.router.navigate(['/']);
      return;
    }

    this.products = stateProduct;
    this.filters.name=this.products.name;
   // this.productService.getAllProducts(this.filters).subscribe()
    this.products.colorCombinations=  [
    { hands: "#000000", background: "#FFFFFF", band: "#FF0000" }, // comp1
    { hands: "#FFD700", background: "#000000", band: "#0000FF" }, // comp2
    { hands: "#FFFFFF", background: "#333333", band: "#008000" }, // comp3
    { hands: "#FF69B4", background: "#F0E68C", band: "#8B4513" }  // comp4
  ]
    if (!this.products.selectedQty) this.products.selectedQty = 1;
  }

  ngAfterViewInit() {
    if (this.is3DViewActive) this.update3DCarousel();

    this.carouselImages.changes.subscribe(() => {
      if (this.is3DViewActive) this.update3DCarousel();
    });
  }

update3DCarousel() {
  if (!this.products?.images?.length) return;

  const total = this.products.images.length;
  const angle = 360 / total;
  const radius = 400; // Can increase to 500 for even bigger spacing

  this.carouselImages.forEach((imgRef, i) => {
    const rotation = angle * i - angle * this.currentIndex;
    const el = imgRef.nativeElement;
    el.style.transform = `rotateY(${rotation}deg) translateZ(${radius}px)`;
    el.style.opacity = '1';
  });
}


nextImage() {
  this.currentIndex = (this.currentIndex + 1) % this.products.images.length;
  if (this.is3DViewActive) this.update3DCarousel();
}

prevImage() {
  this.currentIndex = (this.currentIndex - 1 + this.products.images.length) % this.products.images.length;
  if (this.is3DViewActive) this.update3DCarousel();
}


  toggle3DView() {
    this.is3DViewActive = !this.is3DViewActive;
    setTimeout(() => this.update3DCarousel(), 50);
  }

  selectImage(index: number) {
    this.currentIndex = index;
  }



  signOut() { console.log('Sign out'); }
  goToHomePage() { this.router.navigate(['/product']); }

  editProduct() {
    const encoded = encodeURIComponent(this.products.name);
    this.router.navigate(['/edit-product', encoded]);
  }

  deleteProduct() {
  }
}

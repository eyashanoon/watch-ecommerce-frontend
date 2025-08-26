import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { forkJoin } from 'rxjs';

import { RecommendationService, Recommendation } from '../../Service/recommendation.service';
import { ProductService1 } from '../../Service/product1.service';
import { ImageService } from '../../Service/image.service';
import { Product, ProductWithImages } from '../../models/product.model';
import { Image } from '../../models/Image.model';

@Component({
  selector: 'app-recommendation',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './recommendation.component.html',
  styleUrls: ['./recommendation.component.css']
})
export class RecommendationComponent implements OnInit {

  productMap = new Map<number, { product: Product, images: Image[], currentImageIndex: number }>();
  visibleStartIndex = 0; // index for scrolling 5 products

  constructor(
    private router: Router,
    private recommendationService: RecommendationService,
    private productService1: ProductService1,
    private imageService: ImageService
  ) {}

  ngOnInit(): void {
    this.loadRecommendedProducts();
  }

  loadRecommendedProducts() {
    this.productMap.clear();

    this.recommendationService.getRecommendations().subscribe((recs: Recommendation[]) => {
      if (!recs || recs.length === 0) return;

      // Limit to 5 products
      const recommendedFive = recs.slice(0, 5);

      const productRequests = recommendedFive.map(rec => this.productService1.getProductById(rec.id));
      forkJoin(productRequests).subscribe((products: Product[]) => {
        products.forEach(product => {
          this.productMap.set(product.id, { product, images: [], currentImageIndex: 0 });
        });

        const imageRequests = products.map(product => this.imageService.getAllImagesByProductID(product.id));
        forkJoin(imageRequests).subscribe(imagesArray => {
          imagesArray.forEach((images, index) => {
            const product = products[index];
            const current = this.productMap.get(product.id);
            if (current) {
              this.productMap.set(product.id, { ...current, images });
            }
          });
        });
      });
    });
  }

  get productsWithImages() {
    return Array.from(this.productMap.values()).map(item => ({
      ...item.product,
      images: item.images.map(img => 'data:image/jpeg;base64,' + img.data),
      currentImageIndex: item.currentImageIndex
    }));
  }

  scrollLeft() {
    if (this.visibleStartIndex > 0) this.visibleStartIndex--;
  }

  scrollRight() {
    if (this.visibleStartIndex < Math.max(0, this.productsWithImages.length - 5)) this.visibleStartIndex++;
  }

  scrollImageLeft(product: ProductWithImages, event?: MouseEvent) {
    if (event) event.stopPropagation();
    const pos = this.productMap.get(product.id)?.currentImageIndex || 0;
    this.productMap.get(product.id)!.currentImageIndex = pos <= 0 ? product.images.length - 1 : pos - 1;
  }

  scrollImageRight(product: ProductWithImages, event?: MouseEvent) {
    if (event) event.stopPropagation();
    const pos = this.productMap.get(product.id)?.currentImageIndex || 0;
    this.productMap.get(product.id)!.currentImageIndex = pos >= product.images.length - 1 ? 0 : pos + 1;
  }

  goToProductDetails(product: ProductWithImages): void {
    const encodedName = encodeURIComponent(product.name);
    this.router.navigate(['/admin-product', encodedName], { state: { product } });
  }

  trackByProduct(index: number, product: ProductWithImages): number {
    return product.id;
  }
}

import { Component, QueryList, ViewChildren, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule, NgIf, NgFor } from '@angular/common'; // <-- add NgIf and NgFor
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ProductService1 } from '../../Service/product1.service';
import { ProductWithImages } from '../../models/product.model';
import { AuthService } from '../../Service/auth.service';
import { ImageService } from '../../Service/image.service';
import { Image } from '../../models/Image.model';
import { switchMap, map } from 'rxjs/operators';
 import { WishlistService } from '../../Service/wishlist.service';
 import { CartService } from '../../Service/cart.service';
import { CartDto } from '../../models/cart.model';
import { WishlistDto } from '../../models/wishlist.model';
 

type Filters = {
  maxPrice: number;
  maxQuantity: number;
  maxWeight: number;
  maxSize: number;
  waterProof: boolean;
  includesDate: boolean;
  hasFullNumerals: boolean;
  hasTickingSound: boolean;
  displayType: string;
  bandColor: string;
  handsColor: string;
  backgroundColor: string;
  bandMaterial: string;
  caseMaterial: string;
  brand: string;
  numberingType: string;
  shape: string;
  changeableBand: boolean;
    minPrice?: number;
  minWeight?: number;
  minSize?: number;
  name: string;
};
type ClorCombinations={
  hands:String;
  background:string;
  band:string;
  id:number;
}



@Component({
  selector: 'app-productsDetails',
  standalone: true,
  imports: [CommonModule, FormsModule, NgIf, NgFor], // <-- include them here
  templateUrl: './productsDetails.component.html',
  styleUrls: ['./productsDetails.component.css']
})



export class ProductsDetailsComponent implements AfterViewInit {
  @ViewChildren('carouselImg') carouselImages!: QueryList<ElementRef<HTMLImageElement>>;
  currentIndex = 0;
  is3DViewActive = false;
  products!: ProductWithImages & { selectedQty: number, colorCombinations:ClorCombinations[] };
  loadedImages:any[]=[] ;
  productID:number=0;
  colorCombinations!:ClorCombinations[];
  myWishlistIds!:Set<number>;
 
   constructor(private router: Router, private productService: ProductService1,   public authService: AuthService ,private imageService:ImageService, private wishlistService: WishlistService,
      private cartService: CartService) {
    const nav = this.router.getCurrentNavigation();
    const stateProduct = nav?.extras?.state?.['product'];
    this.productID=stateProduct.id;
    this.loadProduct(this.productID);
    this.loadProductImages(this.productID);
        if (this.authService.isLoggedIn()) {
      this.wishlistService.getMyWishlist().subscribe({
        next: res => {
          if (res?.items) {
            this.myWishlistIds = new Set(
              res.items.map(it => Number(it.productId)).filter(id => !isNaN(id))
            );
          }
        },
        error: err => console.error('Failed to load wishlist', err)
      });
    }

    if (!stateProduct) {
      this.router.navigate(['/']);
      return;
    }
 
   }

    loadProductImages(productId: number): void {
      this.imageService.getAllImagesByProductID(productId).subscribe({
        next: (images: Image[]) => {
           this.loadedImages =  images.map(img => 'data:image/jpeg;base64,' + img.data),
           console.log(this.loadedImages) // store loaded images
        },
        error: (err) => console.error('Failed to load images', err)
      });
    }
    /*
    loadProduct(productId: number): void {
       this.productService.getProductById(productId).subscribe({
        next: (pro: ProductWithImages & { selectedQty: number, colorCombinations:any[] }) => {
           this.products = pro;
           this.productService.getProductByName(pro.name).subscribe({
            next:(pros:ProductWithImages[])=>{
              this.colorCombinations=pros.map(p=>{
                return {
                  hands: p.handsColor, 
                  background: p.backgroundColor,
                   band: p.bandColor,
                   id:p.id 
                }
              })
            }
           })
           
                
           this.products.colorCombinations= this.colorCombinations;

           console.log(this.products);
          /* [
          { hands: "#000000", background: "#FFFFFF", band: "#FF0000",id:0  }, // comp1
          { hands: "#FFD700", background: "#000000", band: "#0000FF",id:1 }, // comp2
          { hands: "#FFFFFF", background: "#333333", band: "#008000",id:2 }, // comp3
          { hands: "#FF69B4", background: "#F0E68C", band: "#8B4513",id:2 }  // comp4
        ]
    
        },
        error: (err) => console.error('Failed to load product', err)
      });
    }
    
    */
   
loadProduct(productId: number): void {
  this.productService.getProductById(productId).pipe(
    switchMap((pro: ProductWithImages & { selectedQty: number }) => 
      this.productService.getProductByName(pro.name).pipe(
        map((pros: ProductWithImages[]) => {
          const colorCombinations = pros.map(p => ({
            hands: p.handsColor,
            background: p.backgroundColor,
            band: p.bandColor,
            id: p.id
          }));

          return { ...pro, colorCombinations }; // merge with main product
        })
      )
    )
  ).subscribe({
    next: (product) => {
      this.products = product;
      console.log(this.products);
    },
    error: (err) => console.error('Failed to load product', err)
  });
}
changeWatchColor(combo: ClorCombinations) {
  this.loadProduct(combo.id);
  this.loadProductImages(combo.id);
  this.productService.getProductById(combo.id).pipe(
    switchMap(product => 
      this.productService.getProductByName(product.name).pipe(
        map(products => {
          const colorCombinations = products.map(p => ({
            hands: p.handsColor,
            background: p.backgroundColor,
            band: p.bandColor,
            id: p.id
          }));
          return { ...product, colorCombinations };
        })
      )
    )
  ).subscribe({
    next: (product) => {
      this.products = product; // update current product
      console.log('Changed watch:', this.products);
    },
    error: err => console.error('Failed to load watch', err)
  });
}

 

  ngAfterViewInit() {
    if (this.is3DViewActive) this.update3DCarousel();

    this.carouselImages.changes.subscribe(() => {
      if (this.is3DViewActive) this.update3DCarousel();
    });

   }
   hasRole(role: string): boolean {
   const roles = this.authService.getUserRoles();
  const normalize = (r: string) => r.toUpperCase().replace('-', '_');
  return roles.some(r => normalize(r) === normalize(role));
}





update3DCarousel() {
  if (!this.loadedImages?.length) return;

  const total = this.loadedImages.length;
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
  console.log("gggggggggg")
  this.currentIndex = (this.currentIndex + 1) % this.loadedImages.length;
  if (this.is3DViewActive) this.update3DCarousel();


 }

prevImage() {
  this.currentIndex = (this.currentIndex - 1 + this.loadedImages.length) % this.loadedImages.length;
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
  const encoded = encodeURIComponent(this.products.id);
  this.router.navigate(['/product/edit', encoded]);   // ✅ correct route
}

  deleteProduct() {
  }

 
 
addToCart(product: ProductWithImages & { selectedQty: number }) {
  product.selectedQty =1;
  if (!product.selectedQty || product.selectedQty < 1) {
    alert('Please select a quantity of at least 1.');
    return;
  }


  this.cartService.addToCart([{ productId: product.id, quantity: product.selectedQty }])
    .subscribe({
      next: res => {
        console.log('[Cart Debug] Added to cart:', res);
        alert(`${product.name} added to cart (Qty: ${product.selectedQty})`);
        product.selectedQty = 1;
      },
      error: err => {
        console.error('[Cart Debug] Failed to add to cart:', err);
        alert('Failed to add product to cart. See console for details.');
      }
    });
}
addToWishlist(products:any){

}

isInWishlist(): boolean {
  if (!this.products?.id) return false;
  return this.myWishlistIds.has(Number(this.products.id));
}

toggleWishlist() {
  if (!this.products?.id || !this.authService.isLoggedIn()) return;

  const pid = Number(this.products.id);
  const inList = this.myWishlistIds.has(pid);

  const obs = inList
    ? this.wishlistService.removeFromWishlist([pid])
    : this.wishlistService.addToWishlist([pid]);

  obs.subscribe({
    next: () => {
      // Reload wishlist directly from database
      this.wishlistService.getMyWishlist().subscribe({
        next: res => {
          this.myWishlistIds = new Set(
            res.items?.map(it => Number(it.productId)).filter(id => !isNaN(id)) || []
          );
        },
        error: err => console.error('Failed to reload wishlist', err)
      });

      alert(`${this.products?.name} ${inList ? 'removed from' : 'added to'} wishlist.`);
    },
    error: err => {
      console.error('Wishlist operation failed', err);
      alert('Wishlist operation failed.');
    }
  });
}

 
 }
 
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormArray, AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ProductService1 } from '../../Service/product1.service';
import { ImageService } from '../../Service/image.service';
import { FeaturesService, ColorsResponse } from '../../Service/features.service';
import { Image } from '../../models/Image.model';

// Validator: at least one image
export const atLeastOneImage: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const array = control as FormArray;
  return array && array.length > 0 ? null : { required: true };
};

@Component({
  selector: 'app-add-product',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './add-product.component.html',
  styleUrls: ['./add-product.component.css']
})
export class AddProductComponent implements OnInit {
  watchForm!: FormGroup;
  imageFiles: File[] = [];           // newly selected files
  loadedImages: Image[] = [];        // URLs loaded from server
  deletedImageIds: number[] = [];    // track images marked for deletion
  mode: 'add' | 'edit' = 'add';
  productId?: string;

  availableColors: string[] = [];
  bandColors: string[] = [];
  handsColors: string[] = [];
  backgroundColors: string[] = [];
  availableBrands: string[] = [];
  bandMaterials: string[] = [];
  caseMaterials: string[] = [];
  displayTypes: string[] = [];
  numberingTypes: string[] = [];
  shapes: string[] = [];

  submitted = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private productService: ProductService1,
    private featuresService: FeaturesService,
    private imageService: ImageService
  ) {}

  ngOnInit(): void {
    this.loadFeatures();
    this.productId = this.route.snapshot.paramMap.get('id') ?? undefined;
    console.log('Product ID:', this.productId);
    this.initializeForm();
    if (this.productId) {
      this.mode = 'edit';
      this.loadProductForEdit(this.productId);
    }
  }

  initializeForm(): void {
    this.watchForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(15)]],
      price: [0, [Validators.required, Validators.min(0.01)]],
      quantity: [0, [Validators.required, Validators.pattern(/^\d{1,15}$/)]],
      size: [0, [Validators.required, Validators.min(0.01)]],
      weight: [0, [Validators.required, Validators.min(0.01)]],
      description: ['', Validators.required],
      brand: ['', Validators.required],
      displayType: ['', Validators.required],
      shape: ['', Validators.required],
      bandColor: ['', Validators.required],
      handsColor: ['', Validators.required],
      backgroundColor: ['', Validators.required],
      bandMaterial: ['', Validators.required],
      caseMaterial: ['', Validators.required],
      numberingFormat: ['', Validators.required],
      waterProof: [null, Validators.required],
      includesDate: [null, Validators.required],
      hasFullNumerals: [null, Validators.required],
      changeableBand: [null, Validators.required],
      hasTickingSound: [null, Validators.required],
      images: this.fb.array([], atLeastOneImage),
      discount: [0],
      discountPrice: [0]
    });
  }

  get images(): FormArray {
    return this.watchForm.get('images') as FormArray;
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      Array.from(input.files).forEach(file => {
        this.imageFiles.push(file);
        const url = URL.createObjectURL(file);
        this.images.push(this.fb.control(url));
      });
      input.value = '';
    }
  }

  removeImage(index: number): void {
    if (index < this.loadedImages.length) {
      // Existing image marked for deletion
      const img = this.loadedImages[index];
      this.deletedImageIds.push(img.id);
      this.loadedImages.splice(index, 1);
    } else {
      // Newly added (not yet uploaded)
      this.imageFiles.splice(index - this.loadedImages.length, 1);
    }
    this.images.removeAt(index);
  }

  loadFeatures() {
    this.featuresService.getAllColors().subscribe((colorsObj: ColorsResponse) => {
      this.handsColors = colorsObj.Hands.map(c => c.trim());
      this.backgroundColors = colorsObj.Background.map(c => c.trim());
      this.bandColors = colorsObj.Band.map(c => c.trim());
      this.availableColors = Array.from(new Set(Object.values(colorsObj).flat().map(c => c.trim())));
    });
    this.featuresService.getAllBrands().subscribe(brands => this.availableBrands = brands);
    this.featuresService.getAllBands().subscribe(band => this.bandMaterials = band);
    this.featuresService.getAllCases().subscribe(cases => this.caseMaterials = cases);
    this.featuresService.getAllDisplay_types().subscribe(DisplayTypes => this.displayTypes = DisplayTypes);
    this.featuresService.getAllNumbering_formats().subscribe(numberingTypes => this.numberingTypes = numberingTypes);
    this.featuresService.getAllShapes().subscribe(shapes => this.shapes = shapes);
  }

  loadProductImages(productId: number): void {
    this.imageService.getAllImagesByProductID(productId).subscribe({
      next: (images: Image[]) => {
        this.images.clear(); // clear existing FormArray
        this.loadedImages = images; // store loaded images
        images.forEach(img => {
          const dataUrl = `data:image/jpeg;base64,${img.data}`;
          this.images.push(this.fb.control(dataUrl));
        });
      },
      error: (err) => console.error('Failed to load images', err)
    });
  }

  loadProductForEdit(id: string): void {
    this.productService.getProductById(id).subscribe({
      next: (product: any) => {
        this.watchForm.patchValue({
          name: product.name,
          price: product.originalPrice,
          quantity: product.quantity,
          size: product.size,
          weight: product.weight,
          description: product.description,
          brand: product.brand,
          displayType: product.displayType,
          shape: product.shape,
          bandColor: product.bandColor,
          handsColor: product.handsColor,
          backgroundColor: product.backgroundColor,
          bandMaterial: product.bandMaterial,
          caseMaterial: product.caseMaterial,
          numberingFormat: product.numberingFormat,
          waterProof: product.waterProof,
          includesDate: product.includesDate,
          hasFullNumerals: product.hasFullNumerals,
          changeableBand: product.changeableBand,
          hasTickingSound: product.hasTickingSound,
          discount: product.discount || 0,
          discountPrice: product.discountPrice || 0
        });
      },
      error: err => {
        console.error('Failed to load product', err);
        alert('Could not load product for editing.');
        this.router.navigate(['/product']);
      }
    });

    this.loadProductImages(Number(id));
  }

  prepareFormData(): FormData {
    const formData = new FormData();
    const formValue = this.watchForm.value;

    Object.entries(formValue).forEach(([key, value]) => {
      if (key !== 'images') {
        formData.append(key, value?.toString() ?? '');
      }
    });

    this.imageFiles.forEach(file => formData.append('images', file));

    return formValue;
  }

  onSubmit(): void {
    this.submitted = true;
    this.watchForm.markAllAsTouched();

    if (this.watchForm.invalid) {
      this.scrollToFirstInvalidControl();
      return;
    }

    const formData = this.prepareFormData();

    if (this.mode === 'add') {
      this.productService.addProduct(formData).subscribe({
        next: (product: any) => {
          const uploadObservables = this.imageFiles.map(file =>
            this.imageService.addImageToProduct(product.id, file)
          );
          uploadObservables.forEach(obs => obs.subscribe());
          alert('Product added successfully!');
          this.resetForm();
          this.router.navigate(['/product']);
        },
        error: err => console.error('Error adding product:', err)
      });
    } else {
                console.log('Updating product with ID:', formData);
      this.productService.updateProduct(this.productId!, formData).subscribe({
        next: () => {
          // Upload new images
          this.imageFiles.forEach(file => {
            this.imageService.addImageToProduct(Number(this.productId), file).subscribe({
              next: img => {
                const dataUrl = `data:image/jpeg;base64,${img.data}`;
                this.images.push(this.fb.control(dataUrl));
                this.loadedImages.push(img);
              },
              error: err => console.error('Failed to upload image', err)
            });
          });

          // Delete images marked for deletion
          this.deletedImageIds.forEach(id => {
            this.imageService.deleteImage(id).subscribe({
              next: () => console.log('Deleted image', id),
              error: err => console.error('Failed to delete image', err)
            });
          });

          this.imageFiles = [];
          this.deletedImageIds = [];
          this.loadProductForEdit(this.productId!);
        },
        error: err => {
          console.error('Error updating product:', err);
          alert('Failed to update product. Please try again later.');
        }
      });
    }
  }

  resetForm(): void {
    this.watchForm.reset();
    this.images.clear();
    this.imageFiles = [];
    this.deletedImageIds = [];
    this.watchForm.patchValue({ changeableBand: true, discount: 0, discountPrice: 0 });
  }

  cancelAndReset(): void {
    this.resetForm();
    this.router.navigate(['/product']);
  }

  allowNumbersAndDot(event: KeyboardEvent, currentValue: any) {
    const char = event.key;
    if (['Backspace', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(char)) return;
    if (char === '.' && String(currentValue).includes('.')) {
      event.preventDefault();
      return;
    }
    if (!/\d/.test(char) && char !== '.') event.preventDefault();
  }

  allowOnlyNumbers(event: KeyboardEvent) {
    const char = event.key;
    if (['Backspace', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(char)) return;
    if (!/\d/.test(char)) event.preventDefault();
  }

  scrollToFirstInvalidControl() {
    setTimeout(() => {
      const firstInvalid: HTMLElement | null = document.querySelector(
        'form .ng-invalid, form .images-invalid, form .ng-invalid input, form .ng-invalid select, form .ng-invalid textarea'
      ) as HTMLElement;

      if (firstInvalid) {
        firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
        firstInvalid.classList.add('shake');
        firstInvalid.focus({ preventScroll: true });

        setTimeout(() => firstInvalid.classList.remove('shake'), 500);
      }
    }, 0);
  }
}

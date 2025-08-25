import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from "../environments/environment";

// Base API URL
const API_URL = environment.apiBaseUrl + '/api/product/image';

@Injectable({
  providedIn: 'root'
})
export class ImageService {
  constructor(private http: HttpClient) {}

  // Auth headers if needed
  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('authToken');
    return new HttpHeaders({
      // Do NOT set Content-Type here for multipart/form-data; browser will set it
      Authorization: `Bearer ${token || ''}`
    });
  }

  // Get all images for a product
  getAllImagesByProductID(productId: number): Observable<any[]> {
    return this.http.get<any[]>(`${API_URL}/product/${productId}`, {
      headers: this.getAuthHeaders()
    });
  }

  // Add an image to a product
  addImageToProduct(productId: number, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('ProductId', productId.toString());
    formData.append('image', file);

    return this.http.post<any>(`${API_URL}`, formData, {
      headers: this.getAuthHeaders() // do NOT include Content-Type; browser handles it
    });
  }

  // Delete an image by its ID
  deleteImage(imageId: number): Observable<any> {
    console.log('Deleting image with ID:', imageId);
    return this.http.delete(`${API_URL}/${imageId}`, {
      headers: this.getAuthHeaders()
    });
  }
}
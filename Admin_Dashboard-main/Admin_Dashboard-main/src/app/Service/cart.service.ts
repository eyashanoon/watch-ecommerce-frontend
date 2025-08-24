import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CartDto, CartItem } from '../models/cart.model';
import { AuthService } from './auth.service';
import { HttpHeaders } from '@angular/common/http';
import { CartItemWithImages } from '../Pages/cart/cart.component';
import { throwError, catchError } from 'rxjs';
import { map } from 'rxjs/operators';
 import { environment } from "../../app/environments/environment";


@Injectable({
  providedIn: 'root'
})

export class CartService {
  private apiUrl = environment.apiBaseUrl +'/api/carts';

  constructor(private http: HttpClient, private authService: AuthService) {}


  /** Build HTTP headers with JWT token */
  private makeHeaders(): { headers?: HttpHeaders } {
    const token = this.authService.getToken();
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    });
    // minimal debug to help trace auth issues
    console.log('[CartService] makeHeaders token present?', !!token);
    return { headers };
  }


  addToCart(items: { productId: number; quantity: number }[]): Observable<CartDto> {
  const token = this.authService.getToken();
  if (!token) {
    console.error('[CartService] No JWT token found!');
    throw new Error('Not authenticated');
  }

  console.log('[CartService] JWT Token:', token);
  console.log('[CartService] Adding items:', items);

  const headers = new HttpHeaders({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`
  });

  return this.http.put<CartDto>(
    `${this.apiUrl}/add`,
    items, // send array of {productId, quantity} in body
    { headers }
  );
}


removeFromCart(items: { productId: number; quantity?: number }[] | number[]): Observable<CartDto> {
  const token = this.authService.getToken();
  if (!token) {
    console.error('[CartService] removeFromCart called without auth token');
    return throwError(() => ({ status: 401, message: 'Not authenticated' }));
  }

  // Normalize to array of objects { productId, quantity }
  const payload = Array.isArray(items)
    ? typeof items[0] === 'number'
      ? (items as number[]).map(id => ({ productId: id, quantity: 1 }))
      : (items as { productId: number; quantity?: number }[]).map(i => ({ productId: i.productId, quantity: i.quantity ?? 1 }))
    : [{ productId: items as number, quantity: 1 }];

  console.log('[CartService] Removing items (body style):', payload);

  const headers = new HttpHeaders({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`
  });

  return this.http.put<CartDto>(`${this.apiUrl}/remove`, payload, { headers }).pipe(
    map(resp => {
      console.log('[CartService] remove response:', resp);
      return resp;
    }),
    catchError(err => {
      console.error('[CartService] removeFromCart error:', err);
      return throwError(() => err);
    })
  );
}



  // Optionally get wishlist of another customer
  geCarttByCustomer(username: string): Observable<CartDto> {
  return this.http.get<CartDto>(`${this.apiUrl}/customer/${username}`, this.makeHeaders());
  }


updateCartQuantity(items: { productId: number; quantity: number }[]): Observable<CartDto> {
  const token = this.authService.getToken();
  const headers = new HttpHeaders({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`
  });
  return this.http.put<CartDto>(`${this.apiUrl}/update-quantity`, items, { headers });
}

getMyCart(): Observable<CartDto> {
  console.log('Fetching wishlist from server...');
  return this.http.get<CartDto>(`${this.apiUrl}/me`, this.makeHeaders());
}





}
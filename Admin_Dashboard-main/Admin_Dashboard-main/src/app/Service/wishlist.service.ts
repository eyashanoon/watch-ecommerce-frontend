import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { WishlistDto, WishlistItem } from '../models/wishlist.model';
import { AuthService } from './auth.service';
import { HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class WishlistService {
  private apiUrl = 'http://10.10.33.90:8080/api/wishlist';

  constructor(private http: HttpClient, private authService: AuthService) {}

  // Get my wishlist
  private makeHeaders(): { headers?: HttpHeaders } {
    const token = this.authService.getToken();
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    });
    return { headers };
  }

  // Add products to wishlist. Accept either an array of product IDs or a WishlistItem (or array).
   // Add products to wishlist
  addToWishlist(productIds: number[]): Observable<WishlistDto> {
    let params = new HttpParams();
    productIds.forEach(id => {
      params = params.append('item', id.toString()); // matches @RequestParam("item") List<Long> item
    });

    return this.http.put<WishlistDto>(
      `${this.apiUrl}/add`,
      null,               // no body required
      { ...this.makeHeaders(), params }
    );
  }


  
  // Remove products from wishlist. Accept same payload shapes as addToWishlist.
  removeFromWishlist(payload: number[] | WishlistItem | WishlistItem[]): Observable<WishlistDto> {
    let ids: number[] = [];
    if (Array.isArray(payload)) {
      if (payload.length === 0) ids = [];
      else if (typeof (payload[0] as any) === 'number') ids = (payload as number[]);
      else ids = (payload as WishlistItem[]).map(p => Number(p.productId));
    } else if (typeof payload === 'number') {
      ids = [payload as unknown as number];
    } else {
      ids = [Number((payload as WishlistItem).productId)];
    }

  let params = new HttpParams();
  ids.forEach(id => params = params.append('item', id.toString()));
  const removeOptions = { params, headers: this.makeHeaders().headers } as { params: HttpParams; headers?: HttpHeaders };
  return this.http.put<WishlistDto>(`${this.apiUrl}/remove`, null, removeOptions);
  }

  // Optionally get wishlist of another customer
  getWishlistByCustomer(username: string): Observable<WishlistDto> {
  return this.http.get<WishlistDto>(`${this.apiUrl}/customer/${username}`, this.makeHeaders());
  }
  getMyWishlist(): Observable<any> {
    console.log('Fetching wishlist from server...');
    // Fetch the current user's wishlist
  return this.http.get<WishlistDto>(`${this.apiUrl}/me`, this.makeHeaders());
}

}

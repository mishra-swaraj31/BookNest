import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Property, Booking, User } from '../models/property.model';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = 'http://localhost:8000'; // FastAPI backend URL

  constructor(private http: HttpClient) { }

  // Property endpoints
  getAllProperties(): Observable<Property[]> {
    return this.http.get<Property[]>(`${this.apiUrl}/properties`);
  }

  getProperty(id: string): Observable<Property> {
    return this.http.get<Property>(`${this.apiUrl}/properties/${id}`);
  }

  searchProperties(query: string): Observable<Property[]> {
    return this.http.get<Property[]>(`${this.apiUrl}/properties?search=${query}`);
  }

  filterProperties(
    priceMin?: number,
    priceMax?: number,
    minRating?: number,
    propertyTypes?: {[key: string]: boolean},
    amenities?: {[key: string]: boolean}
  ): Observable<Property[]> {
    let queryParams = [];
    
    if (priceMin !== undefined) queryParams.push(`priceMin=${priceMin}`);
    if (priceMax !== undefined) queryParams.push(`priceMax=${priceMax}`);
    if (minRating !== undefined) queryParams.push(`minRating=${minRating}`);
    
    if (propertyTypes) {
      const propertyTypesStr = Object.entries(propertyTypes)
        .map(([key, value]) => `${key}:${value}`)
        .join(',');
      queryParams.push(`propertyTypes=${propertyTypesStr}`);
    }
    
    if (amenities) {
      const amenitiesStr = Object.entries(amenities)
        .map(([key, value]) => `${key}:${value}`)
        .join(',');
      queryParams.push(`amenities=${amenitiesStr}`);
    }
    
    const queryString = queryParams.length > 0 ? `?${queryParams.join('&')}` : '';
    return this.http.get<Property[]>(`${this.apiUrl}/properties${queryString}`);
  }

  // Booking endpoints
  createBooking(booking: Booking): Observable<Booking> {
    return this.http.post<Booking>(`${this.apiUrl}/bookings`, booking);
  }

  getBooking(id: string): Observable<Booking> {
    return this.http.post<Booking>(`${this.apiUrl}/bookings/${id}`, {});
  }

  getBookingByReference(reference: string): Observable<Booking> {
    return this.http.get<Booking>(`${this.apiUrl}/bookings/reference/${reference}`);
  }

  getAllBookings(): Observable<Booking[]> {
    return this.http.get<Booking[]>(`${this.apiUrl}/bookings`);
  }

  // User endpoints
  registerUser(user: User & { password: string }): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/users`, user);
  }

  login(email: string, password: string): Observable<{ access_token: string, token_type: string }> {
    const formData = new FormData();
    formData.append('username', email); // OAuth2 uses 'username' field
    formData.append('password', password);
    return this.http.post<{ access_token: string, token_type: string }>(`${this.apiUrl}/users/token`, formData);
  }

  getCurrentUser(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/users/me`);
  }

  updateUser(userData: Partial<User>): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/users/me`, userData);
  }
}
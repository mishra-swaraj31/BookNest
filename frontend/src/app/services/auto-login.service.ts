import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AutoLoginService {
  private defaultEmail = 'sophia.smith@example.com';
  private defaultPassword = 'password123';
  
  constructor(
    private apiService: ApiService,
    private router: Router
  ) {}
  
  /**
   * Automatically logs in the default user
   */
  autoLogin(): void {
    // Check if already logged in
    const token = localStorage.getItem('access_token');
    if (token) {
      console.log('User already logged in');
      return;
    }
    
    console.log('Auto-logging in default user...');
    this.apiService.login(this.defaultEmail, this.defaultPassword).subscribe({
      next: (response: { access_token: string, token_type: string }) => {
        // Store the token in local storage
        localStorage.setItem('access_token', response.access_token);
        console.log('Auto-login successful');
      },
      error: (error: any) => {
        console.error('Auto-login error:', error);
      }
    });
  }
}
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Navbar } from '../../components/navbar/navbar';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, Navbar, RouterModule, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  errorMessage: string = '';
  isLoading: boolean = false;
  
  constructor(
    private apiService: ApiService,
    private router: Router
  ) {}
  
  login(): void {
    this.errorMessage = '';
    this.isLoading = true;
    
    if (!this.email || !this.password) {
      this.errorMessage = 'Please enter both email and password';
      this.isLoading = false;
      return;
    }
    
    this.apiService.login(this.email, this.password).subscribe({
      next: (response: { access_token: string, token_type: string }) => {
        // Store the token in local storage
        localStorage.setItem('access_token', response.access_token);
        
        // Redirect to home page
        this.router.navigate(['/']);
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Login error:', error);
        this.errorMessage = error.error?.detail || 'Invalid email or password';
        this.isLoading = false;
      }
    });
  }
}
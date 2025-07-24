import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Navbar } from '../../components/navbar/navbar';
import { ApiService } from '../../services/api.service';
import { User } from '../../models/property.model';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, Navbar, RouterModule, FormsModule],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class RegisterComponent {
  user = {
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    country: '',
    address: '',
    city: '',
    state: '',
    zipCode: ''
  };
  
  errorMessage: string = '';
  isLoading: boolean = false;
  passwordMismatch: boolean = false;
  
  constructor(
    private apiService: ApiService,
    private router: Router
  ) {}
  
  register(): void {
    this.errorMessage = '';
    this.isLoading = true;
    
    // Check if passwords match
    if (this.user.password !== this.user.confirmPassword) {
      this.errorMessage = 'Passwords do not match';
      this.passwordMismatch = true;
      this.isLoading = false;
      return;
    }
    
    this.passwordMismatch = false;
    
    // Create user object to send to API
    const newUser = {
      id: crypto.randomUUID(), // Generate a random UUID for the user
      firstName: this.user.firstName,
      lastName: this.user.lastName,
      email: this.user.email,
      password: this.user.password,
      phone: this.user.phone,
      country: this.user.country,
      address: this.user.address,
      city: this.user.city,
      state: this.user.state,
      zipCode: this.user.zipCode,
      profileImage: 'assets/profile.png' // Default profile image
    };
    
    this.apiService.registerUser(newUser).subscribe({
      next: (response: User) => {
        // Registration successful, redirect to login
        this.router.navigate(['/login']);
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Registration error:', error);
        this.errorMessage = error.error?.detail || 'Registration failed. Please try again.';
        this.isLoading = false;
      }
    });
  }
}
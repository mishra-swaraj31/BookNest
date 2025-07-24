import { Component, OnInit } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';
import { User } from '../../models/property.model';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class Navbar implements OnInit {
  isLoggedIn = false;
  currentUser: User | null = null;
  
  constructor(
    private apiService: ApiService,
    private router: Router
  ) {}
  
  ngOnInit(): void {
    this.checkLoginStatus();
  }
  
  checkLoginStatus(): void {
    // Check if token exists in local storage
    const token = localStorage.getItem('access_token');
    
    if (token) {
      this.isLoggedIn = true;
      this.loadUserProfile();
    }
  }
  
  loadUserProfile(): void {
    this.apiService.getCurrentUser().subscribe({
      next: (user) => {
        this.currentUser = user;
      },
      error: (error) => {
        console.error('Error loading user profile:', error);
        this.logout(); // Token might be invalid, logout
      }
    });
  }
  
  logout(): void {
    localStorage.removeItem('access_token');
    this.isLoggedIn = false;
    this.currentUser = null;
    this.router.navigate(['/']);
  }
}

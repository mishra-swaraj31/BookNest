import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { User } from '../../models/property.model';
import { Subscription } from 'rxjs';
import { AutoLoginService } from '../../services/auto-login.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class Navbar implements OnInit {
  isLoggedIn = true; // Always show as logged in
  currentUser: User | null = null;
  
  constructor(
    private apiService: ApiService,
    private router: Router,
    private autoLoginService: AutoLoginService
  ) {}
  
  ngOnInit(): void {
    this.checkLoginStatus();
  }
  
  checkLoginStatus(): void {
    // Always consider the user as logged in for demo purposes
    this.isLoggedIn = true;
    this.loadUserProfile();
    
    // Ensure we have a token (auto-login if needed)
    const token = localStorage.getItem('access_token');
    if (!token) {
      this.autoLoginService.autoLogin();
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
    // For demo purposes, we'll just reload the page
    // which will trigger auto-login again
    window.location.reload();
  }
}

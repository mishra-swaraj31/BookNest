import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Navbar } from '../../components/navbar/navbar';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [Navbar, FormsModule, CommonModule, RouterModule],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home {
  searchQuery: string = '';
  
  constructor(private router: Router) {}
  
  search(): void {
    if (this.searchQuery.trim()) {
      this.router.navigate(['/search'], { queryParams: { location: this.searchQuery } });
    }
  }
}

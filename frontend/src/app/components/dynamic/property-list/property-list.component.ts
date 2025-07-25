import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DynamicComponent } from '../../base/dynamic-component';
import { Property } from '../../../models/property.model';
import { ApiService } from '../../../services/api.service';

@Component({
  selector: 'app-dynamic-property-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './property-list.component.html',
  styleUrl: './property-list.component.css'
})
export class DynamicPropertyListComponent extends DynamicComponent implements OnInit {
  properties: Property[] = [];
  filteredProperties: Property[] = [];
  displayedProperties: Property[] = [];
  
  // Configuration properties
  title: string = '';
  subtitle: string = '';
  layout: 'grid' | 'list' = 'grid';
  columns: number = 3;
  showFilters: boolean = false;
  showPagination: boolean = true;
  itemsPerPage: number = 10;
  currentPage: number = 1;
  totalPages: number = 1;
  
  // Filter properties
  searchQuery: string = '';
  sortOption: 'price-asc' | 'price-desc' | 'rating-desc' = 'rating-desc';
  priceMin: number = 0;
  priceMax: number = 1000;
  minRating: number = 0;
  
  isLoading: boolean = true;
  error: string | null = null;
  
  constructor(private apiService: ApiService, cdr: ChangeDetectorRef) {
    super(cdr);
  }
  
  override ngOnInit(): void {
    super.ngOnInit();
    this.loadProperties();
  }
  
  override initializeComponent(): void {
    this.title = this.getConfigValue('title', '');
    this.subtitle = this.getConfigValue('subtitle', '');
    this.layout = this.getConfigValue('layout', 'grid');
    this.columns = this.getConfigValue('columns', 3);
    this.showFilters = this.getConfigValue('showFilters', false);
    this.showPagination = this.getConfigValue('showPagination', true);
    this.itemsPerPage = this.getConfigValue('itemsPerPage', 10);
    
    // Get filter values from config
    this.searchQuery = this.getConfigValue('searchQuery', '');
    this.sortOption = this.getConfigValue('sortOption', 'rating-desc');
    this.priceMin = this.getConfigValue('priceMin', 0);
    this.priceMax = this.getConfigValue('priceMax', 1000);
    this.minRating = this.getConfigValue('minRating', 0);
  }
  
  private loadProperties(): void {
    this.isLoading = true;
    this.error = null;
    
    if (this.searchQuery) {
      this.apiService.searchProperties(this.searchQuery).subscribe({
        next: (properties) => this.handlePropertiesLoaded(properties),
        error: (err) => this.handleError(err)
      });
    } else {
      this.apiService.getAllProperties().subscribe({
        next: (properties) => this.handlePropertiesLoaded(properties),
        error: (err) => this.handleError(err)
      });
    }
  }
  
  private handlePropertiesLoaded(properties: Property[]): void {
    this.properties = properties;
    this.applyFilters();
    this.isLoading = false;
    
    // Trigger change detection
    if (this.cdr) {
      this.cdr.markForCheck();
      this.cdr.detectChanges();
    }
  }
  
  private handleError(err: any): void {
    console.error('Error loading properties:', err);
    this.error = `Failed to load properties: ${err.message}`;
    this.isLoading = false;
    
    // Trigger change detection
    if (this.cdr) {
      this.cdr.markForCheck();
      this.cdr.detectChanges();
    }
  }
  
  applyFilters(): void {
    // Filter properties based on criteria
    this.filteredProperties = this.properties.filter(property => {
      return property.price >= this.priceMin && 
             property.price <= this.priceMax &&
             property.rating >= this.minRating;
    });
    
    // Apply sorting
    this.applySorting();
    
    // Update pagination
    this.totalPages = Math.ceil(this.filteredProperties.length / this.itemsPerPage);
    this.currentPage = 1;
    this.updateDisplayedProperties();
    
    // Trigger change detection
    if (this.cdr) {
      this.cdr.markForCheck();
      this.cdr.detectChanges();
    }
  }
  
  applySorting(): void {
    this.filteredProperties.sort((a, b) => {
      switch (this.sortOption) {
        case 'price-asc':
          return a.price - b.price;
        case 'price-desc':
          return b.price - a.price;
        case 'rating-desc':
        default:
          return b.rating - a.rating;
      }
    });
  }
  
  updateDisplayedProperties(): void {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.displayedProperties = this.filteredProperties.slice(startIndex, endIndex);
    
    // Trigger change detection
    if (this.cdr) {
      this.cdr.markForCheck();
      this.cdr.detectChanges();
    }
  }
  
  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updateDisplayedProperties();
      
      // Trigger change detection
      if (this.cdr) {
        this.cdr.markForCheck();
        this.cdr.detectChanges();
      }
    }
  }
  
  get paginationArray(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }
  
  get gridClasses(): string {
    return `row row-cols-1 row-cols-md-${this.columns} g-4`;
  }
}
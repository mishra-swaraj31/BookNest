import { Component, OnInit, AfterViewInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Property } from '../../models/property.model';  
import { Navbar } from "../../components/navbar/navbar";
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-search-results',
  standalone: true,
  imports: [Navbar, CommonModule, FormsModule, RouterModule],
  templateUrl: './search-results.html',
  styleUrl: './search-results.css'
})
export class SearchResultsComponent implements OnInit, AfterViewInit {
  properties: Property[] = [];
  searchQuery: string = '';
  filteredProperties: Property[] = [];
  displayedProperties: Property[] = [];
  sortOption: 'price-asc' | 'price-desc' | 'rating-desc' = 'rating-desc';
  
  // Pagination
  currentPage: number = 1;
  itemsPerPage: number = 5;
  totalPages: number = 1;
  
  // Filters
  priceMin: number = 50;
  priceMax: number = 500;
  propertyTypes: {[key: string]: boolean} = {
    hotel: true,
    apartment: true,
    villa: true,
    resort: true
  };
  amenities: {[key: string]: boolean} = {
    wifi: false,
    pool: false,
    parking: false,
    aircon: false,
    gym: false
  };
  minRating: number = 0;
  
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private apiService: ApiService
  ) {}

  ngOnInit() {
    // Get the location query parameter
    this.route.queryParams.subscribe(params => {
      this.searchQuery = params['location'] || 'Paris';
      this.filterProperties();
    });
    
    // Load properties from API
    this.apiService.getAllProperties().subscribe({
      next: (data) => {
        this.properties = data;
        this.filterProperties();
      },
      error: (error) => {
        console.error('Error fetching properties:', error);
        // Fallback to local data if API fails
        import('../../data/properties.json').then(data => {
          this.properties = data.default;
          this.filterProperties();
        });
      }
    });
  }
  
  // Call this after component view is initialized to update displayed properties
  ngAfterViewInit(): void {
    this.updateDisplayedProperties();
  }
  
  filterProperties(): void {
    // If we have a search query, use the API search endpoint
    if (this.searchQuery.trim()) {
      this.apiService.searchProperties(this.searchQuery).subscribe({
        next: (data) => {
          this.filteredProperties = this.applyLocalFilters(data);
          this.totalPages = Math.ceil(this.filteredProperties.length / this.itemsPerPage);
          this.currentPage = 1; // Reset to first page when filters change
          this.updateDisplayedProperties();
        },
        error: (error) => {
          console.error('Error searching properties:', error);
          // Fallback to local filtering
          this.applyLocalFiltering();
        }
      });
    } else {
      // Use the API filter endpoint
      this.apiService.filterProperties(
        this.priceMin,
        this.priceMax,
        this.minRating,
        this.propertyTypes,
        this.amenities
      ).subscribe({
        next: (data) => {
          // Apply sorting locally
          this.filteredProperties = this.applySorting(data);
          this.totalPages = Math.ceil(this.filteredProperties.length / this.itemsPerPage);
          this.currentPage = 1; // Reset to first page when filters change
          this.updateDisplayedProperties();
        },
        error: (error) => {
          console.error('Error filtering properties:', error);
          // Fallback to local filtering
          this.applyLocalFiltering();
        }
      });
    }
  }
  
  // Apply filters locally (fallback method)
  applyLocalFiltering(): void {
    let filtered = [...this.properties];
    
    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(property => 
        property.location.toLowerCase().includes(query) ||
        property.title.toLowerCase().includes(query)
      );
    }
    
    // Filter by price range
    filtered = filtered.filter(property => 
      property.price >= this.priceMin && property.price <= this.priceMax
    );
    
    // Filter by property type
    if (!this.propertyTypes['hotel'] && !this.propertyTypes['apartment'] && 
        !this.propertyTypes['villa'] && !this.propertyTypes['resort']) {
      // If no property types are selected, don't filter by type
    } else {
      filtered = filtered.filter(property => {
        const title = property.title?.toLowerCase() || '';
        if (title.includes('hotel') && this.propertyTypes['hotel']) return true;
        if (title.includes('apartment') && this.propertyTypes['apartment']) return true;
        if (title.includes('villa') && this.propertyTypes['villa']) return true;
        if (title.includes('resort') && this.propertyTypes['resort']) return true;
        return false;
      });
    }
    
    // Filter by amenities
    const selectedAmenities = Object.entries(this.amenities)
      .filter(([_, selected]) => selected)
      .map(([key, _]) => key);
    
    if (selectedAmenities.length > 0) {
      filtered = filtered.filter(property => {
        const propertyAmenities = property.amenities?.map(a => a.toLowerCase()) || [];
        return selectedAmenities.every(amenity => {
          if (amenity === 'wifi') return propertyAmenities.some(a => a.includes('wifi') || a.includes('internet'));
          if (amenity === 'pool') return propertyAmenities.some(a => a.includes('pool') || a.includes('swimming'));
          if (amenity === 'parking') return propertyAmenities.some(a => a.includes('parking'));
          if (amenity === 'aircon') return propertyAmenities.some(a => a.includes('air') || a.includes('conditioning') || a.includes('ac'));
          if (amenity === 'gym') return propertyAmenities.some(a => a.includes('gym') || a.includes('fitness'));
          return false;
        });
      });
    }
    
    // Filter by rating
    if (this.minRating > 0) {
      filtered = filtered.filter(property => property.rating >= this.minRating);
    }
    
    // Apply sorting
    this.filteredProperties = this.applySorting(filtered);
    
    // Update pagination
    this.totalPages = Math.ceil(this.filteredProperties.length / this.itemsPerPage);
    this.currentPage = 1; // Reset to first page when filters change
    this.updateDisplayedProperties();
  }
  
  // Apply local filters to properties
  applyLocalFilters(properties: Property[]): Property[] {
    let filtered = [...properties];
    
    // Apply remaining filters (price, property type, amenities, rating)
    // Filter by price range
    filtered = filtered.filter(property => 
      property.price >= this.priceMin && property.price <= this.priceMax
    );
    
    // Apply other filters as in applyLocalFiltering
    // ...
    
    return this.applySorting(filtered);
  }
  
  // Apply sorting to properties
  applySorting(properties: Property[]): Property[] {
    const sorted = [...properties];
    switch (this.sortOption) {
      case 'price-asc':
        sorted.sort((a, b) => (a.price || 0) - (b.price || 0));
        break;
      case 'price-desc':
        sorted.sort((a, b) => (b.price || 0) - (a.price || 0));
        break;
      case 'rating-desc':
        sorted.sort((a, b) => b.rating - a.rating);
        break;
    }
    return sorted;
  }
  
  sortProperties(): void {
    switch (this.sortOption) {
      case 'price-asc':
        this.filteredProperties.sort((a, b) => (a.price || 0) - (b.price || 0));
        break;
      case 'price-desc':
        this.filteredProperties.sort((a, b) => (b.price || 0) - (a.price || 0));
        break;
      case 'rating-desc':
        this.filteredProperties.sort((a, b) => b.rating - a.rating);
        break;
    }
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.filterProperties();
  }
  
  search(): void {
    this.filterProperties();
    
    // Update the URL with the search query
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { location: this.searchQuery },
      queryParamsHandling: 'merge'
    });
  }
  
  setSortOption(option: 'price-asc' | 'price-desc' | 'rating-desc'): void {
    this.sortOption = option;
    this.sortProperties();
    this.updateDisplayedProperties();
  }
  
  updateDisplayedProperties(): void {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.displayedProperties = this.filteredProperties.slice(startIndex, endIndex);
  }
  
  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updateDisplayedProperties();
    }
  }
  
  applyFilters(): void {
    this.filterProperties();
  }
  
  clearFilters(): void {
    this.priceMin = 50;
    this.priceMax = 500;
    this.propertyTypes = {
      hotel: true,
      apartment: true,
      villa: true,
      resort: true
    };
    this.amenities = {
      wifi: false,
      pool: false,
      parking: false,
      aircon: false,
      gym: false
    };
    this.minRating = 0;
    this.filterProperties();
  }
}

import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DynamicComponent } from '../../base/dynamic-component';

@Component({
  selector: 'app-dynamic-search',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './search.component.html',
  styleUrl: './search.component.css'
})
export class DynamicSearchComponent extends DynamicComponent {
  searchQuery: string = '';
  placeholder: string = 'Search...';
  buttonText: string = 'Search';
  searchRoute: string = '/search';
  searchParam: string = 'location';
  showIcon: boolean = true;
  size: 'small' | 'medium' | 'large' = 'medium';
  
  constructor(private router: Router, cdr: ChangeDetectorRef) {
    super(cdr);
  }
  
  override initializeComponent(): void {
    this.placeholder = this.getConfigValue('placeholder', 'Search...');
    this.buttonText = this.getConfigValue('buttonText', 'Search');
    this.searchRoute = this.getConfigValue('searchRoute', '/search');
    this.searchParam = this.getConfigValue('searchParam', 'location');
    this.showIcon = this.getConfigValue('showIcon', true);
    this.size = this.getConfigValue('size', 'medium');
  }
  
  search(): void {
    if (this.searchQuery.trim()) {
      const queryParams: any = {};
      queryParams[this.searchParam] = this.searchQuery;
      this.router.navigate([this.searchRoute], { queryParams });
      
      // Trigger change detection
      if (this.cdr) {
        this.cdr.markForCheck();
        this.cdr.detectChanges();
      }
    }
  }
  
  clearSearch(): void {
    this.searchQuery = '';
    
    // Trigger change detection
    if (this.cdr) {
      this.cdr.markForCheck();
      this.cdr.detectChanges();
    }
  }
  
  get searchClasses(): string {
    const classes = ['dynamic-search'];
    
    if (this.size) {
      classes.push(`search-${this.size}`);
    }
    
    return classes.join(' ');
  }
}
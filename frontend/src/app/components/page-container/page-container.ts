import { Component, OnInit, ViewChild, ViewContainerRef, Input, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ComponentRendererService } from '../../config/component-renderer.service';
import { PageConfigService } from '../../config/page-config';
import { ActivatedRoute, Router } from '@angular/router';
import { Navbar } from '../navbar/navbar';
import { Title } from '@angular/platform-browser';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-page-container',
  standalone: true,
  imports: [CommonModule, Navbar],
  templateUrl: './page-container.html',
  styleUrl: './page-container.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PageContainerComponent implements OnInit {
  @ViewChild('dynamicComponentContainer', { read: ViewContainerRef, static: true })
  container!: ViewContainerRef;
  
  @Input() pageId: string = '';
  pageConfig: any = null;
  pageData: any = {};
  isLoading: boolean = true;
  error: string | null = null;
  routeParams: any = {};
  queryParams: any = {};
  
  constructor(
    private componentRenderer: ComponentRendererService,
    private pageConfigService: PageConfigService,
    private route: ActivatedRoute,
    private router: Router,
    private titleService: Title,
    private apiService: ApiService,
    private cdr: ChangeDetectorRef
  ) {}
  
  ngOnInit(): void {
    // Get route and query parameters
    this.route.paramMap.subscribe(params => {
      // Convert ParamMap to a simple object
      params.keys.forEach(key => {
        this.routeParams[key] = params.get(key);
      });
      this.loadPage();
      this.cdr.markForCheck();
    });
    
    this.route.queryParamMap.subscribe(params => {
      // Convert QueryParamMap to a simple object
      params.keys.forEach(key => {
        this.queryParams[key] = params.get(key);
      });
      this.loadPage();
      this.cdr.markForCheck();
    });
    
    // If pageId is not provided, try to get it from the route data
    if (!this.pageId) {
      this.route.data.subscribe(data => {
        if (data['pageId']) {
          this.pageId = data['pageId'];
          this.loadPage();
        } else {
          this.error = 'No page ID provided';
          this.isLoading = false;
          this.cdr.markForCheck();
        }
      });
    } else {
      this.loadPage();
    }
  }
  
  private loadPage(): void {
    this.isLoading = true;
    this.error = null;
    this.cdr.markForCheck();
    
    // Load page configuration
    this.pageConfigService.getPageConfig(this.pageId).subscribe({
      next: (config) => {
        if (!config) {
          this.error = `Failed to load configuration for page '${this.pageId}'`;
          this.isLoading = false;
          this.cdr.markForCheck();
          return;
        }
        
        this.pageConfig = config;
        
        // Set page title if provided
        if (config.title) {
          this.titleService.setTitle(config.title);
        }
        
        // Load additional data if needed based on the page type
        this.loadPageData();
      },
      error: (err) => {
        console.error('Error loading page configuration:', err);
        this.error = `Failed to load page '${this.pageId}': ${err.message}`;
        this.isLoading = false;
        this.cdr.markForCheck();
      }
    });
  }
  
  private loadPageData(): void {
    // Load specific data based on the page type
    switch (this.pageId) {
      case 'property-details':
        if (this.routeParams['id']) {
          this.apiService.getProperty(this.routeParams['id']).subscribe({
            next: (property) => {
              this.pageData = { property };
              this.renderPage();
            },
            error: (err) => {
              console.error('Error loading property data:', err);
              this.error = `Failed to load property data: ${err.message}`;
              this.isLoading = false;
              this.cdr.markForCheck();
            }
          });
        } else {
          this.error = 'No property ID provided';
          this.isLoading = false;
          this.cdr.markForCheck();
        }
        break;
        
      case 'search-results':
        if (this.queryParams['location']) {
          this.apiService.searchProperties(this.queryParams['location']).subscribe({
            next: (properties) => {
              this.pageData = { properties, searchQuery: this.queryParams['location'] };
              this.renderPage();
            },
            error: (err) => {
              console.error('Error loading search results:', err);
              this.error = `Failed to load search results: ${err.message}`;
              this.isLoading = false;
              this.cdr.markForCheck();
            }
          });
        } else {
          // If no search query, load all properties
          this.apiService.getAllProperties().subscribe({
            next: (properties) => {
              this.pageData = { properties };
              this.renderPage();
            },
            error: (err) => {
              console.error('Error loading properties:', err);
              this.error = `Failed to load properties: ${err.message}`;
              this.isLoading = false;
              this.cdr.markForCheck();
            }
          });
        }
        break;
        
      default:
        // For pages that don't need specific data
        this.renderPage();
        break;
    }
  }
  
  private renderPage(): void {
    if (!this.pageConfig) {
      this.isLoading = false;
      return;
    }
    
    this.container.clear();
    
    // Combine route params, query params, and page data
    const data = {
      ...this.pageData,
      routeParams: this.routeParams,
      queryParams: this.queryParams
    };
    
    // Render each component defined in the page configuration
    if (this.pageConfig.components && Array.isArray(this.pageConfig.components)) {
      this.pageConfig.components.forEach((componentConfig: any) => {
        // Process component config to replace template variables with actual data
        const processedConfig = this.pageConfigService.processConfigWithData(
          componentConfig.config, 
          data
        );
        
        this.componentRenderer.renderComponent(
          this.container, 
          componentConfig.type, 
          processedConfig,
          data
        );
      });
    }
    
    this.isLoading = false;
    this.cdr.markForCheck();
    // Force change detection to run
    this.cdr.detectChanges();
  }
  
  // Public method to navigate to home page
  navigateToHome(): void {
    this.router.navigate(['/']);
  }
}
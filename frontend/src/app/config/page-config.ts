import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class PageConfigService {
  constructor(private http: HttpClient) {}

  /**
   * Load page configuration from JSON file
   * @param pageName The name of the page to load configuration for
   * @returns Observable of the page configuration
   */
  getPageConfig(pageId: string): Observable<any> {
    // First try the assets location
    return this.http.get<any>(`assets/app/config/pages/${pageId}.json`).pipe(
      catchError(error => {
        console.log(`Trying fallback location for ${pageId}...`);
        // Try app/config location if the first one fails
        return this.http.get<any>(`app/config/pages/${pageId}.json`).pipe(
          catchError(fallbackError => {
            // If both fail, try one more location
            return this.http.get<any>(`assets/config/pages/${pageId}.json`).pipe(
              catchError(finalError => {
                console.error(`Error loading configuration for ${pageId}:`, finalError);
                // Create a basic configuration to prevent errors
                if (pageId === 'home' || pageId === 'search-results') {
                  console.log(`Creating default configuration for ${pageId}`);
                  return of(this.getDefaultConfig(pageId));
                }
                return of(null);
              })
            );
          })
        );
      })
    );
  }

  /**
   * Get component configuration based on component type
   * @param componentType The type of component to get configuration for
   * @returns Observable of the component configuration
   */
  getComponentConfig(componentType: string): Observable<any> {
    return this.http.get<any>(`assets/app/config/components/${componentType}.json`).pipe(
      catchError(error => {
        // Try fallback location if the first one fails
        return this.http.get<any>(`app/config/components/${componentType}.json`).pipe(
          catchError(fallbackError => {
            console.error(`Error loading component configuration for ${componentType}:`, fallbackError);
            return of(null);
          })
        );
      })
    );
  }
  
  /**
   * Process a configuration object to replace template variables with actual data
   * @param config The configuration object to process
   * @param data The data to use for variable replacement
   * @returns The processed configuration object
   */
  /**
   * Get default configuration for a page when JSON file cannot be loaded
   * @param pageId The ID of the page to get default configuration for
   * @returns A basic configuration object for the page
   */
  private getDefaultConfig(pageId: string): any {
    if (pageId === 'home') {
      return {
        title: 'StayFinder - Find Your Perfect Stay',
        components: [
          {
            type: 'header',
            config: {
              title: 'Find Your Perfect Stay',
              subtitle: 'Discover amazing properties at the best prices',
              size: 'large',
              alignment: 'center'
            }
          },
          {
            type: 'search',
            config: {
              placeholder: 'Where are you going?',
              buttonText: 'Search',
              searchRoute: '/search',
              searchParam: 'location',
              showIcon: true,
              size: 'large'
            }
          },
          {
            type: 'property-list',
            config: {
              title: 'Featured Properties',
              subtitle: 'Handpicked properties for an unforgettable experience',
              layout: 'grid',
              columns: 3,
              showFilters: false,
              showPagination: true,
              itemsPerPage: 6
            }
          }
        ]
      };
    } else if (pageId === 'search-results') {
      return {
        title: 'StayFinder - Search Results',
        components: [
          {
            type: 'header',
            config: {
              title: 'Search Results',
              subtitle: 'All Properties',
              size: 'medium',
              alignment: 'left'
            }
          },
          {
            type: 'search',
            config: {
              placeholder: 'Change location',
              buttonText: 'Search',
              searchRoute: '/search',
              searchParam: 'location',
              showIcon: true,
              size: 'medium'
            }
          },
          {
            type: 'property-list',
            config: {
              layout: 'grid',
              columns: 3,
              showFilters: true,
              showPagination: true,
              itemsPerPage: 9
            }
          }
        ]
      };
    }
    return null;
  }

  processConfigWithData(config: any, data: any): any {
    if (!config || !data) return config;
    
    const processValue = (value: any): any => {
      if (typeof value === 'string' && value.includes('{{') && value.includes('}}')) {
        return value.replace(/\{\{([^}]+)\}\}/g, (match, path) => {
          const keys = path.trim().split('.');
          let result = data;
          
          for (const key of keys) {
            if (result === undefined || result === null) return match;
            result = result[key];
          }
          
          return result !== undefined ? result : match;
        });
      } else if (Array.isArray(value)) {
        return value.map(item => processValue(item));
      } else if (typeof value === 'object' && value !== null) {
        return processConfigWithData(value, data);
      }
      
      return value;
    };
    
    const processConfigWithData = (obj: any, data: any): any => {
      const result: any = {};
      
      for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
          result[key] = processValue(obj[key]);
        }
      }
      
      return result;
    };
    
    return processConfigWithData(config, data);
  }
}
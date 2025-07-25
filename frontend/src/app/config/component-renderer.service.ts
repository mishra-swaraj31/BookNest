import { Injectable, ViewContainerRef, Type, ComponentRef, ChangeDetectorRef } from '@angular/core';
import { PageConfigService } from './page-config';
import { ComponentRegistry } from './component-registry';
import { DynamicComponent } from '../components/base/dynamic-component';

@Injectable({
  providedIn: 'root'
})
export class ComponentRendererService {
  constructor(
    private pageConfigService: PageConfigService,
    private componentRegistry: ComponentRegistry
  ) {}

  /**
   * Get a component by its type using the ComponentRegistry
   * @param componentType The type identifier for the component
   * @returns The component class or undefined if not found
   */
  private getComponent(componentType: string): Type<DynamicComponent> | undefined {
    return this.componentRegistry.getComponent(componentType);
  }

  /**
   * Render a component in the specified container
   * @param container The container to render the component in
   * @param componentType The type identifier for the component
   * @param config The configuration for the component
   * @returns The component reference or null if component not found
   */
  renderComponent(container: ViewContainerRef, componentType: string, config: any, data?: any): ComponentRef<DynamicComponent> | null {
    const componentClass = this.getComponent(componentType);
    
    if (!componentClass) {
      console.error(`Component type '${componentType}' not registered`);
      return null;
    }

    const componentRef = container.createComponent(componentClass);
    const instance = componentRef.instance;
    
    // Set the configuration and data on the component
    instance.config = config;
    
    if (data) {
      instance.data = data;
    }
    
    // Initialize the component
    instance.ngOnInit();
    
    // Mark for check to ensure change detection runs
    if (componentRef.changeDetectorRef) {
      componentRef.changeDetectorRef.markForCheck();
      componentRef.changeDetectorRef.detectChanges();
    }
    
    return componentRef;
  }

  /**
   * Render a page based on its configuration
   * @param container The container to render the page in
   * @param pageName The name of the page to render
   */
  renderPage(container: ViewContainerRef, pageId: string, routeParams?: any, queryParams?: any): void {
    this.pageConfigService.getPageConfig(pageId).subscribe(pageConfig => {
      if (!pageConfig) {
        console.error(`No configuration found for page '${pageId}'`);
        return;
      }

      container.clear();
      
      // Prepare data object with route and query parameters
      const data = {
        routeParams: routeParams || {},
        queryParams: queryParams || {}
      };
      
      // Render each component defined in the page configuration
      pageConfig.components.forEach((componentConfig: any) => {
        this.renderComponent(
          container, 
          componentConfig.type, 
          componentConfig.config,
          data
        );
      });
    });
  }
}
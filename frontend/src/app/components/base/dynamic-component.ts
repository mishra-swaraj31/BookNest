import { Input, OnInit, OnChanges, SimpleChanges, Directive, ChangeDetectorRef } from '@angular/core';

@Directive()
export class DynamicComponent implements OnInit, OnChanges {
  @Input() config: any;
  @Input() data: any;
  
  constructor(protected cdr?: ChangeDetectorRef) {}
  
  ngOnInit(): void {
    this.initializeComponent();
  }
  
  ngOnChanges(changes: SimpleChanges): void {
    // If config or data changes, reinitialize the component
    if ((changes['config'] && !changes['config'].firstChange) || 
        (changes['data'] && !changes['data'].firstChange)) {
      this.initializeComponent();
      
      // Trigger change detection
      if (this.cdr) {
        this.cdr.markForCheck();
        this.cdr.detectChanges();
      }
    }
  }
  
  /**
   * Initialize the component with its configuration
   * Override this method in derived components
   */
  protected initializeComponent(): void {
    // Default implementation does nothing
    
    // Trigger change detection after initialization
    if (this.cdr) {
      this.cdr.markForCheck();
      this.cdr.detectChanges();
    }
  }
  
  /**
   * Get a value from the component configuration
   * @param path The path to the value in dot notation (e.g. 'style.color')
   * @param defaultValue The default value to return if the path doesn't exist
   * @returns The value at the specified path or the default value
   */
  protected getConfigValue(path: string, defaultValue: any = undefined): any {
    if (!this.config) return defaultValue;
    
    const parts = path.split('.');
    let value = this.config;
    
    for (const part of parts) {
      if (value === undefined || value === null) return defaultValue;
      value = value[part];
    }
    
    return value !== undefined ? value : defaultValue;
  }
  
  /**
   * Get a value from the component data
   * @param path The path to the value in dot notation (e.g. 'user.name')
   * @param defaultValue The default value to return if the path doesn't exist
   * @returns The value at the specified path or the default value
   */
  protected getDataValue(path: string, defaultValue: any = undefined): any {
    if (!this.data) return defaultValue;
    
    const parts = path.split('.');
    let value = this.data;
    
    for (const part of parts) {
      if (value === undefined || value === null) return defaultValue;
      value = value[part];
    }
    
    return value !== undefined ? value : defaultValue;
  }
}
import { Injectable, Type } from '@angular/core';
import { DynamicComponent } from '../components/base/dynamic-component';
import { DynamicHeaderComponent } from '../components/dynamic/header/header.component';
import { DynamicSearchComponent } from '../components/dynamic/search/search.component';
import { DynamicPropertyListComponent } from '../components/dynamic/property-list/property-list.component';
import { DynamicFormComponent } from '../components/dynamic/form/dynamic-form.component';
import { DynamicCardComponent } from '../components/dynamic/card/card.component';

@Injectable({
  providedIn: 'root'
})
export class ComponentRegistry {
  private componentMap = new Map<string, Type<DynamicComponent>>();
  
  constructor() {
    this.registerDefaultComponents();
  }
  
  private registerDefaultComponents(): void {
    // Register all dynamic components here
    this.registerComponent('header', DynamicHeaderComponent);
    this.registerComponent('search', DynamicSearchComponent);
    this.registerComponent('property-list', DynamicPropertyListComponent);
    this.registerComponent('form', DynamicFormComponent);
    this.registerComponent('card', DynamicCardComponent);
  }
  
  registerComponent(type: string, component: Type<DynamicComponent>): void {
    this.componentMap.set(type, component);
  }
  
  getComponent(type: string): Type<DynamicComponent> | undefined {
    return this.componentMap.get(type);
  }
  
  hasComponent(type: string): boolean {
    return this.componentMap.has(type);
  }
  
  getAllRegisteredTypes(): string[] {
    return Array.from(this.componentMap.keys());
  }
}
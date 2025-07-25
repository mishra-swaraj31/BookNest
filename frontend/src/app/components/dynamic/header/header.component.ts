import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DynamicComponent } from '../../base/dynamic-component';

@Component({
  selector: 'app-dynamic-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class DynamicHeaderComponent extends DynamicComponent {
  constructor(cdr: ChangeDetectorRef) {
    super(cdr);
  }
  title: string = '';
  subtitle: string = '';
  alignment: 'left' | 'center' | 'right' = 'center';
  size: 'small' | 'medium' | 'large' = 'medium';
  showDivider: boolean = false;
  
  override initializeComponent(): void {
    this.title = this.getConfigValue('title', '');
    this.subtitle = this.getConfigValue('subtitle', '');
    this.alignment = this.getConfigValue('alignment', 'center');
    this.size = this.getConfigValue('size', 'medium');
    this.showDivider = this.getConfigValue('showDivider', false);
  }
  
  get headerClasses(): string {
    const classes = ['dynamic-header'];
    
    if (this.alignment) {
      classes.push(`text-${this.alignment}`);
    }
    
    if (this.size) {
      classes.push(`header-${this.size}`);
    }
    
    return classes.join(' ');
  }
}
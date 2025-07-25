import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DynamicComponent } from '../../base/dynamic-component';

@Component({
  selector: 'app-dynamic-card',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './card.component.html',
  styleUrl: './card.component.css'
})
export class DynamicCardComponent extends DynamicComponent {
  constructor(cdr: ChangeDetectorRef) {
    super(cdr);
  }
  title: string = '';
  subtitle: string = '';
  imageUrl: string = '';
  imageAlt: string = '';
  content: string = '';
  buttonText: string = '';
  buttonLink: string = '';
  buttonType: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'light' | 'dark' | 'link' = 'primary';
  icon: string = '';
  badge: string = '';
  badgeType: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'light' | 'dark' = 'primary';
  layout: 'vertical' | 'horizontal' = 'vertical';
  aspectRatio: '1:1' | '4:3' | '16:9' | 'none' = 'none';
  hoverEffect: boolean = true;
  
  override initializeComponent(): void {
    this.title = this.getConfigValue('title', '');
    this.subtitle = this.getConfigValue('subtitle', '');
    this.imageUrl = this.getConfigValue('imageUrl', '');
    this.imageAlt = this.getConfigValue('imageAlt', this.title);
    this.content = this.getConfigValue('content', '');
    this.buttonText = this.getConfigValue('buttonText', '');
    this.buttonLink = this.getConfigValue('buttonLink', '');
    this.buttonType = this.getConfigValue('buttonType', 'primary');
    this.icon = this.getConfigValue('icon', '');
    this.badge = this.getConfigValue('badge', '');
    this.badgeType = this.getConfigValue('badgeType', 'primary');
    this.layout = this.getConfigValue('layout', 'vertical');
    this.aspectRatio = this.getConfigValue('aspectRatio', 'none');
    this.hoverEffect = this.getConfigValue('hoverEffect', true);
  }
  
  get cardClasses(): string {
    const classes = ['dynamic-card'];
    
    if (this.layout === 'horizontal') {
      classes.push('card-horizontal');
    }
    
    if (this.hoverEffect) {
      classes.push('card-hover');
    }
    
    return classes.join(' ');
  }
  
  get imageClasses(): string {
    const classes = ['card-img'];
    
    if (this.aspectRatio !== 'none') {
      classes.push(`ratio-${this.aspectRatio.replace(':', '-')}`);
    }
    
    return classes.join(' ');
  }
  
  get buttonClasses(): string {
    return `btn btn-${this.buttonType}`;
  }
  
  get badgeClasses(): string {
    return `badge bg-${this.badgeType}`;
  }
}
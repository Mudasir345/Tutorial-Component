import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconService } from '../services/icon.service';

@Component({
  selector: 'app-icon',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="icon-wrapper"
         [ngStyle]="getPositionStyles()">
      <div class="icon-container" 
           [ngStyle]="{
             'width': width, 
             'height': height,
             'background-color': backgroundColor
           }"
           [ngClass]="{
             'hover-effect': enableHover,
             'active': isActive,
             'inactive': !isActive && dimWhenInactive
           }"
           (click)="onClick()">
        <img class="w-full h-full object-contain" 
             [src]="iconSrc" 
             [alt]="iconAlt"
             [ngClass]="{'rounded-full': circular}" />
        <div *ngIf="label" 
             class="icon-label text-center text-white"
             [ngClass]="{
               'absolute -bottom-6 left-0 right-0': labelPosition === 'bottom',
               'mt-2': labelPosition === 'inside'
             }">
          {{ label }}
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      line-height: 0;
      padding: 0;
      margin: 0;
      font-size: 0;
      vertical-align: top;
    }
    
    .icon-wrapper {
      position: relative;
      padding: 0;
      margin: 0;
      line-height: 0;
      font-size: 0;
      display: block;
    }
    
    .icon-container {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;
      overflow: visible;
      padding: 0;
      margin: 0;
      line-height: 0;
      transform: scale(3.5);
    }
    
    .hover-effect:hover {
      transform: scale(3.5);
      cursor: pointer;
      z-index: 10;
    }
    
    .icon-label {
      opacity: 0.8;
      transition: opacity 0.3s ease;
      white-space: nowrap;
      font-size: 0.75rem;
    }
    
    .hover-effect:hover .icon-label {
      opacity: 1;
    }

    @media (max-width: 768px) {
      .icon-container {
        transform: scale(1.8);
      }
      
      .hover-effect:hover {
        transform: scale(2.1);
      }
    }
  `]
})
export class IconComponent implements OnInit {
  @Input() iconSrc: string = 'assets/icons/default.svg';
  @Input() iconAlt: string = 'Icon';
  @Input() width: string = '48px';
  @Input() height: string = '48px';
  @Input() label: string = '';
  @Input() enableHover: boolean = true;
  @Input() circular: boolean = false;
  @Input() backgroundColor: string = 'transparent';
  @Input() labelPosition: 'inside' | 'bottom' = 'inside';
  @Input() isActive: boolean = false;
  @Input() dimWhenInactive: boolean = false;
  
  // Positioning inputs
  @Input() position: 'absolute' | 'relative' | 'static' = 'static';
  @Input() top: string | null = null;
  @Input() left: string | null = null;
  @Input() right: string | null = null;
  @Input() bottom: string | null = null;
  @Input() zIndex: number | null = null;
  @Input() transform: string | null = null;
  
  @Output() iconClick = new EventEmitter<void>();
  
  constructor(private iconService: IconService) {}
  
  ngOnInit(): void {
    // Set default alt text if not provided
    if (!this.iconAlt || this.iconAlt === 'Icon') {
      // Extract filename from path to use as alt text
      const filename = this.iconSrc.split('/').pop()?.split('.')[0] || 'Icon';
      this.iconAlt = filename.charAt(0).toUpperCase() + filename.slice(1);
    }
  }
  
  getPositionStyles(): { [key: string]: string | number } {
    const styles: { [key: string]: string | number } = {
      'position': this.position
    };
    
    if (this.top !== null) styles['top'] = this.top;
    if (this.left !== null) styles['left'] = this.left;
    if (this.right !== null) styles['right'] = this.right;
    if (this.bottom !== null) styles['bottom'] = this.bottom;
    if (this.zIndex !== null) styles['zIndex'] = this.zIndex;
    if (this.transform !== null) styles['transform'] = this.transform;
    
    return styles;
  }
  
  onClick(): void {
    const iconName = this.iconSrc.split('/').pop()?.replace('.svg', '');
    if (iconName) {
      this.iconService.showIconText(iconName);
    }
    this.iconClick.emit();
  }
}
import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconService } from '../services/icon.service';
import { Subscription } from 'rxjs';
import { trigger, transition, style, animate } from '@angular/animations';

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
           [ngClass]="{'hover-effect': enableHover}"
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

@Component({
  selector: 'app-icon-text',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="icon-text-container" *ngIf="currentText" [@fadeInOut]>
      <div class="text-content">
        {{ currentText }}
      </div>
    </div>
  `,
  styles: [`
    .icon-text-container {
      position: fixed;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      background-color: rgba(0, 0, 0, 0.8);
      padding: 10px 20px;
      border-radius: 8px;
      z-index: 1000;
      transition: all 0.3s ease;
    }

    .text-content {
      color: white;
      font-size: 1rem;
      text-align: center;
      min-width: 200px;
      direction: auto;
    }

    :host-context([dir="rtl"]) .text-content {
      direction: rtl;
    }
  `],
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px) translateX(-50%)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0) translateX(-50%)' }))
      ]),
      transition(':leave', [
        animate('300ms ease-in', style({ opacity: 0, transform: 'translateY(20px) translateX(-50%)' }))
      ])
    ])
  ]
})
export class IconTextComponent implements OnInit, OnDestroy {
  currentText: string = '';
  private subscription: Subscription | null = null;

  constructor(private iconService: IconService) {}

  ngOnInit() {
    this.subscription = this.iconService.getIconText().subscribe(text => {
      this.currentText = text;
    });
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
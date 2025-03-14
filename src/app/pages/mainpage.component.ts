import { Component, OnInit, OnDestroy, Renderer2, ElementRef, ViewChild, AfterViewInit, PLATFORM_ID, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { isPlatformBrowser } from '@angular/common';
import { IconComponent } from '../components/icon.component';
import { WalkthroughComponent } from '../components/walkthrough.component';
import { IconService, IconState } from '../services/icon.service';
import { WalkthroughService, WalkthroughState } from '../services/walkthrough.service';
import { Subscription } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-mainpage',
  standalone: true,
  imports: [CommonModule, IconComponent, WalkthroughComponent],
  template: `
    <div class="flex min-h-screen bg-black">
      <div class="w-full p-8 relative">
        <!-- Text Display Area -->
        <div #textDisplayArea class="fixed left-5 top-16 text-white max-w-sm text-area">
          <div *ngIf="isLoading" class="text-gray-400">
            Loading...
          </div>
          <div *ngIf="error" class="text-red-500">
            {{ error }}
          </div>
          <div *ngIf="currentIconText && !isLoading && !error" class="text-display-area">
            <p #textContent [innerHTML]="currentIconText" class="icon-text-content"></p>
            <div *ngIf="showNoteText" class="text-xs text-gray-400 mt-5 note-text">
              Note: All your data from this tool will be<br>
              deleted after it is closed and will not be<br>
              shared with anyone else for any reason.
            </div>
          </div>
        </div>

        <!-- Icons Container -->
        <div class="icons-container">
          <!-- Close icon -->
          <app-icon 
            #closeIcon
            iconSrc="assets/icons/close.svg"
            [width]="'48.83px'"
            [height]="'48.83px'"
            [enableHover]="true"
            (iconClick)="handleIconClick('close')"
            [isActive]="true"
            [dimWhenInactive]="false"
            position="absolute"
            left="-13px"
            top="-13px">
          </app-icon>

          <!-- Right side icons -->
          <div class="fixed right-0 top-0 h-full" style="z-index: 10;">
            <ng-container *ngFor="let icon of rightSideIcons">
              <app-icon 
                [id]="'icon-' + icon.name"
                [iconSrc]="'assets/icons/' + icon.name + '.svg'"
                [width]="icon.width || '48.83px'"
                [height]="icon.height || '48.83px'"
                [enableHover]="!isWalkthroughActive"
                (iconClick)="handleIconClick(icon.name)"
                [isActive]="isIconActive(icon.name)"
                [dimWhenInactive]="true"
                position="absolute"
                [right]="icon.right || '3px'"
                [top]="icon.top">
              </app-icon>
            </ng-container>
          </div>
        </div>

        <!-- Walkthrough Component -->
        <app-walkthrough 
          (stepComplete)="onWalkthroughStepComplete($event)"
          (walkthroughComplete)="onWalkthroughComplete()">
        </app-walkthrough>

        <!-- Walkthrough Trigger Button -->
        <button 
          *ngIf="!isWalkthroughActive"
          (click)="startWalkthrough()"
          class="walkthrough-trigger">
          <span class="icon">❓</span>
          <span class="text">Start Tutorial</span>
        </button>

        <!-- Bottom Navigation -->
        <div class="fixed bottom-5 left-0 right-0 flex justify-center overflow-hidden" 
             [class.walkthrough-active]="isWalkthroughActive"
             style="padding: 0 5px;">
          <div class="flex space-x-3.5 transition-transform duration-300 ease-in-out" [style.transform]="'translateX(' + buttonSlidePosition + 'px)'">
            <button *ngFor="let button of navigationButtons; let i = index" 
              class="nav-button" 
              [ngClass]="{'active': activeButton === button}"
              (click)="handleButtonClick(button)">
              {{button}}
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      min-height: 100vh;
      overflow: hidden;
    }

    .icons-container {
      position: fixed;
      width: 100%;
      height: 100%;
      pointer-events: none;
    }

    .icons-container app-icon {
      pointer-events: auto;
    }

    :host ::ng-deep .active {
      filter: brightness(1.5);
      transition: all 0.3s ease;
    }

    :host ::ng-deep .inactive {
      opacity: 0.7;
      transition: all 0.3s ease;
    }
    
    :host ::ng-deep .default {
      opacity: 1;
      transition: all 0.3s ease;
    }

    .nav-button {
      font-family: 'Calistoga', sans-serif;
      color: rgba(255, 255, 255, 0.6);
      font-size: 11px;
      padding: 4px 8px;
      background: transparent;
      border: none;
      cursor: pointer;
      transition: all 0.3s ease;
      transform-origin: center;
      min-width: 70px;
      text-align: center;
    }

    .nav-button:hover {
      color: rgba(255, 255, 255, 1);
    }

    .nav-button.active {
      color: rgba(255, 255, 255, 1);
      transform: scale(1.2);
      font-weight: bold;
      transition: all 0.3s ease;
      z-index: 1;
    }

    .nav-button:hover {
      color: rgba(255, 255, 255, 1);
    }

    .text-display-area {
      font-size: 16px;
      line-height: 1.9;
      max-width: 230px;
      font-family: 'Calistoga', sans-serif;
      font-weight: 50;
      letter-spacing: 0.3px;
      color: #FFFFFF;
    }

    .note-text {
      font-size: 11px;
      line-height: 1.6;
      font-family: 'Calistoga', sans-serif;
      color: rgba(255, 255, 255, 0.6);
      letter-spacing: 0.2px;
      margin-top: 20px;
    }

    @media (max-width: 320px) {
      .text-display-area {
        font-size: 14px;
        max-width: 200px;
      }

      .note-text {
        font-size: 10px;
      }
    }

    .icon-text-content {
      white-space: pre-line;
      margin-bottom: 16px;
    }

    .text-highlight {
      color: #FF69B4;  /* Pink color for highlighted text */
      font-weight: 200;
    }

    /* Core arrow structure */
    .curved-arrow {
      position: absolute;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    /* Path animation */
    .curved-arrow path {
      stroke-dasharray: 1000;
      stroke-dashoffset: 1000;
      animation: drawArrow 1s ease forwards;
    }

    .walkthrough-trigger {
      position: fixed;
      bottom: 80px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(255, 255, 255, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.3);
      color: white;
      padding: 8px 16px;
      border-radius: 20px;
      cursor: pointer;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      gap: 8px;
      font-family: 'Calistoga', sans-serif;
      z-index: 100;
    }

    .walkthrough-trigger:hover {
      background: rgba(255, 255, 255, 0.2);
      transform: translateX(-50%) scale(1.05);
    }

    .walkthrough-trigger .icon {
      font-size: 18px;
    }

    .walkthrough-trigger .text {
      font-size: 14px;
    }

    .walkthrough-active {
      opacity: 0.5;
      pointer-events: none;
      transition: opacity 0.3s ease;
    }

    @media (max-width: 320px) {
      .walkthrough-trigger {
        padding: 6px 12px;
        bottom: 70px;
      }

      .walkthrough-trigger .icon {
        font-size: 16px;
      }

      .walkthrough-trigger .text {
        font-size: 12px;
      }
    }
  `]
})
export class MainpageComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('textDisplayArea') textDisplayArea!: ElementRef;
  @ViewChild('textContent') textContent!: ElementRef;

  navigationButtons: string[] = ['Intro', 'Alert', 'Selfie', 'Video', 'Outfit', 'Chat', 'Meetup Started', 'Prep', 'Tutorial', 'Location'];
  buttonSlidePosition: number = 0;
  visibleButtonCount: number = 5;
  buttonWidth: number = 120;

  activeIcon: string | null = null;
  currentIconText: string = '';
  showNoteText: boolean = true; // Changed to true by default
  isLoading: boolean = false;
  error: string | null = null;
  currentLanguage: 'en' | 'es' | 'fr' = 'en';
  welcomeText: string = 'Welcome to our App! 👋\nWe are excited to have you here. Let\'s get started by exploring the features using the icons on the right.';

  private subscription: Subscription = new Subscription();

  rightSideIcons = [
    { name: 'forfeit', width: '48.83px', height: '48.83px', right: '-10px', top: '20px' },
    { name: 'help', width: '48.83px', height: '48.83px', right: '-7px', top: '65px' },
    { name: 'prep', width: '48.83px', height: '48.83px', right: '-7px', top: '120px' },
    { name: 'location', width: '48.83px', height: '48.83px', right: '-7px', top: '175px' },
    { name: 'chat', width: '48.83px', height: '48.83px', right: '-7px', top: '230px' },
    { name: 'more', width: '48.83px', height: '48.83px', right: '4px', top: '275px' },
    { name: 'begin', width: '48.83px', height: '48.83px', right: '40px', top: '295px' },
    { name: 'outfit', width: '48.83px', height: '48.83px', right: '65px', top: '340px' },
    { name: 'selfie & video', width: '68.83px', height: '68.83px', right: '1px', top: '320px' },
    { name: 'video', width: '48.83px', height: '48.83px', right: '40px', top: '383px' },
    { name: 'face', width: '48.83px', height: '48.83px', right: '1px', top: '400px' }
  ];

  private iconTexts: { [key: string]: { [lang: string]: string } } = {};

  isWalkthroughActive: boolean = false;
  private currentWalkthroughStep: number = 0;

  private isBrowser: boolean;

  constructor(
    private iconService: IconService,
    private translateService: TranslateService,
    private walkthroughService: WalkthroughService,
    private renderer: Renderer2,
    private http: HttpClient,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit(): void {
    this.loadIconTexts();
    this.currentIconText = this.welcomeText;

    this.subscription.add(
      this.iconService.getIconText().subscribe((state: IconState) => {
        this.isLoading = state.isLoading;
        this.error = state.error;
        
        if (this.activeIcon === 'close' || !this.activeIcon) {
          this.currentIconText = this.welcomeText;
          this.showNoteText = true;
        } else {
          this.updateIconText(this.activeIcon);
          this.showNoteText = false;
        }
      })
    );

    this.translateService.setDefaultLang('en');
    this.translateService.use('en');

    // Subscribe to walkthrough state
    this.subscription.add(
      this.walkthroughService.getWalkthroughState().subscribe(state => {
        this.isWalkthroughActive = state.isActive;
        this.currentWalkthroughStep = state.currentStep;
        this.updateUIForWalkthrough(state);
      })
    );
  }

  ngAfterViewInit(): void {
    // Only run in browser environment
    if (this.isBrowser) {
      // Calculate and update arrow positions for walkthrough
      this.updateWalkthroughArrowPositions();
    }
  }

  private loadIconTexts(): void {
    this.http.get<{ [key: string]: { [lang: string]: string } }>('assets/i18n/icon-texts.json')
      .subscribe({
        next: (data: { [key: string]: { [lang: string]: string } }) => {
          this.iconTexts = data;
          if (this.activeIcon) {
            this.updateIconText(this.activeIcon);
          }
        },
        error: (error: any) => {
          console.error('Error loading icon texts:', error);
          this.error = 'Error loading walkthrough content';
        }
      });
  }

  private updateIconText(iconName: string): void {
    if (this.iconTexts[iconName] && this.iconTexts[iconName][this.currentLanguage]) {
      this.currentIconText = this.iconTexts[iconName][this.currentLanguage];
    } else {
      this.error = 'Text not found for this icon';
    }
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  activeButton: string | null = null;

  handleIconClick(iconName: string): void {
    // Reset previous icon and button states
    if (this.activeIcon && this.activeIcon !== iconName) {
      const prevIconElement = document.getElementById('icon-' + this.activeIcon);
      if (prevIconElement) {
        this.renderer.removeClass(prevIconElement, 'active');
        this.renderer.addClass(prevIconElement, 'inactive');
      }
    }

    // Update UI state
    this.activeIcon = iconName;
    this.showNoteText = iconName === 'close' || !iconName;
    
    // Apply active state to current icon
    const currentIconElement = document.getElementById('icon-' + iconName);
    if (currentIconElement) {
      this.renderer.removeClass(currentIconElement, 'inactive');
      this.renderer.addClass(currentIconElement, 'active');
    }
    
    // Handle icon-to-button mapping with improved synchronization
    const iconToButtonMap: { [key: string]: string | null } = {
      'forfeit': 'Intro',
      'selfie & video': 'Alert',
      'face': 'Selfie',
      'video': 'Video',
      'outfit': 'Outfit',
      'chat': 'Chat',
      'begin': 'Meetup Started',
      'prep': 'Prep',
      'help': 'Tutorial',
      'location': 'Location',
      'more': null,
      'close': null
    };

    const buttonName = iconToButtonMap[iconName];
    if (buttonName) {
      this.activeButton = buttonName;
      // Reset all buttons to inactive state first
      const buttons = document.querySelectorAll('.nav-button');
      buttons.forEach(button => {
        this.renderer.removeClass(button, 'active');
      });
      
      // Find and highlight the associated button
      buttons.forEach(button => {
        if (button.textContent?.trim() === buttonName) {
          this.renderer.addClass(button, 'active');
        }
      });
      
      // Center the active button immediately
      this.centerActiveButton();
    } else {
      this.activeButton = null;
    }

    // Update text content
    this.iconService.showIconText(iconName);
  }

  handleButtonClick(buttonName: string): void {
    this.activeButton = buttonName;
    
    const buttonToIconMap: { [key: string]: string } = {
      'Intro': 'forfeit',
      'Alert': 'selfie & video',
      'Selfie': 'face',
      'Video': 'video',
      'Outfit': 'outfit',
      'Chat': 'chat',
      'Meetup Started': 'begin',
      'Prep': 'prep',
      'Tutorial': 'help',
      'Location': 'location'
    };

    const iconName = buttonToIconMap[buttonName];
    if (iconName) {
      this.handleIconClick(iconName);
    }
  }

  centerActiveButton(): void {
    if (!this.activeButton) return;

    const activeIndex = this.navigationButtons.indexOf(this.activeButton);
    if (activeIndex === -1) return;

    const centerPosition = Math.floor(this.visibleButtonCount / 2);
    const maxSlidePosition = -(this.navigationButtons.length - this.visibleButtonCount) * this.buttonWidth;
    
    let newPosition = -(activeIndex - centerPosition) * this.buttonWidth;
    
    // Ensure we don't slide too far in either direction
    newPosition = Math.max(maxSlidePosition, Math.min(0, newPosition));
    
    this.buttonSlidePosition = newPosition;
  }

  setLanguage(lang: 'en' | 'es' | 'fr'): void {
    this.currentLanguage = lang;
    this.translateService.use(lang);
    this.iconService.setLanguage(lang);
    
    // Refresh current icon text if any icon is active
    if (this.activeIcon) {
      this.iconService.showIconText(this.activeIcon);
    }
  }

  getActiveIconElement(): ElementRef<any> {
    if (!this.activeIcon) {
      return new ElementRef(document.createElement('div'));
    }
    const element = document.getElementById('icon-' + this.activeIcon);
    return new ElementRef(element || document.createElement('div'));
  }

  getArrowDirection(): 'up' | 'down' {
    if (!this.activeIcon) return 'down';
    const icon = this.rightSideIcons.find(icon => icon.name === this.activeIcon);
    if (!icon) return 'down';
    
    const iconTop = parseInt(icon.top);
    return iconTop < 200 ? 'up' : 'down';
  }

  private updateWalkthroughArrowPositions(): void {
    if (!this.isBrowser) return;

    setTimeout(() => {
      this.rightSideIcons.forEach((icon, index) => {
        const iconElement = document.getElementById('icon-' + icon.name);
        const textArea = this.textDisplayArea?.nativeElement;
        
        if (iconElement && textArea) {
          const iconRect = iconElement.getBoundingClientRect();
          const textRect = textArea.getBoundingClientRect();
          
          this.walkthroughService.updateArrowPositions(
            index + 1,
            {
              x: textRect.right,
              y: textRect.top + textRect.height / 2
            },
            {
              x: iconRect.left,
              y: iconRect.top + iconRect.height / 2
            }
          );
        }
      });
    }, 0);
  }

  startWalkthrough(): void {
    this.walkthroughService.startWalkthrough();
  }

  onWalkthroughStepComplete(stepIndex: number): void {
    // Handle icon activation based on step
    if (stepIndex > 0 && stepIndex <= this.rightSideIcons.length) {
      const icon = this.rightSideIcons[stepIndex - 1];
      if (icon) {
        this.handleIconClick(icon.name);
      }
    }
  }

  onWalkthroughComplete(): void {
    // Reset UI state after walkthrough
    this.resetUIState();
  }

  private updateUIForWalkthrough(state: WalkthroughState): void {
    if (!this.isBrowser) return;
    
    if (state.isActive) {
      // Dim non-active icons
      setTimeout(() => {
        this.rightSideIcons.forEach((icon, index) => {
          const isCurrentStep = index + 1 === state.currentStep;
          const iconElement = document.getElementById('icon-' + icon.name);
          if (iconElement) {
            this.renderer.setStyle(iconElement, 'opacity', isCurrentStep ? '1' : '0.3');
            this.renderer.setStyle(iconElement, 'pointer-events', isCurrentStep ? 'auto' : 'none');
          }
        });
      }, 0);
    } else {
      this.resetUIState();
    }
  }

  private resetUIState(): void {
    if (!this.isBrowser) return;
    
    // Reset icon states
    setTimeout(() => {
      this.rightSideIcons.forEach(icon => {
        const iconElement = document.getElementById('icon-' + icon.name);
        if (iconElement) {
          this.renderer.removeStyle(iconElement, 'opacity');
          this.renderer.removeStyle(iconElement, 'pointer-events');
        }
      });
    }, 0);
  }

  isIconActive(iconName: string): boolean {
    if (this.isWalkthroughActive && this.isBrowser) {
      const step = this.walkthroughService.getStepByIcon(iconName);
      return step?.id === this.currentWalkthroughStep;
    }
    return !this.activeIcon || this.activeIcon === iconName;
  }
}

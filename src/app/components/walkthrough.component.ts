import { Component, OnInit, OnDestroy, Output, EventEmitter, PLATFORM_ID, Inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { WalkthroughService, WalkthroughStep, WalkthroughState } from '../services/walkthrough.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-walkthrough',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="isWalkthroughActive" class="walkthrough-container">
      <!-- Semi-transparent overlay -->
      <div class="overlay"></div>

      <!-- Enhanced Curved Arrow -->
      <svg *ngIf="currentStep" 
           class="curved-arrow"
           [class.gentle-curve]="currentStep.arrowConfig.curveType === 'gentle'"
           [class.steep-curve]="currentStep.arrowConfig.curveType === 'steep'"
           [class.arrow-right]="currentStep.arrowConfig.direction === 'right'"
           [class.arrow-left]="currentStep.arrowConfig.direction === 'left'"
           [attr.data-icon]="currentStep.iconName"
           width="100%" 
           height="100%" 
           xmlns="http://www.w3.org/2000/svg">
        <defs>
          <!-- Right Arrow Marker -->
          <marker id="arrowhead-right" 
                 markerWidth="10" 
                 markerHeight="7" 
                 refX="9" 
                 refY="3.5" 
                 orient="auto">
            <polygon points="0 0, 10 3.5, 0 7" fill="#fff"/>
          </marker>
          <!-- Left Arrow Marker -->
          <marker id="arrowhead-left" 
                 markerWidth="10" 
                 markerHeight="7" 
                 refX="1" 
                 refY="3.5" 
                 orient="auto">
            <polygon points="10 0, 0 3.5, 10 7" fill="#fff"/>
          </marker>
        </defs>
        <path *ngIf="currentStep?.arrowConfig"
              [attr.d]="generateCurvedPath(currentStep)"
              [attr.stroke]="getStrokeColor(currentStep.iconName || '')"
              fill="none" 
              stroke-width="2"
              [attr.marker-end]="'url(#arrowhead-' + (currentStep.arrowConfig.direction || 'right') + ')'">
        </path>
      </svg>

      <!-- Text Display -->
      <div class="text-container"
           [class.text-left]="currentStep?.arrowConfig?.direction === 'right'"
           [class.text-right]="currentStep?.arrowConfig?.direction === 'left'">
        <p class="step-text">{{ currentStep?.textContent }}</p>
        <div class="navigation-buttons">
          <button (click)="previousStep()" 
                  [disabled]="!canGoPrevious"
                  class="nav-btn">
            Previous
          </button>
          <button (click)="nextStep()" 
                  [disabled]="!canGoNext"
                  class="nav-btn">
            {{ isLastStep ? 'Finish' : 'Next' }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .walkthrough-container {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 1000;
      pointer-events: none;
    }

    .overlay {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.7);
      pointer-events: none;
    }

    .curved-arrow {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .text-container {
      position: fixed;
      background: rgba(0, 0, 0, 0.8);
      border-radius: 8px;
      padding: 16px;
      max-width: 250px;
      pointer-events: auto;
      transition: all 0.3s ease;
    }

    .text-left {
      left: 16px;
      top: 50%;
      transform: translateY(-50%);
    }

    .text-right {
      right: 16px;
      top: 50%;
      transform: translateY(-50%);
    }

    .step-text {
      color: white;
      font-size: 14px;
      line-height: 1.5;
      margin-bottom: 16px;
      font-family: 'Calistoga', sans-serif;
    }

    .navigation-buttons {
      display: flex;
      justify-content: space-between;
      gap: 8px;
    }

    .nav-btn {
      background: rgba(255, 255, 255, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.3);
      color: white;
      padding: 8px 16px;
      border-radius: 4px;
      cursor: pointer;
      transition: all 0.2s ease;
      font-family: 'Calistoga', sans-serif;
      font-size: 12px;
    }

    .nav-btn:hover:not(:disabled) {
      background: rgba(255, 255, 255, 0.2);
    }

    .nav-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    /* Arrow Base Styles */
    .curved-arrow {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    /* Arrow Path Styles */
    .curved-arrow path {
      stroke-dasharray: 1000;
      stroke-dashoffset: 1000;
      animation: drawArrow 1s ease forwards;
    }

    /* Arrow Direction Variations */
    .arrow-right path {
      marker-end: url(#arrowhead-right);
    }

    .arrow-left path {
      marker-end: url(#arrowhead-left);
    }

    /* Curve Type Variations */
    .gentle-curve path {
      transition: d 0.5s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .steep-curve path {
      transition: d 0.5s cubic-bezier(0.4, 0, 0.2, 1);
    }

    /* Arrow Animations */
    @keyframes drawArrow {
      to {
        stroke-dashoffset: 0;
      }
    }

    @keyframes pulseArrow {
      0%, 100% {
        transform: scale(1);
        opacity: 1;
      }
      50% {
        transform: scale(1.05);
        opacity: 0.8;
      }
    }

    /* Arrow Head Styles */
    .curved-arrow marker {
      animation: fadeIn 0.3s ease forwards;
    }

    .curved-arrow[class*="gentle"] marker {
      transform-origin: center;
      animation: rotateGently 2s infinite;
    }

    .curved-arrow[class*="steep"] marker {
      transform-origin: center;
      animation: rotateSteep 2s infinite;
    }

    /* Icon-specific Arrow Styles */
    .curved-arrow[data-icon="forfeit"] path {
      stroke: #FF4B4B;
      animation: drawArrow 1s ease forwards, pulseRed 2s infinite;
    }

    .curved-arrow[data-icon="help"] path {
      stroke: #4BB4FF;
      animation: drawArrow 1s ease forwards, pulseBlue 2s infinite;
    }

    .curved-arrow[data-icon="chat"] path {
      stroke: #4BFF91;
      animation: drawArrow 1s ease forwards, pulseGreen 2s infinite;
    }

    /* Arrow Color Animations */
    @keyframes pulseRed {
      0%, 100% { stroke: #FF4B4B; }
      50% { stroke: #FF7676; }
    }

    @keyframes pulseBlue {
      0%, 100% { stroke: #4BB4FF; }
      50% { stroke: #76CAFF; }
    }

    @keyframes pulseGreen {
      0%, 100% { stroke: #4BFF91; }
      50% { stroke: #76FFB1; }
    }

    @keyframes rotateGently {
      0%, 100% { transform: rotate(0deg); }
      50% { transform: rotate(5deg); }
    }

    @keyframes rotateSteep {
      0%, 100% { transform: rotate(0deg); }
      50% { transform: rotate(10deg); }
    }

    /* Arrow Hover Effects */
    .curved-arrow:hover path {
      filter: brightness(1.2);
      animation: pulseArrow 1s infinite;
    }

    /* Mobile Responsive Adjustments */
    @media (max-width: 768px) {
      .curved-arrow path {
        stroke-width: 1.5;
      }

      .curved-arrow marker {
        transform: scale(0.8);
      }
    }

    @media (max-width: 320px) {
      .curved-arrow path {
        stroke-width: 1;
      }

      .curved-arrow marker {
        transform: scale(0.7);
      }

      /* Simplified animations for better performance on mobile */
      .curved-arrow[class*="gentle"] marker,
      .curved-arrow[class*="steep"] marker {
        animation: none;
      }
    }

    /* High-contrast mode support */
    @media (prefers-contrast: high) {
      .curved-arrow path {
        stroke-width: 3;
        stroke: #FFFFFF;
      }

      .curved-arrow marker polygon {
        fill: #FFFFFF;
      }
    }
  `]
})
export class WalkthroughComponent implements OnInit, OnDestroy {
  currentStep: WalkthroughStep | null = null;
  isWalkthroughActive: boolean = false;
  canGoPrevious: boolean = false;
  canGoNext: boolean = false;
  isLastStep: boolean = false;
  private subscription: Subscription = new Subscription();
  private isBrowser: boolean;

  @Output() stepComplete = new EventEmitter<number>();
  @Output() walkthroughComplete = new EventEmitter<void>();

  constructor(
    private walkthroughService: WalkthroughService,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit(): void {
    if (this.isBrowser) {
      this.subscription.add(
        this.walkthroughService.getWalkthroughState().subscribe((state: WalkthroughState) => {
          this.isWalkthroughActive = state.isActive;
          this.updateStepState(state);
        })
      );
    }
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  private updateStepState(state: WalkthroughState): void {
    this.currentStep = this.walkthroughService.getCurrentStep();
    this.canGoPrevious = state.currentStep > 1;
    this.canGoNext = state.currentStep < state.totalSteps;
    this.isLastStep = state.currentStep === state.totalSteps;
    
    // Emit step complete event
    if (state.currentStep > 0) {
      this.stepComplete.emit(state.currentStep);
    }
  }

  nextStep(): void {
    if (this.isLastStep) {
      this.walkthroughService.stopWalkthrough();
      this.walkthroughComplete.emit();
    } else {
      this.walkthroughService.nextStep();
    }
  }

  previousStep(): void {
    this.walkthroughService.previousStep();
  }

  generateCurvedPath(step: WalkthroughStep): string {
    if (!step.arrowConfig || !this.isBrowser) return '';
    
    const { startPosition, endPosition } = step.arrowConfig;
    const isRight = step.arrowConfig.direction === 'right';
    const isGentle = step.arrowConfig.curveType === 'gentle';

    // Calculate control points for the curve
    const controlPoint1X = isRight ? 
      startPosition.x + (endPosition.x - startPosition.x) * 0.25 :
      startPosition.x - (startPosition.x - endPosition.x) * 0.25;

    const controlPoint2X = isRight ?
      startPosition.x + (endPosition.x - startPosition.x) * 0.75 :
      startPosition.x - (startPosition.x - endPosition.x) * 0.75;

    const controlPointYOffset = isGentle ? 50 : 100;
    const controlPoint1Y = (startPosition.y + endPosition.y) / 2 - controlPointYOffset;
    const controlPoint2Y = (startPosition.y + endPosition.y) / 2 + controlPointYOffset;

    return `M ${startPosition.x} ${startPosition.y} 
            C ${controlPoint1X} ${controlPoint1Y},
              ${controlPoint2X} ${controlPoint2Y},
              ${endPosition.x} ${endPosition.y}`;
  }

  getStrokeColor(iconName: string): string {
    if (!this.isBrowser) return '#FFFFFF';
    
    const colorMap: { [key: string]: string } = {
      'forfeit': '#FF4B4B',
      'help': '#4BB4FF',
      'chat': '#4BFF91',
      // Add more icon-specific colors as needed
      'default': '#FFFFFF'
    };
    return colorMap[iconName] || colorMap['default'];
  }
}
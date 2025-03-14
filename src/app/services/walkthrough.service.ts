import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

// Interfaces for walkthrough
export interface WalkthroughStep {
  id: number;
  iconName: string;
  textContent: string;
  arrowConfig: ArrowConfig;
}

export interface ArrowConfig {
  direction: 'left' | 'right';
  curveType: 'gentle' | 'steep';
  startPosition: { x: number; y: number };
  endPosition: { x: number; y: number };
}

export interface WalkthroughState {
  currentStep: number;
  isActive: boolean;
  totalSteps: number;
}

@Injectable({
  providedIn: 'root'
})
export class WalkthroughService {
  private steps: WalkthroughStep[] = [
    {
      id: 1,
      iconName: 'forfeit',
      textContent: 'Exit the application anytime',
      arrowConfig: {
        direction: 'right',
        curveType: 'gentle',
        startPosition: { x: 0, y: 0 },
        endPosition: { x: 0, y: 0 }
      }
    },
    {
      id: 2,
      iconName: 'help',
      textContent: 'Get help and support',
      arrowConfig: {
        direction: 'right',
        curveType: 'gentle',
        startPosition: { x: 0, y: 0 },
        endPosition: { x: 0, y: 0 }
      }
    },
    {
      id: 3,
      iconName: 'prep',
      textContent: 'Prepare for your session',
      arrowConfig: {
        direction: 'right',
        curveType: 'gentle',
        startPosition: { x: 0, y: 0 },
        endPosition: { x: 0, y: 0 }
      }
    },
    {
      id: 4,
      iconName: 'location',
      textContent: 'Set your location',
      arrowConfig: {
        direction: 'right',
        curveType: 'gentle',
        startPosition: { x: 0, y: 0 },
        endPosition: { x: 0, y: 0 }
      }
    },
    {
      id: 5,
      iconName: 'chat',
      textContent: 'Open chat interface',
      arrowConfig: {
        direction: 'right',
        curveType: 'steep',
        startPosition: { x: 0, y: 0 },
        endPosition: { x: 0, y: 0 }
      }
    },
    {
      id: 6,
      iconName: 'more',
      textContent: 'Access more options',
      arrowConfig: {
        direction: 'left',
        curveType: 'gentle',
        startPosition: { x: 0, y: 0 },
        endPosition: { x: 0, y: 0 }
      }
    },
    {
      id: 7,
      iconName: 'begin',
      textContent: 'Start your session',
      arrowConfig: {
        direction: 'left',
        curveType: 'steep',
        startPosition: { x: 0, y: 0 },
        endPosition: { x: 0, y: 0 }
      }
    },
    {
      id: 8,
      iconName: 'outfit',
      textContent: 'Choose your outfit',
      arrowConfig: {
        direction: 'left',
        curveType: 'steep',
        startPosition: { x: 0, y: 0 },
        endPosition: { x: 0, y: 0 }
      }
    },
    {
      id: 9,
      iconName: 'selfie & video',
      textContent: 'Take selfie or record video',
      arrowConfig: {
        direction: 'left',
        curveType: 'steep',
        startPosition: { x: 0, y: 0 },
        endPosition: { x: 0, y: 0 }
      }
    },
    {
      id: 10,
      iconName: 'video',
      textContent: 'Record a video',
      arrowConfig: {
        direction: 'left',
        curveType: 'gentle',
        startPosition: { x: 0, y: 0 },
        endPosition: { x: 0, y: 0 }
      }
    },
    {
      id: 11,
      iconName: 'face',
      textContent: 'Face recognition features',
      arrowConfig: {
        direction: 'left',
        curveType: 'gentle',
        startPosition: { x: 0, y: 0 },
        endPosition: { x: 0, y: 0 }
      }
    }
  ];

  private walkthroughState = new BehaviorSubject<WalkthroughState>({
    currentStep: 0,
    isActive: false,
    totalSteps: this.steps.length
  });

  constructor() {}

  // Start the walkthrough
  startWalkthrough(): void {
    this.walkthroughState.next({
      ...this.walkthroughState.value,
      currentStep: 1,
      isActive: true
    });
  }

  // Stop the walkthrough
  stopWalkthrough(): void {
    this.walkthroughState.next({
      ...this.walkthroughState.value,
      currentStep: 0,
      isActive: false
    });
  }

  // Move to next step
  nextStep(): void {
    const currentState = this.walkthroughState.value;
    if (currentState.currentStep < currentState.totalSteps) {
      this.walkthroughState.next({
        ...currentState,
        currentStep: currentState.currentStep + 1
      });
    }
  }

  // Move to previous step
  previousStep(): void {
    const currentState = this.walkthroughState.value;
    if (currentState.currentStep > 1) {
      this.walkthroughState.next({
        ...currentState,
        currentStep: currentState.currentStep - 1
      });
    }
  }

  // Get current walkthrough state
  getWalkthroughState(): Observable<WalkthroughState> {
    return this.walkthroughState.asObservable();
  }

  // Get current step details
  getCurrentStep(): WalkthroughStep | null {
    const currentStep = this.walkthroughState.value.currentStep;
    return currentStep ? this.steps.find(step => step.id === currentStep) || null : null;
  }

  // Update arrow positions for a step
  updateArrowPositions(stepId: number, startPos: { x: number; y: number }, endPos: { x: number; y: number }): void {
    const step = this.steps.find(s => s.id === stepId);
    if (step) {
      step.arrowConfig.startPosition = startPos;
      step.arrowConfig.endPosition = endPos;
    }
  }

  // Get step by icon name
  getStepByIcon(iconName: string): WalkthroughStep | null {
    return this.steps.find(step => step.iconName === iconName) || null;
  }
}
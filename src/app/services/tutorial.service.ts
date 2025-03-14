import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TutorialService {
  private tutorialStateSubject = new BehaviorSubject<boolean>(false);
  private tutorialStep = new BehaviorSubject<number>(0);

  constructor() {}

  startTutorial(): void {
    this.tutorialStateSubject.next(true);
    this.tutorialStep.next(0);
  }

  stopTutorial(): void {
    this.tutorialStateSubject.next(false);
    this.tutorialStep.next(0);
  }

  nextStep(): void {
    this.tutorialStep.next(this.tutorialStep.value + 1);
  }

  previousStep(): void {
    if (this.tutorialStep.value > 0) {
      this.tutorialStep.next(this.tutorialStep.value - 1);
    }
  }

  getTutorialState(): Observable<boolean> {
    return this.tutorialStateSubject.asObservable();
  }

  getCurrentStep(): Observable<number> {
    return this.tutorialStep.asObservable();
  }
}
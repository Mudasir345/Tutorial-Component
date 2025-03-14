import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface IconText {
  title: string;
  description: string;
}

@Injectable({
  providedIn: 'root'
})
export class TranslationService {
  private currentIconTextSubject = new BehaviorSubject<IconText | null>(null);
  currentIconText$ = this.currentIconTextSubject.asObservable();

  constructor(private translate: TranslateService) {
    translate.setDefaultLang('en');
    translate.use('en');
  }

  updateIconText(iconKey: string): void {
    this.translate.get(`icons.${iconKey}`).subscribe((text: IconText) => {
      this.currentIconTextSubject.next(text);
    });
  }

  getCurrentIconText(): Observable<IconText | null> {
    return this.currentIconText$;
  }
}
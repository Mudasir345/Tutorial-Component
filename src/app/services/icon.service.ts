import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

interface IconText {
  [key: string]: LanguageText;
}

interface LanguageText {
  en: string;
  es: string;
  fr: string;
}

export interface IconState {
  isLoading: boolean;
  error: string | null;
  text: string;
}

@Injectable({
  providedIn: 'root'
})
export class IconService {
  private currentLanguage = 'en';
  private iconTextSubject = new BehaviorSubject<IconState>({
    isLoading: false,
    error: null,
    text: ''
  });
  private iconTexts: IconText | null = null;

  constructor(private http: HttpClient) {
    this.loadIconTexts();
  }

  loadIconTexts() {
    this.iconTextSubject.next({
      isLoading: true,
      error: null,
      text: ''
    });

    this.http.get<IconText>('assets/i18n/icon-texts.json').subscribe(
      texts => {
        this.iconTexts = texts;
        this.iconTextSubject.next({
          isLoading: false,
          error: null,
          text: ''
        });
      },
      error => {
        console.error('Error loading icon texts:', error);
        this.iconTextSubject.next({
          isLoading: false,
          error: 'Failed to load icon texts',
          text: ''
        });
      }
    );
  }

  setLanguage(lang: 'en' | 'es' | 'fr') {
    this.currentLanguage = lang;
  }

  showIconText(iconName: string) {
    if (this.iconTexts && this.iconTexts[iconName]) {
      const text = this.iconTexts[iconName][this.currentLanguage as keyof LanguageText];
      this.iconTextSubject.next({
        isLoading: false,
        error: null,
        text: text
      });
    } else {
      console.warn(`No text found for icon: ${iconName}`);
      this.iconTextSubject.next({
        isLoading: false,
        error: `No text found for icon: ${iconName}`,
        text: ''
      });
    }
  }

  getIconText(): Observable<IconState> {
    return this.iconTextSubject.asObservable();
  }
}
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

interface Translations {
  [key: string]: {
    [key: string]: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class I18nService {
  private currentLang = new BehaviorSubject<string>('en');
  currentLang$ = this.currentLang.asObservable();
  
  // Simple translations for demo purposes
  private translations: Translations = {
    en: {
      welcome: 'Welcome to the App',
      profile: 'Profile Setup',
      location: 'Location Services',
      chat: 'Chat Features',
      video: 'Video Sharing',
      help: 'Get Help',
      advanced: 'Advanced Options',
      learnNavigation: 'Learn how to navigate the interface.',
      customizeProfile: 'Customize your profile for better experience.',
      setLocation: 'Set your location for local features.',
      connectOthers: 'Connect with others using our chat feature.',
      shareVideos: 'Share and view videos with friends.',
      getHelp: 'Learn how to get help when needed.',
      exploreMore: 'Explore more features in the advanced menu.'
    },
    es: {
      welcome: 'Bienvenido a la Aplicación',
      profile: 'Configuración de Perfil',
      location: 'Servicios de Ubicación',
      chat: 'Funciones de Chat',
      video: 'Compartir Videos',
      help: 'Obtener Ayuda',
      advanced: 'Opciones Avanzadas',
      learnNavigation: 'Aprende a navegar por la interfaz.',
      customizeProfile: 'Personaliza tu perfil para una mejor experiencia.',
      setLocation: 'Establece tu ubicación para funciones locales.',
      connectOthers: 'Conéctate con otros usando nuestra función de chat.',
      shareVideos: 'Comparte y mira videos con amigos.',
      getHelp: 'Aprende cómo obtener ayuda cuando la necesites.',
      exploreMore: 'Explora más funciones en el menú avanzado.'
    },
    fr: {
      welcome: 'Bienvenue dans l\'Application',
      profile: 'Configuration du Profil',
      location: 'Services de Localisation',
      chat: 'Fonctionnalités de Chat',
      video: 'Partage de Vidéos',
      help: 'Obtenir de l\'Aide',
      advanced: 'Options Avancées',
      learnNavigation: 'Apprenez à naviguer dans l\'interface.',
      customizeProfile: 'Personnalisez votre profil pour une meilleure expérience.',
      setLocation: 'Définissez votre emplacement pour les fonctionnalités locales.',
      connectOthers: 'Connectez-vous avec d\'autres personnes à l\'aide de notre fonction de chat.',
      shareVideos: 'Partagez et regardez des vidéos avec des amis.',
      getHelp: 'Apprenez à obtenir de l\'aide en cas de besoin.',
      exploreMore: 'Explorez plus de fonctionnalités dans le menu avancé.'
    }
  };

  constructor() {}

  setLanguage(lang: string): void {
    if (this.translations[lang]) {
      this.currentLang.next(lang);
      console.log(`Language changed to: ${lang}`);
    } else {
      console.error(`Language '${lang}' is not supported`);
    }
  }

  translate(key: string): string {
    const lang = this.currentLang.value;
    if (this.translations[lang] && this.translations[lang][key]) {
      return this.translations[lang][key];
    }
    // Fallback to English if translation not found
    if (this.translations['en'] && this.translations['en'][key]) {
      return this.translations['en'][key];
    }
    // Return the key if no translation is available
    return key;
  }

  get availableLanguages(): string[] {
    return Object.keys(this.translations);
  }
} 
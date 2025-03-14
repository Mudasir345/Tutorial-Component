import { Routes } from '@angular/router';
import { MainpageComponent } from './pages/mainpage.component';

export const routes: Routes = [
  { path: '', component: MainpageComponent },
  { path: 'mainpage', component: MainpageComponent }
];
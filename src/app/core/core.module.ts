import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { IconService } from '../services/icon.service';
import { TutorialService } from '../services/tutorial.service';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    HttpClientModule
  ],
  providers: [
    IconService,
    TutorialService
  ]
})
export class CoreModule { }
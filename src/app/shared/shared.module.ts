import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatToolbarModule } from '@angular/material/toolbar';

import { LoadingComponent } from './loading/loading.component';

@NgModule({
  declarations: [LoadingComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatToolbarModule,
    MatCardModule,
    MatTableModule,
    MatAutocompleteModule,
    MatButtonModule,
    MatIconModule,
  ],
  exports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatToolbarModule,
    MatCardModule,
    MatTableModule,
    MatAutocompleteModule,
    MatButtonModule,
    MatIconModule,
  ],
  entryComponents: [
    LoadingComponent
  ]
})
export class SharedModule {}

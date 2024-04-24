import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ClaimPaginationComponent } from './pages/claim-pagination/claim-pagination.component';

export const routes: Routes = [
  { path: '', component: ClaimPaginationComponent },
  // Add more routes as needed
];

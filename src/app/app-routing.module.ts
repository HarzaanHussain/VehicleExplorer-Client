import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { ManufacturersComponent } from './manufacturers/manufacturers.component';
import { VehiclesComponent } from './vehicles/vehicles.component';
import { ManufacturerDetailComponent } from './manufacturers/manufacturer-detail/manufacturer-detail.component';
import { VehicleDetailComponent } from './vehicles/vehicle-detail/vehicle-detail.component';
import { VehicleFormComponent } from './vehicles/vehicle-form/vehicle-form.component';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { authGuard } from './guards/auth.guard';

const routes: Routes = [
  { path: '', component: HomeComponent, pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'manufacturers', component: ManufacturersComponent, canActivate: [authGuard] },
  { path: 'manufacturers/create', component: ManufacturerDetailComponent, canActivate: [authGuard] },
  { path: 'manufacturers/:id', component: ManufacturerDetailComponent, canActivate: [authGuard] },
  { path: 'vehicles', component: VehiclesComponent, canActivate: [authGuard] },
  { path: 'vehicles/create', component: VehicleFormComponent, canActivate: [authGuard] },
  { path: 'vehicles/:id', component: VehicleDetailComponent, canActivate: [authGuard] },
  { path: 'vehicles/edit/:id', component: VehicleFormComponent, canActivate: [authGuard] },
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

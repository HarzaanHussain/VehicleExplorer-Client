import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Manufacturer } from '../../models/manufacturer';
import { Vehicle } from '../../models/vehicle';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-manufacturer-detail',
  templateUrl: './manufacturer-detail.component.html',
  styleUrls: ['./manufacturer-detail.component.scss']
})
export class ManufacturerDetailComponent implements OnInit {
  title: string = '';
  form!: FormGroup;
  manufacturer?: Manufacturer;
  vehicles: Vehicle[] = [];
  
  id?: number;
  viewMode = false;

  constructor(
    private fb: FormBuilder,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private http: HttpClient) {
  }

  ngOnInit() {
    this.form = this.fb.group({
      name: ['', Validators.required],
      code: ['']
    });

    const idParam = this.activatedRoute.snapshot.paramMap.get('id');

    this.viewMode = !this.router.url.includes('/create') && !this.router.url.includes('/edit');

    if (idParam) {
      this.id = +idParam;

      this.http.get<Manufacturer>(environment.baseUrl + 'api/manufacturers/' + this.id)
        .subscribe({
          next: result => {
            this.manufacturer = result;
            this.title = this.viewMode ? result.name : "Edit - " + result.name;

            this.form.patchValue(this.manufacturer);

            if (this.viewMode) {
              this.loadVehicles();
            }
          },
          error: error => console.error(error)
        });
    }
    else {
      // ADD NEW MODE
      this.title = "Create a new Manufacturer";
    }
  }

  loadVehicles() {
    if (this.id) {
      this.http.get<Vehicle[]>(environment.baseUrl + 'api/manufacturers/' + this.id + '/vehicles')
        .subscribe({
          next: result => {
            this.vehicles = result;
          },
          error: error => console.error(error)
        });
    }
  }

  onSubmit() {
    const manufacturer = this.id ? { ...this.manufacturer, ...this.form.value } : this.form.value;

    if (this.id) {
      // EDIT mode
      this.http.put<Manufacturer>(environment.baseUrl + 'api/manufacturers/' + this.id, manufacturer)
        .subscribe({
          next: () => {
            console.log("Manufacturer " + manufacturer.id + " has been updated.");
            // go back to manufacturers view
            this.router.navigate(['/manufacturers', this.id]);
          },
          error: error => console.error(error)
        });
    }
    else {
      this.http.post<Manufacturer>(environment.baseUrl + 'api/manufacturers', manufacturer)
        .subscribe({
          next: result => {
            console.log("Manufacturer " + result.id + " has been created.");
            // go back to manufacturers view
            this.router.navigate(['/manufacturers']);
          },
          error: error => console.error(error)
        });
    }
  }

  onCancel() {
    if (this.id) {
      this.router.navigate(['/manufacturers', this.id]);
    } else {
      this.router.navigate(['/manufacturers']);
    }
  }
}

import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Vehicle } from '../../models/vehicle';
import { Manufacturer } from '../../models/manufacturer';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-vehicle-form',
  templateUrl: './vehicle-form.component.html',
  styleUrls: ['./vehicle-form.component.scss']
})
export class VehicleFormComponent implements OnInit {
  vehicleForm!: FormGroup;
  manufacturers: Manufacturer[] = [];
  vehicle: Vehicle | null = null;
  isEditMode = false;
  vehicleId = 0;
  isLoading = false;
  errorMessage: string | null = null;

  // Current year for validation
  currentYear = new Date().getFullYear();

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.initForm();
    this.loadManufacturers();

    // Check if we're in edit mode
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam && this.router.url.includes('/edit/')) {
      this.isEditMode = true;
      this.vehicleId = +idParam;
      this.loadVehicle(this.vehicleId);
    }
  }

  initForm(): void {
    this.vehicleForm = this.fb.group({
      manufacturerId: ['', Validators.required],
      modelName: ['', [Validators.required, Validators.maxLength(100)]],
      year: ['', [
        Validators.required,
        Validators.min(1900),
        Validators.max(this.currentYear + 1)
      ]],
      fuelEfficiency: this.fb.group({
        includeFuelData: [false],
        combinedMpg: [{ value: '', disabled: true }, [Validators.min(0), Validators.max(200)]],
        annualFuelCost: [{ value: '', disabled: true }, [Validators.min(0)]]
      })
    });

    // Listen for changes to the includeFuelData checkbox
    this.vehicleForm.get('fuelEfficiency.includeFuelData')?.valueChanges.subscribe(include => {
      const combinedMpgControl = this.vehicleForm.get('fuelEfficiency.combinedMpg');
      const annualFuelCostControl = this.vehicleForm.get('fuelEfficiency.annualFuelCost');

      if (include) {
        combinedMpgControl?.enable();
        annualFuelCostControl?.enable();
      } else {
        combinedMpgControl?.disable();
        annualFuelCostControl?.disable();
      }
    });
  }

  loadManufacturers(): void {
    this.http.get<Manufacturer[]>(`${environment.baseUrl}api/manufacturers`)
      .subscribe({
        next: (data) => {
          this.manufacturers = data;
        },
        error: (error) => {
          console.error('Error loading manufacturers:', error);
          this.errorMessage = 'Failed to load manufacturers. Please try again.';
        }
      });
  }

  loadVehicle(id: number): void {
    this.isLoading = true;
    this.http.get<Vehicle>(`${environment.baseUrl}api/vehicles/${id}`)
      .subscribe({
        next: (vehicle) => {
          this.vehicle = vehicle;

          // Check if fuel efficiency data is present
          const hasFuelData = vehicle.combinedMpg != null || vehicle.annualFuelCost != null;

          // Update the form with vehicle data
          this.vehicleForm.patchValue({
            manufacturerId: vehicle.manufacturerId,
            modelName: vehicle.modelName,
            year: vehicle.year,
            fuelEfficiency: {
              includeFuelData: hasFuelData,
              combinedMpg: vehicle.combinedMpg,
              annualFuelCost: vehicle.annualFuelCost
            }
          });

          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading vehicle:', error);
          this.errorMessage = 'Failed to load vehicle data. Please try again.';
          this.isLoading = false;
        }
      });
  }

  onSubmit(): void {
    if (this.vehicleForm.invalid) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;

    // Prepare vehicle data from form
    const formValue = this.vehicleForm.value;
    const vehicleData: Vehicle = {
      id: this.isEditMode ? this.vehicleId : 0,
      manufacturerId: formValue.manufacturerId,
      modelName: formValue.modelName,
      year: formValue.year,
      combinedMpg: formValue.fuelEfficiency.includeFuelData ? formValue.fuelEfficiency.combinedMpg : null,
      annualFuelCost: formValue.fuelEfficiency.includeFuelData ? formValue.fuelEfficiency.annualFuelCost : null
    };

    if (this.isEditMode) {
      // Update existing vehicle
      this.http.put<Vehicle>(`${environment.baseUrl}api/vehicles/${this.vehicleId}`, vehicleData)
        .subscribe({
          next: () => {
            this.isLoading = false;
            this.router.navigate(['/vehicles', this.vehicleId]);
          },
          error: (error) => {
            console.error('Error updating vehicle:', error);
            this.errorMessage = 'Failed to update vehicle. Please try again.';
            this.isLoading = false;
          }
        });
    } else {
      // Create new vehicle
      this.http.post<Vehicle>(`${environment.baseUrl}api/vehicles`, vehicleData)
        .subscribe({
          next: (newVehicle) => {
            this.isLoading = false;
            this.router.navigate(['/vehicles', newVehicle.id]);
          },
          error: (error) => {
            console.error('Error creating vehicle:', error);
            this.errorMessage = 'Failed to create vehicle. Please try again.';
            this.isLoading = false;
          }
        });
    }
  }

  onCancel(): void {
    if (this.isEditMode) {
      this.router.navigate(['/vehicles', this.vehicleId]);
    } else {
      this.router.navigate(['/vehicles']);
    }
  }
}

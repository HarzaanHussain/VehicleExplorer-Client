import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Vehicle } from '../../models/vehicle';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-vehicle-detail',
  templateUrl: './vehicle-detail.component.html',
  styleUrls: ['./vehicle-detail.component.scss']
})
export class VehicleDetailComponent implements OnInit {
  vehicle: Vehicle | null = null;
  loading = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient
  ) { }

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      const id = +idParam;
      this.fetchVehicle(id);
    } else {
      this.loading = false;
    }
  }

  fetchVehicle(id: number): void {
    this.http.get<Vehicle>(`${environment.baseUrl}api/vehicles/${id}`)
      .subscribe({
        next: (vehicle) => {
          this.vehicle = vehicle;
          this.loading = false;
        },
        error: (error) => {
          console.error('Error fetching vehicle:', error);
          this.loading = false;
        }
      });
  }
}

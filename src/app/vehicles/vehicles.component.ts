import { Component, OnInit, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { Vehicle } from '../models/vehicle';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-vehicles',
  templateUrl: './vehicles.component.html',
  styleUrls: ['./vehicles.component.scss']
})
export class VehiclesComponent implements OnInit {
  public vehicles: Vehicle[] = [];
  public paginatedData: Vehicle[] = [];

  public pageSize = 10;
  public currentPage = 0;

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(private http: HttpClient) { }

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.http.get<Vehicle[]>(environment.baseUrl + 'api/vehicles')
      .subscribe({
        next: (result) => {
          this.vehicles = result;
          this.updatePage();
        },
        error: (error) => console.error(error)
      });
  }

  onPageChange(event: PageEvent) {
    this.pageSize = event.pageSize;
    this.currentPage = event.pageIndex;
    this.updatePage();
  }

  updatePage() {
    const startIndex = this.currentPage * this.pageSize;
    this.paginatedData = this.vehicles.slice(startIndex, startIndex + this.pageSize);
  }
}

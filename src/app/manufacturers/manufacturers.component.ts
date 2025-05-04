import { Component, OnInit, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { Manufacturer } from '../models/manufacturer';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-manufacturers',
  templateUrl: './manufacturers.component.html',
  styleUrls: ['./manufacturers.component.scss']
})
export class ManufacturersComponent implements OnInit {
  public manufacturers: Manufacturer[] = [];
  public paginatedData: Manufacturer[] = [];

  public pageSize = 10;
  public currentPage = 0;

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(private http: HttpClient) { }

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.http.get<Manufacturer[]>(environment.baseUrl + 'api/manufacturers')
      .subscribe({
        next: (result) => {
          this.manufacturers = result;
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
    this.paginatedData = this.manufacturers.slice(startIndex, startIndex + this.pageSize);
  }
}

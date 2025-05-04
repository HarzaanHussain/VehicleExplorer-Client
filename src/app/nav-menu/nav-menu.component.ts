import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { User } from '../models/auth/user'; // Fix: import User from the correct file

@Component({
  selector: 'app-nav-menu',
  templateUrl: './nav-menu.component.html',
  styleUrls: ['./nav-menu.component.scss']
})
export class NavMenuComponent implements OnInit {
  isAuthenticated: boolean = false;
  currentUser: User | null = null;

  constructor(
    public authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    // Set initial values
    this.isAuthenticated = this.authService.isAuthenticated;
    this.currentUser = this.authService.currentUserValue;

    // Subscribe to changes
    this.authService.currentUser.subscribe((user: User | null) => {
      this.currentUser = user;
      this.isAuthenticated = !!user;
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}

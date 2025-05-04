import { Injectable } from '@angular/core';
import { Router, CanActivateFn, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { inject } from '@angular/core';

export const authGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) => {
  const router = inject(Router);
  const authService = inject(AuthService);

  if (authService.isAuthenticated) {
    return true;
  }

  router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
  return false;
};

@Injectable({ providedIn: 'root' })
export class AuthGuard {
  constructor(private router: Router, private authService: AuthService) { }

  canActivate(): boolean {
    if (this.authService.isAuthenticated) {
      return true;
    }

    this.router.navigate(['/login']);
    return false;
  }
}

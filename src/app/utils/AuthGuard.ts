import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot,
} from '@angular/router';
import {Observable} from 'rxjs/Observable';
import {LoginService} from '../services/LoginService';
import {Injectable} from '@angular/core';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private router: Router, private loginService: LoginService) {
  }

  canActivate(route: ActivatedRouteSnapshot,
              state: RouterStateSnapshot,): Observable<boolean> | Promise<boolean> | boolean {
    return this.loginService.validate().map(loggedIn => {
      if (!loggedIn) {
        this.router.navigate(['/login'], {
            queryParams: {
              'referrer': `${window.location.protocol}//${window.location.host}/#${state.url}`
            }
          }
        );
      }
      return loggedIn;
    });
  }
}

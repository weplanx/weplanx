import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { AppService } from '@common/app.service';

@Injectable({ providedIn: 'root' })
export class AppGuard implements CanActivate {
  constructor(private app: AppService, private router: Router) {}

  canActivate(): Observable<boolean> {
    return this.app.verify().pipe(
      map(res => {
        if (res.status !== 204) {
          this.router.navigateByUrl('/login');
        }
        return true;
      })
    );
  }
}

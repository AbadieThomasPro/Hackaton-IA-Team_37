import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, interval, of, startWith, switchMap } from 'rxjs';
import { environment } from '../../environments/environment';

const POLL_INTERVAL_MS = 5000;

@Injectable({ providedIn: 'root' })
export class HealthService {
  private readonly http = inject(HttpClient);

  readonly connected = signal(false);

  constructor() {
    interval(POLL_INTERVAL_MS)
      .pipe(
        startWith(0),
        switchMap(() =>
          this.http
            .get<{ connected: boolean }>(`${environment.apiBaseUrl}/health`)
            .pipe(catchError(() => of({ connected: false })))
        )
      )
      .subscribe((result) => this.connected.set(result.connected));
  }
}

import { Component, inject } from '@angular/core';
import { HealthService } from './services/health.service';

@Component({
  selector: 'app-root',
  imports: [],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly health = inject(HealthService);
}

import { Component, inject } from '@angular/core';
import { HealthService } from './services/health.service';
import { Chat } from './chat/chat';

@Component({
  selector: 'app-root',
  imports: [Chat],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly health = inject(HealthService);
}

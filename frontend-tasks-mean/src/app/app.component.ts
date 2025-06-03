import { Component, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterOutlet } from '@angular/router';
import { fromEvent, map, merge, of } from 'rxjs';
import { OfflineComponent } from './shared/ui/components/offline/offline.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, OfflineComponent],
  styleUrl: './app.component.scss',
  template: `
    @if (isOnline()) {
      <router-outlet />
    } @else {
      <app-offline />
    }
  `,
})
export class AppComponent {
  isOnline = signal<boolean>(true);

  constructor() {
    this.checkInternetStatus();
  }

  private checkInternetStatus = () => {
    merge(
      of(navigator.onLine),
      fromEvent(window, 'online').pipe(map(e => !!e)),
      fromEvent(window, 'offline').pipe(map(e => !e)),
    )
      .pipe(takeUntilDestroyed())
      .subscribe({
        next: isOnline => {
          this.isOnline.set(isOnline);
        },
      });
  };

}

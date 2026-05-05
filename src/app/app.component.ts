import { Component, inject, OnInit, signal, HostListener } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { NavbarComponent } from './shared/navbar/navbar.component';
import { FooterComponent } from './shared/footer/footer.component';
import { ToastComponent } from './shared/toast/toast.component';
import { Visit } from './core/models/visit.model';
import { TrackService } from './core/services/track.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavbarComponent, FooterComponent, ToastComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  title = 'notes-app';

  // Visitor count state
  visitorCount = signal<number>(0);
  isVisitorCountLoading = signal<boolean>(false);
  visitorCountError = signal<string | null>(null);

  private trackService = inject(TrackService);
  private router = inject(Router);

  constructor() {}

  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    // Ctrl + N for new note
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'n') {
      event.preventDefault();
      this.router.navigate(['/new-note']);
    }
    // Ctrl + / for search
    if ((event.ctrlKey || event.metaKey) && event.key === '/') {
      event.preventDefault();
      this.router.navigate(['/notes']);
      // A small delay to let the page load if not already there
      setTimeout(() => {
        const searchInput = document.querySelector('input[placeholder*="Search"]') as HTMLInputElement;
        if (searchInput) searchInput.focus();
      }, 100);
    }
  }

  ngOnInit() {
    this.trackVisit();
  }

  private trackVisit(): void {
    this.isVisitorCountLoading.set(true);
    this.visitorCountError.set(null);

    this.trackService.trackProjectVisit(this.title).subscribe({
      next: (response: Visit) => {
        this.visitorCount.set(response.uniqueVisitors);
        this.isVisitorCountLoading.set(false);
      },
      error: (err: Error) => {
        console.error('Failed to track visit:', err);
        this.visitorCountError.set('Failed to load visitor count');
        this.isVisitorCountLoading.set(false);
      },
    });
  }
}

import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { NoteService } from '../../core/services/note.service';
import { Note } from '../../core/models/note';
import { MarkdownPipe } from '../../shared/pipes/markdown.pipe';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-shared-note',
  imports: [MarkdownPipe, DatePipe, RouterModule],
  templateUrl: './shared-note.component.html',
})
export class SharedNoteComponent implements OnInit {
  note = signal<Note | null>(null);
  isLoading = signal<boolean>(true);
  error = signal<string>('');

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private noteService = inject(NoteService);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.error.set('Invalid note link');
      this.isLoading.set(false);
      return;
    }

    this.noteService.getSharedNote(id).subscribe({
      next: (note) => {
        this.note.set(note);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.error.set(err?.error?.message || 'Failed to load shared note. It may be private or deleted.');
        this.isLoading.set(false);
      }
    });
  }
}

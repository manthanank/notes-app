import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Note } from '../../core/models/note';
import { NoteService } from '../../core/services/note.service';
import { DatePipe } from '@angular/common';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-note-detail',
  imports: [DatePipe, RouterLink],
  templateUrl: './note-detail.component.html',
  styleUrl: './note-detail.component.scss',
})
export class NoteDetailComponent implements OnInit {
  note: Note | undefined;
  id: string = '';
  showConfirmDialog = signal<boolean>(false);
  error = signal<string>('');
  selectedNoteId = signal<string>('');
  isLoading = signal<boolean>(false);

  router = inject(Router);
  route = inject(ActivatedRoute);
  noteService = inject(NoteService);
  toastService = inject(ToastService);

  constructor() {}

  ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.get('id') || '';
    if (this.id) {
      this.isLoading.set(true);
      this.noteService.getNoteById(this.id).subscribe({
        next: (res) => {
          this.note = res;
          this.isLoading.set(false);
        },
        error: (err) => {
          console.error(err);
          this.isLoading.set(false);
          this.error.set(err?.error?.message || 'An error occurred');
          this.toastService.show(
            err?.error?.message || 'An error occurred',
            'error'
          );
        },
      });
    }
  }

  editNote(): void {
    this.router.navigate(['/edit-note', this.id]);
  }

  showDeleteConfirm(noteId: string) {
    this.selectedNoteId.set(noteId);
    this.showConfirmDialog.set(true);
  }

  deleteNote(id: string) {
    this.noteService.deleteNote(id).subscribe({
      next: (res) => {
        this.showConfirmDialog.set(false);
        this.router.navigate(['/notes']);
        this.toastService.show('Note deleted successfully', 'success');
      },
      error: (err) => {
        console.error(err);
        this.error.set(err?.error?.message || 'An error occurred');
        this.toastService.show(
          err?.error?.message || 'An error occurred',
          'error'
        );
      },
    });
  }
}

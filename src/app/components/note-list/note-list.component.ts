import { Component, inject, OnInit, signal } from '@angular/core';
import { Note } from '../../core/models/note';
import { NoteService } from '../../core/services/note.service';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { NgClass } from '@angular/common';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-note-list',
  imports: [RouterLink, FormsModule, NgClass],
  templateUrl: './note-list.component.html',
  styleUrl: './note-list.component.scss',
})
export class NoteListComponent implements OnInit {
  notes: Note[] = [];
  isLoading = signal<boolean>(false);
  error = signal<string>('');
  search = signal<string>('');
  private searchSubject = new Subject<string>();
  currentPage = signal<number>(1);
  limit = signal<number>(10);
  totalPages = signal<number>(1);

  toastService = inject(ToastService);
  noteService = inject(NoteService);

  constructor() {}

  ngOnInit(): void {
    this.getNotes();
    this.searchSubject.pipe(debounceTime(300)).subscribe((searchTerm) => {
      this.performSearch(searchTerm);
    });
  }

  getNotes(): void {
    this.isLoading.set(true);
    this.noteService.getNotes(this.currentPage(), this.limit()).subscribe({
      next: (response) => {
        this.notes = response.notes;
        this.totalPages.set(response.totalPages);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error(error);
        this.isLoading.set(false);
        this.error.set(error?.error?.message || 'An error occurred');
        this.toastService.show(
          error?.error?.message || 'An error occurred',
          'error'
        );
      },
    });
  }

  searchNotes(): void {
    this.searchSubject.next(this.search());
  }

  private performSearch(searchTerm: string): void {
    if (searchTerm) {
      this.isLoading.set(true);
      this.noteService
        .searchNotes(searchTerm, this.currentPage(), this.limit())
        .subscribe({
          next: (response) => {
            this.notes = response.notes;
            this.totalPages.set(response.totalPages);
            this.isLoading.set(false);
          },
          error: (error) => {
            console.error(error);
            this.isLoading.set(false);
            this.error.set(error?.error?.message || 'An error occurred');
            this.toastService.show(
              error?.error?.message || 'An error occurred',
              'error'
            );
          },
        });
    } else {
      this.getNotes();
    }
  }

  goToPage(page: number): void {
    this.currentPage.set(page);
    this.getNotes();
  }
}

import { Component, inject, OnInit, signal } from '@angular/core';
import { Note } from '../../core/models/note';
import { NoteService } from '../../core/services/note.service';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { NgClass, DatePipe } from '@angular/common';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-note-list',
  imports: [RouterLink, FormsModule, NgClass, DatePipe],
  templateUrl: './note-list.component.html',
  styleUrl: './note-list.component.scss',
})
export class NoteListComponent implements OnInit {
  notes: Note[] = []; // Initialize as an empty array
  isLoading = signal<boolean>(false);
  error = signal<string>('');
  search = signal<string>('');
  private searchSubject = new Subject<string>();
  currentPage = signal<number>(1);
  limit = signal<number>(9); // Increased from 10 to 9 for better grid layout
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
    this.error.set(''); // Reset error state before new request
    
    this.noteService.getNotes(this.currentPage(), this.limit()).subscribe({
      next: (response) => {
        if (response && response.notes) {
          this.notes = response.notes;
          this.totalPages.set(response.totalPages || 1);
        } else {
          this.notes = [];
          this.totalPages.set(1);
        }
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error(error);
        this.notes = []; // Ensure notes is always an array
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
      this.error.set(''); // Reset error state
      
      this.noteService
        .searchNotes(searchTerm, this.currentPage(), this.limit())
        .subscribe({
          next: (response) => {
            // Handle if response is an array instead of a paginated object
            if (Array.isArray(response)) {
              this.notes = response;
              this.totalPages.set(1); // Since we're not getting pagination info
            } else if (response && response.notes) {
              this.notes = response.notes;
              this.totalPages.set(response.totalPages || 1);
            } else {
              this.notes = [];
              this.totalPages.set(1);
            }
            this.isLoading.set(false);
          },
          error: (error) => {
            console.error(error);
            this.notes = []; // Ensure notes is always an array
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
    if (page < 1 || page > this.totalPages()) return;
    this.currentPage.set(page);
    this.getNotes();
  }

  // Helper method to generate pagination array
  getPaginationArray(): number[] {
    const total = this.totalPages();
    const current = this.currentPage();
    const pages: number[] = [];
    
    // Show at most 5 page numbers
    const maxPages = 5;
    
    if (total <= maxPages) {
      // If total pages is less than max, show all pages
      for (let i = 1; i <= total; i++) {
        pages.push(i);
      }
    } else {
      // Always include first page
      pages.push(1);
      
      // Calculate start and end of page range
      let start = Math.max(2, current - 1);
      let end = Math.min(total - 1, start + 2);
      
      // Adjust start if end is at max
      if (end === total - 1) {
        start = Math.max(2, end - 2);
      }
      
      // Add ellipsis after first page if needed
      if (start > 2) {
        pages.push(-1); // Use -1 to represent ellipsis
      }
      
      // Add pages in range
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      
      // Add ellipsis before last page if needed
      if (end < total - 1) {
        pages.push(-1); // Use -1 to represent ellipsis
      }
      
      // Always include last page
      pages.push(total);
    }
    
    return pages;
  }
}

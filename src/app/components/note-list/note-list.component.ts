import { Component, OnInit, signal } from '@angular/core';
import { Note } from '../../core/models/note';
import { NoteService } from '../../core/services/note.service';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

@Component({
    selector: 'app-note-list',
    imports: [RouterLink, FormsModule],
    templateUrl: './note-list.component.html',
    styleUrl: './note-list.component.scss'
})
export class NoteListComponent implements OnInit {
  notes: Note[] = [];
  isLoading = signal<boolean>(false);
  error = signal<string>('');
  search = signal<string>('');
  private searchSubject = new Subject<string>();

  constructor(private noteService: NoteService) { }

  ngOnInit(): void {
    this.getNotes();
    this.searchSubject.pipe(debounceTime(300)).subscribe(searchTerm => {
      this.performSearch(searchTerm);
    });
  }

  getNotes(): void {
    this.isLoading.set(true);
    this.noteService.getNotes().subscribe({
      next: (notes) => {
        this.notes = notes.notes;
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error(error);
        this.isLoading.set(false);
        this.error.set(error?.error?.message || 'An error occurred');
      }
    });
  }

  searchNotes(): void {
    this.searchSubject.next(this.search());
  }

  private performSearch(searchTerm: string): void {
    if (searchTerm) {
      this.isLoading.set(true);
      this.noteService.searchNotes(searchTerm).subscribe({
        next: (notes) => {
          this.notes = notes;
          this.isLoading.set(false);
        },
        error: (error) => {
          console.error(error);
          this.isLoading.set(false);
          this.error.set(error?.error?.message || 'An error occurred');
        }
      });
    } else {
      this.getNotes();
    }
  }
}
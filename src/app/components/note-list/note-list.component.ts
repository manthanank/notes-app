import { Component, OnInit, signal } from '@angular/core';
import { Note } from '../../core/models/note';
import { NoteService } from '../../core/services/note.service';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

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

  constructor(private noteService: NoteService) { }

  ngOnInit(): void {
    this.getNotes();
  }

  getNotes(): void {
    this.isLoading.set(true);
    this.noteService.getNotes().subscribe({
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
  }

  searchNotes(): void {
    if (this.search()){
      this.isLoading.set(true);
      this.noteService.searchNotes(this.search()).subscribe({
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

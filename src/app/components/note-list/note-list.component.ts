import { Component, OnInit, signal } from '@angular/core';
import { Note } from '../../core/models/note';
import { NoteService } from '../../core/services/note.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-note-list',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './note-list.component.html',
  styleUrl: './note-list.component.scss'
})
export class NoteListComponent implements OnInit {
  notes: Note[] = [];
  isLoading = signal<boolean>(false);
  error = signal<string>('');

  constructor(private noteService: NoteService) { }

  ngOnInit(): void {
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
}

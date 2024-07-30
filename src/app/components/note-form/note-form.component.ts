import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Note } from '../../core/models/note';
import { NoteService } from '../../core/services/note.service';

@Component({
  selector: 'app-note-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './note-form.component.html',
  styleUrl: './note-form.component.scss',
})
export class NoteFormComponent implements OnInit {
  noteForm: FormGroup;
  isEditMode = false;
  noteId: string | null = null;

  constructor(
    private fb: FormBuilder,
    private noteService: NoteService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.noteForm = this.fb.group({
      title: ['', Validators.required],
      content: [''],
    });
  }

  ngOnInit(): void {
    this.noteId = this.route.snapshot.paramMap.get('id');
    if (this.noteId) {
      this.isEditMode = true;
      this.noteService.getNoteById(this.noteId).subscribe((note: Note) => {
        this.noteForm.patchValue(note);
      });
    }
  }

  onSubmit(): void {
    if (this.noteForm.invalid) {
      return;
    }

    const note: Note = this.noteForm.value;
    if (this.isEditMode && this.noteId) {
      this.noteService.updateNote(this.noteId, note).subscribe(() => {
        this.router.navigate(['/']);
      });
    } else {
      this.noteService.createNote(note).subscribe(() => {
        this.router.navigate(['/']);
      });
    }
  }
}

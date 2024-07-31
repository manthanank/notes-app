import { Component, inject, OnInit, signal } from '@angular/core';
import {
  FormGroup,
  FormBuilder,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
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
  isEditMode = signal<boolean>(false);
  noteId = signal<string>('');
  submitted = signal<boolean>(false);

  fb = inject(FormBuilder);
  noteService = inject(NoteService);
  router = inject(Router);
  route = inject(ActivatedRoute);

  constructor() {
    this.noteForm = this.fb.group({
      title: [
        '',
        [
          Validators.required,
          Validators.maxLength(50),
          Validators.minLength(3),
        ],
      ],
      content: ['', [Validators.required, Validators.maxLength(500)]],
    });
  }

  get title() {
    return this.noteForm.get('title');
  }

  get content() {
    return this.noteForm.get('content');
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id') || '';
    this.noteId.set(id);
    if (id) {
      this.isEditMode.set(true);
      this.noteService.getNoteById(id).subscribe((note: Note) => {
        this.noteForm.patchValue(note);
      });
    }
  }

  onSubmit(): void {
    this.submitted.set(true);
    if (this.noteForm.invalid) {
      return;
    }

    const note: Note = this.noteForm.value;
    if (this.isEditMode() && this.noteId()) {
      this.noteService.updateNote(this.noteId(), note).subscribe(() => {
        this.router.navigate(['/']);
      });
    } else {
      this.noteService.createNote(note).subscribe(() => {
        this.router.navigate(['/']);
      });
    }
  }
}

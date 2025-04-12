import { Component, inject, OnInit, signal } from '@angular/core';
import {
  FormGroup,
  FormBuilder,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { NoteService } from '../../core/services/note.service';
import { ToastService } from '../../core/services/toast.service';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-note-form',
  imports: [ReactiveFormsModule, NgClass],
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
  toastService = inject(ToastService);

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
    this.initializeRouteData();
  }

  private initializeRouteData(): void {
    const id = this.route.snapshot.paramMap.get('id') || '';
    this.noteId.set(id);
    if (id) {
      this.isEditMode.set(true);
      this.noteService.getNoteById(id).subscribe({
        next: (res) => {
          this.noteForm.patchValue({
            title: res.title,
            content: res.content
          });
        },
        error: (err) => {
          console.error(err);
          this.toastService.show('Failed to load note', 'error');
          this.router.navigate(['/notes']);
        },
      });
    }
  }

  onCancel(): void {
    if (this.isEditMode()) {
      this.router.navigate(['/note', this.noteId()]);
    } else {
      this.router.navigate(['/notes']);
    }
  }

  onSubmit(): void {
    this.submitted.set(true);
    if (this.noteForm.invalid) {
      return;
    }

    // Create an object with only the fields needed for create/update
    const noteData = {
      title: this.noteForm.value.title,
      content: this.noteForm.value.content
    };

    if (this.isEditMode() && this.noteId()) {
      this.noteService.updateNote(this.noteId(), noteData).subscribe({
        next: () => {
          this.router.navigate(['/note', this.noteId()]);
          this.toastService.show('Note updated successfully', 'success');
        },
        error: (err) => {
          console.error(err);
          this.toastService.show(
            err?.error?.message || 'Failed to update note',
            'error'
          );
        },
      });
    } else {
      this.noteService.createNote(noteData).subscribe({
        next: () => {
          this.router.navigate(['/notes']);
          this.toastService.show('Note created successfully', 'success');
        },
        error: (err) => {
          console.error(err);
          this.toastService.show(
            err?.error?.message || 'Failed to create note',
            'error'
          );
        },
      });
    }
  }
}

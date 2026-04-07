import { Component, inject, OnInit, signal } from '@angular/core';
import {
  FormGroup,
  FormBuilder,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { NoteService } from '../../core/services/note.service';
import { AiService } from '../../core/services/ai.service';
import { ToastService } from '../../core/services/toast.service';
import { NgClass } from '@angular/common';
import { MarkdownPipe } from '../../shared/pipes/markdown.pipe';

@Component({
  selector: 'app-note-form',
  imports: [ReactiveFormsModule, NgClass, MarkdownPipe],
  templateUrl: './note-form.component.html',
  styleUrl: './note-form.component.scss',
})
export class NoteFormComponent implements OnInit {
  noteForm: FormGroup;
  isEditMode = signal<boolean>(false);
  noteId = signal<string>('');
  submitted = signal<boolean>(false);
  
  // Note Form Modes
  activeTab = signal<'write' | 'preview'>('write');

  // AI Loading states

  isSummarizing = signal<boolean>(false);
  isGeneratingTags = signal<boolean>(false);

  fb = inject(FormBuilder);
  noteService = inject(NoteService);
  aiService = inject(AiService);
  router = inject(Router);
  route = inject(ActivatedRoute);
  toastService = inject(ToastService);

  constructor() {
    this.noteForm = this.fb.group({
      title: [
        '',
        [
          Validators.required,
          Validators.maxLength(100),
          Validators.minLength(3),
        ],
      ],
      content: ['', [Validators.required, Validators.maxLength(2000)]],
      summary: [''],
      tags: [[]]
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
        next: (res: any) => {
          this.noteForm.patchValue({
            title: res.title,
            content: res.content,
            summary: res.summary || '',
            tags: res.tags || []
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

  generateSummary(): void {
    const content = this.noteForm.value.content;
    if (!content || content.length < 20) {
      this.toastService.show('Content is too short to summarize', 'warning');
      return;
    }

    this.isSummarizing.set(true);
    this.aiService.summarize(content).subscribe({
      next: (res) => {
        this.noteForm.patchValue({ summary: res.summary });
        this.toastService.show('AI Summary generated!', 'success');
        this.isSummarizing.set(false);
      },
      error: () => {
        this.toastService.show('AI Summarization failed', 'error');
        this.isSummarizing.set(false);
      }
    });
  }

  generateTags(): void {
    const { title, content } = this.noteForm.value;
    if (!content) {
      this.toastService.show('Content is required for tags', 'warning');
      return;
    }

    this.isGeneratingTags.set(true);
    this.aiService.generateTags(title, content).subscribe({
      next: (res) => {
        this.noteForm.patchValue({ tags: res.tags });
        this.toastService.show('Magic Tags generated!', 'success');
        this.isGeneratingTags.set(false);
      },
      error: () => {
        this.toastService.show('AI Tag generation failed', 'error');
        this.isGeneratingTags.set(false);
      }
    });
  }

  removeTag(index: number): void {
    const currentTags = [...this.noteForm.value.tags];
    currentTags.splice(index, 1);
    this.noteForm.patchValue({ tags: currentTags });
  }

  onCancel(): void {
    if (this.isEditMode()) {
      this.router.navigate(['/notes']);
    } else {
      this.router.navigate(['/notes']);
    }
  }

  onSubmit(): void {
    this.submitted.set(true);
    if (this.noteForm.invalid) {
      return;
    }

    const noteData = this.noteForm.value;

    if (this.isEditMode() && this.noteId()) {
      this.noteService.updateNote(this.noteId(), noteData).subscribe({
        next: () => {
          this.router.navigate(['/notes']);
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


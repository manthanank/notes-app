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
import { NgClass, DatePipe } from '@angular/common';
import { MarkdownPipe } from '../../shared/pipes/markdown.pipe';
import { HostListener } from '@angular/core';
import { debounceTime } from 'rxjs/operators';
import { Note } from '../../core/models/note';

@Component({
  selector: 'app-note-form',
  imports: [ReactiveFormsModule, NgClass, MarkdownPipe, DatePipe],
  templateUrl: './note-form.component.html',
  styleUrl: './note-form.component.scss',
})
export class NoteFormComponent implements OnInit {
  noteForm: FormGroup;
  isEditMode = signal<boolean>(false);
  noteId = signal<string>('');
  note = signal<Note | null>(null);
  submitted = signal<boolean>(false);
  lastSaved = signal<Date | null>(null);
  isSaving = signal<boolean>(false);
  isAutoSaving = signal<boolean>(false);
  lastSavedAt = signal<Date | null>(null);
  activeTab = signal<'write' | 'preview'>('write');
  showVersions = signal<boolean>(false);
  
  // AI Loading states
  isSummarizing = signal<boolean>(false);
  isGeneratingTags = signal<boolean>(false);
  isContinuing = signal<boolean>(false);
  isExtractingTasks = signal<boolean>(false);

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
      tags: [[]],
      folder: ['General'],
      reminderDate: ['']
    });
  }

  get title() {
    return this.noteForm.get('title');
  }

  get content() {
    return this.noteForm.get('content');
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's') {
      event.preventDefault();
      this.onSubmit();
    }
  }

  ngOnInit(): void {
    this.initializeRouteData();
    this.setupAutosave();
  }

  private setupAutosave(): void {
    this.noteForm.valueChanges
      .pipe(debounceTime(2000))
      .subscribe((formValue) => {
        if (this.noteForm.invalid) return; // Don't autosave invalid forms
        
        if (this.isEditMode() && this.noteId()) {
          this.isSaving.set(true);
          this.noteService.updateNote(this.noteId(), formValue as Partial<Note>).subscribe({
            next: () => {
              this.lastSaved.set(new Date());
              this.isSaving.set(false);
            },
            error: () => {
              this.isSaving.set(false);
              // Silently fail or show subtle indicator
            }
          });
        } else {
          // For new notes, save to local storage as draft
          localStorage.setItem('note_draft', JSON.stringify(formValue));
          this.lastSaved.set(new Date());
        }
      });
  }

  private initializeRouteData(): void {
    const id = this.route.snapshot.paramMap.get('id') || '';
    this.noteId.set(id);
    if (id) {
      this.isEditMode.set(true);
      this.noteService.getNoteById(id).subscribe({
        next: (res: any) => {
          this.note.set(res);
          this.noteForm.patchValue({
            title: res.title,
            content: res.content,
            summary: res.summary || '',
            tags: res.tags || [],
            folder: res.folder || 'General',
            reminderDate: res.reminderDate ? new Date(res.reminderDate).toISOString().slice(0, 16) : ''
          }, { emitEvent: false }); // Prevent triggering autosave on initial load
        },
        error: (err) => {
          console.error(err);
          this.toastService.show('Failed to load note', 'error');
          this.router.navigate(['/notes']);
        },
      });
    } else {
      // Check for draft
      const draft = localStorage.getItem('note_draft');
      if (draft) {
        try {
          const parsedDraft = JSON.parse(draft);
          this.noteForm.patchValue(parsedDraft, { emitEvent: false });
          this.toastService.show('Draft restored', 'info');
        } catch (e) {
          localStorage.removeItem('note_draft');
        }
      }
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
        this.toastService.show('Tags generated successfully!', 'success');
        this.isGeneratingTags.set(false);
      },
      error: (err) => {
        this.isGeneratingTags.set(false);
        this.toastService.show('Failed to generate tags. Please try again.', 'error');
      }
    });
  }

  continueWriting(): void {
    const content = this.noteForm.get('content')?.value;
    if (!content) {
      this.toastService.show('Write some content first to use AI Continuation.', 'info');
      return;
    }
    
    this.isContinuing.set(true);
    this.aiService.continueWriting(content).subscribe({
      next: (res: any) => {
        if (res && res.continuation) {
          const currentContent = this.noteForm.get('content')?.value || '';
          this.noteForm.patchValue({ content: currentContent + '\n\n' + res.continuation });
          this.toastService.show('AI continued your note!', 'success');
        }
        this.isContinuing.set(false);
      },
      error: (err: any) => {
        this.isContinuing.set(false);
        this.toastService.show('Failed to continue writing.', 'error');
      }
    });
  }

  extractActionItems(): void {
    const content = this.noteForm.get('content')?.value;
    if (!content) {
      this.toastService.show('Write some content first to extract action items.', 'info');
      return;
    }
    
    this.isExtractingTasks.set(true);
    this.aiService.extractActionItems(content).subscribe({
      next: (res: any) => {
        if (res && res.actionItems) {
          const currentContent = this.noteForm.get('content')?.value || '';
          this.noteForm.patchValue({ content: currentContent + '\n\n### Action Items\n' + res.actionItems });
          this.toastService.show('Action items extracted!', 'success');
        }
        this.isExtractingTasks.set(false);
      },
      error: (err: any) => {
        this.isExtractingTasks.set(false);
        this.toastService.show('Failed to extract action items.', 'error');
      }
    });
  }

  removeTag(index: number): void {
    const currentTags = [...this.noteForm.value.tags];
    currentTags.splice(index, 1);
    this.noteForm.patchValue({ tags: currentTags });
  }

  addManualTag(event: Event): void {
    event.preventDefault();
    const input = event.target as HTMLInputElement;
    const value = input.value.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
    
    if (value) {
      const currentTags = this.noteForm.value.tags || [];
      if (!currentTags.includes(value)) {
        this.noteForm.patchValue({ tags: [...currentTags, value] });
      }
      input.value = '';
    }
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
          localStorage.removeItem('note_draft');
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

  exportNote(format: 'markdown' | 'json'): void {
    const note = this.noteForm.value;
    let content = '';
    let filename = '';
    let mimeType = '';

    if (format === 'markdown') {
      content = `# ${note.title}\n\n`;
      content += `**Folder:** ${note.folder}\n\n`;
      if (note.tags && note.tags.length > 0) {
        content += `**Tags:** ${note.tags.map((t: string) => `#${t}`).join(' ')}\n\n`;
      }
      if (note.summary) {
        content += `> **Summary:** ${note.summary}\n\n`;
      }
      content += `---\n\n${note.content}`;
      filename = `${note.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.md`;
      mimeType = 'text/markdown';
    } else if (format === 'json') {
      content = JSON.stringify(note, null, 2);
      filename = `${note.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.json`;
      mimeType = 'application/json';
    }

    const blob = new Blob([content], { type: mimeType });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    this.toastService.show(`Note exported as ${format.toUpperCase()}`, 'success');
  }

  applyFormatting(type: string): void {
    const textarea = document.getElementById('note-content') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);
    let newText = '';
    let selectionStartOffset = 0;
    let selectionEndOffset = 0;

    switch (type) {
      case 'bold':
        newText = `**${selectedText || 'bold text'}**`;
        selectionStartOffset = 2;
        selectionEndOffset = newText.length - 2;
        break;
      case 'italic':
        newText = `*${selectedText || 'italic text'}*`;
        selectionStartOffset = 1;
        selectionEndOffset = newText.length - 1;
        break;
      case 'h1':
        newText = `\n# ${selectedText || 'Heading'}\n`;
        selectionStartOffset = 3;
        selectionEndOffset = newText.length - 1;
        break;
      case 'h2':
        newText = `\n## ${selectedText || 'Heading'}\n`;
        selectionStartOffset = 4;
        selectionEndOffset = newText.length - 1;
        break;
      case 'quote':
        newText = `\n> ${selectedText || 'quote'}\n`;
        selectionStartOffset = 3;
        selectionEndOffset = newText.length - 1;
        break;
      case 'code':
        newText = `\n\`\`\`\n${selectedText || 'code'}\n\`\`\`\n`;
        selectionStartOffset = 5;
        selectionEndOffset = newText.length - 5;
        break;
      case 'link':
        newText = `[${selectedText || 'link text'}](https://)`;
        selectionStartOffset = 1;
        selectionEndOffset = selectedText ? selectedText.length + 1 : 10;
        break;
      case 'ul':
        newText = `\n- ${selectedText || 'list item'}`;
        selectionStartOffset = 3;
        selectionEndOffset = newText.length;
        break;
      case 'ol':
        newText = `\n1. ${selectedText || 'list item'}`;
        selectionStartOffset = 4;
        selectionEndOffset = newText.length;
        break;
      case 'check':
        newText = `\n- [ ] ${selectedText || 'task'}`;
        selectionStartOffset = 7;
        selectionEndOffset = newText.length;
        break;
    }

    const currentValue = this.noteForm.get('content')?.value || '';
    const newValue = currentValue.substring(0, start) + newText + currentValue.substring(end);
    
    this.noteForm.patchValue({ content: newValue });
    
    // Set cursor position back
    setTimeout(() => {
      textarea.focus();
      if (!selectedText) {
         textarea.setSelectionRange(start + selectionStartOffset, start + selectionEndOffset);
      } else {
         textarea.setSelectionRange(start + newText.length, start + newText.length);
      }
    }, 0);
  }

  restoreVersion(version: any): void {
    if (confirm('Are you sure you want to restore this version? Your current changes will be lost.')) {
      this.noteForm.patchValue({
        title: version.title,
        content: version.content,
        summary: version.summary
      });
      this.showVersions.set(false);
      this.toastService.show('Version restored. Saving...', 'success');
      this.onSubmit(); // Auto save immediately to commit the restore
    }
  }
}

